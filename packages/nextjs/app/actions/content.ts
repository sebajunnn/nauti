"use server";

import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import deployedContracts from "@/contracts/deployedContracts";
import scaffoldConfig from "@/scaffold.config";

interface ContentData {
    content: string;
    image: string | null;
    name?: string;
    description?: string;
}

// Create a singleton public client instance
const publicClient = createPublicClient({
    chain: scaffoldConfig.targetNetworks[0],
    transport: http(),
    cacheTime: 5000, // Cache responses for 5 seconds
    batch: {
        multicall: true, // Enable multicall for batch requests
    },
});

const decodeBase64TokenURI = (tokenURI: string): ContentData => {
    try {
        // Remove the "data:application/json;base64," prefix
        const base64Json = tokenURI.replace("data:application/json;base64,", "");

        // Decode base64 to get the JSON string
        const jsonString = Buffer.from(base64Json, "base64").toString();

        // Sanitize the JSON string by properly escaping line breaks and other control characters
        const sanitizedJson = jsonString
            .replace(/\n/g, "\\n") // Replace newlines with \n
            .replace(/\r/g, "\\r") // Replace carriage returns with \r
            .replace(/\t/g, "\\t") // Replace tabs with \t
            .replace(/[\u0000-\u001F]+/g, (match) =>
                Array.from(match)
                    .map((char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`)
                    .join("")
            );

        // Parse the sanitized JSON
        const metadata = JSON.parse(sanitizedJson);

        // Extract the HTML content from animation_url
        const htmlBase64 = metadata.animation_url.replace("data:text/html;base64,", "");
        const content = Buffer.from(htmlBase64, "base64").toString();

        return {
            content,
            image: metadata.image || null,
            name: metadata.name,
            description: metadata.description,
        };
    } catch (error) {
        console.error("Error decoding token URI:", error);
        // Return a fallback object
        return {
            content: "<h1>Error: Could not load content</h1>",
            image: null,
            name: "Error",
            description: "Failed to load content",
        };
    }
};

async function getChainContent(index: number): Promise<ContentData | null> {
    try {
        const chainData = await publicClient.readContract({
            address: deployedContracts[scaffoldConfig.targetNetworks[0].id].OnchainWebServer_v8
                .address as `0x${string}`,
            functionName: "tokenURI",
            abi: deployedContracts[scaffoldConfig.targetNetworks[0].id].OnchainWebServer_v8.abi,
            args: [BigInt(index)],
        });
        const metadata = decodeBase64TokenURI(chainData);

        return {
            content: metadata.content,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
        };
    } catch (error) {
        return null;
    }
}

async function getApiContent(index: number): Promise<ContentData> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/content?index=${index}`);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`API request failed with status ${res.status}: ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error(`Failed to fetch content for index ${index}:`, error);
        throw new Error(
            `Failed to fetch content for index ${index}: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

export async function getContent(index: number): Promise<ContentData> {
    // Try blockchain first
    const chainContent = await getChainContent(index);
    if (chainContent) {
        return chainContent;
    }

    // Fallback to API if blockchain fails
    return getApiContent(index);
}

// New batch content fetch function
export async function getBatchContent(indices: number[]): Promise<Record<number, ContentData>> {
    try {
        // Try blockchain first using multicall
        const chainDataPromises = indices.map((index) =>
            publicClient.readContract({
                address: deployedContracts[scaffoldConfig.targetNetworks[0].id].OnchainWebServer_v8
                    .address as `0x${string}`,
                functionName: "tokenURI",
                abi: deployedContracts[scaffoldConfig.targetNetworks[0].id].OnchainWebServer_v8.abi,
                args: [BigInt(index)],
            })
        );

        const results = await Promise.allSettled(chainDataPromises);
        const contentMap: Record<number, ContentData> = {};

        // Process results and prepare API fallback array
        const fallbackIndices: number[] = [];

        results.forEach((result, idx) => {
            if (result.status === "fulfilled") {
                const metadata = decodeBase64TokenURI(result.value);
                contentMap[indices[idx]] = {
                    content: metadata.content,
                    name: metadata.name,
                    description: metadata.description,
                    image:
                        !metadata.image || metadata.image === ""
                            ? "https://i.pinimg.com/736x/ce/25/20/ce2520ca22bc5317176c18b437928525.jpg"
                            : metadata.image,
                };
            } else {
                fallbackIndices.push(indices[idx]);
            }
        });

        // If any failed, try API fallback
        if (fallbackIndices.length > 0) {
            const apiPromises = fallbackIndices.map((index) => getApiContent(index));
            const apiResults = await Promise.allSettled(apiPromises);

            apiResults.forEach((result, idx) => {
                if (result.status === "fulfilled") {
                    contentMap[fallbackIndices[idx]] = result.value;
                }
            });
        }

        return contentMap;
    } catch (error) {
        console.error("Batch fetch failed:", error);
        throw new Error("Failed to fetch batch content");
    }
}

export async function getTotalSupply(): Promise<number> {
    try {
        const totalSupply = await publicClient.readContract({
            address: deployedContracts[scaffoldConfig.targetNetworks[0].id].OnchainWebServer_v8
                .address as `0x${string}`,
            functionName: "totalSupply",
            abi: deployedContracts[scaffoldConfig.targetNetworks[0].id].OnchainWebServer_v8.abi,
        });

        // We subtract 1 since the total supply includes token ID 0 which is not used
        return Number(totalSupply) - 1;
    } catch (error) {
        console.error("Error fetching total supply:", error);
        return 0;
    }
}

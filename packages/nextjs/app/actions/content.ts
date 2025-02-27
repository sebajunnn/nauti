"use server";

import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import deployedContracts from "@/contracts/deployedContracts";

interface ContentData {
    content: string;
    image: string | null;
    name?: string;
    description?: string;
}

// Create a singleton public client instance
const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
    cacheTime: 5000, // Cache responses for 5 seconds
    batch: {
        multicall: true, // Enable multicall for batch requests
    },
});

async function getChainContent(index: number): Promise<ContentData | null> {
    try {
        const chainData = await publicClient.readContract({
            address: deployedContracts[31337].OnchainWebServer_v8.address as `0x${string}`,
            functionName: "getPage",
            abi: deployedContracts[31337].OnchainWebServer_v8.abi,
            args: [BigInt(index)],
        });

        return {
            content: chainData.content,
            image: "https://i.pinimg.com/736x/ce/25/20/ce2520ca22bc5317176c18b437928525.jpg",
            name: chainData.name,
            description: chainData.description,
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
            `Failed to fetch content for index ${index}: ${error instanceof Error ? error.message : "Unknown error"
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
                address: deployedContracts[31337].OnchainWebServer_v8.address as `0x${string}`,
                functionName: "getPage",
                abi: deployedContracts[31337].OnchainWebServer_v8.abi,
                args: [BigInt(index)],
            })
        );

        const results = await Promise.allSettled(chainDataPromises);
        const contentMap: Record<number, ContentData> = {};

        // Process results and prepare API fallback array
        const fallbackIndices: number[] = [];

        results.forEach((result, idx) => {
            if (result.status === "fulfilled") {
                contentMap[indices[idx]] = {
                    content: result.value.content,
                    image: "https://i.pinimg.com/736x/ce/25/20/ce2520ca22bc5317176c18b437928525.jpg",
                    name: result.value.name,
                    description: result.value.description,
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

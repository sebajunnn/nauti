import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { useTargetNetwork } from "@/hooks";
import deployedContracts from "@/contracts/deployedContracts";

interface ContentData {
    content: string;
    image: string | null;
    name?: string;
    description?: string;
}

export function useContentFetch(index: number) {
    const [data, setData] = useState<ContentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { targetNetwork } = useTargetNetwork();

    // First try to fetch from blockchain
    const { data: chainData, isError: isChainError } = useReadContract({
        address: deployedContracts[31337].OnchainWebServer_v5.address,
        functionName: "getPage",
        abi: deployedContracts[31337].OnchainWebServer_v5.abi,
        args: [BigInt(index)],
        chainId: targetNetwork.id,
        query: {
            enabled: true,
            retry: false,
        },
    });

    useEffect(() => {
        // If we have chain data, use it
        if (chainData) {
            setData({
                content: chainData.content,
                image: null, // Chain data doesn't include images yet
                name: chainData.name,
                description: chainData.description,
            });
            setLoading(false);
            setError(null);
            return;
        }

        // If chain fetch failed or returned no data, try API
        if (isChainError || !chainData) {
            const fetchData = async () => {
                try {
                    const res = await fetch(`/api/content?index=${index}`);
                    if (!res.ok) throw new Error("Failed to fetch content");
                    const apiData = await res.json();
                    setData(apiData);
                } catch (error) {
                    console.error("Failed to fetch content:", error);
                    setError(error instanceof Error ? error : new Error("Failed to fetch content"));
                    setData(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [chainData, isChainError, index]);

    return { data, loading, error };
}

"use client";

import { useState, useEffect } from "react";
import deployedContracts from "../contracts/deployedContracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useReadContract } from "wagmi";
import { useTargetNetwork } from "@/hooks";
import Image from "next/image";
export default function PageView() {
    const [content, setContent] = useState("<h1>Hello, Web3!</h1>");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [pageId, setPageId] = useState(0);
    const { targetNetwork } = useTargetNetwork();

    const { isFetching, refetch, error, data } = useReadContract({
        address: deployedContracts[targetNetwork.id].OnchainWebServerMetadata_v2.address,
        functionName: "pages",
        abi: deployedContracts[targetNetwork.id].OnchainWebServerMetadata_v2.abi,
        args: [BigInt(pageId)],
        chainId: targetNetwork.id,
        query: {
            enabled: true,
            retry: false,
        },
    });

    useEffect(() => {
        if (data) {
            setContent(data[0]);
            setName(data[1]);
            setDescription(data[2]);
            setImageUrl(data[3]);
        }
    }, [data]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-2xl font-bold">View Web3 Page</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={pageId}
                                onChange={(e) => setPageId(Number(e.target.value))}
                                className="w-24"
                                placeholder="Page ID"
                                min="0"
                            />
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    const { data } = await refetch();
                                    if (data) {
                                        setContent(data.content);
                                        setName(data.name);
                                        setDescription(data.description);
                                    }
                                }}
                                disabled={isFetching}
                            >
                                {isFetching ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Load Page"
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {error instanceof Error ? error.message : "An error occurred"}
                            </AlertDescription>
                        </Alert>
                    )}

                    {name && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{name}</h3>
                            {description && <p className="text-muted-foreground">{description}</p>}
                        </div>
                    )}

                    {imageUrl && (
                        <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                            <Image src={imageUrl} alt="Preview" className="w-full h-full" width={1024} height={1024} />
                        </div>
                    )}

                    <Card className="bg-background">
                        <CardContent className="p-0 aspect-square">
                            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                                <iframe
                                    srcDoc={content}
                                    className="w-full h-full border-0"
                                    title="preview"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}

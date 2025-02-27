"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X, Maximize2, Minimize2 } from "lucide-react";

import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ContentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pageId?: number;
    content?: string;
    name?: string;
    description?: string;
}

export function ContentModal({
    open,
    onOpenChange,
    pageId = 0,
    content = "<h1>Hello, Web3!</h1>",
    name = "",
    description = "",
}: ContentModalProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className={cn("bg-black/20 backdrop-brightness-125")} />
            <DialogContent
                className={cn(
                    "max-w-4xl h-[90vh] flex flex-col",
                    "p-0 gap-0 font-redaction [&>button]:hidden",
                    "border-0 bg-foreground text-background",
                    "!rounded-3xl overflow-hidden",
                    isFullscreen && "!max-w-[calc(100vw-1rem)] !h-[calc(100vh-1rem)]"
                )}
            >
                <DialogHeader
                    className={cn(
                        "flex flex-row px-2 py-0 m-0",
                        "flex-none bg-foreground h-fit",
                        "backdrop-brightness-125 space-y-0",
                        "relative justify-end"
                    )}
                >
                    <DialogTitle
                        className={cn(
                            "text-base text-background/80 leading-8",
                            "text-center font-rubik font-medium",
                            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                            "w-fit whitespace-nowrap px-4"
                        )}
                    >
                        {name || "Web3 Page"}
                    </DialogTitle>
                    <div
                        className={cn(
                            "flex flex-row items-center",
                            "justify-end h-full",
                            "gap-1 flex-shrink-0 py-2"
                        )}
                    >
                        <div
                            className={cn(
                                "flex items-center bg-background/30 rounded-full px-3",
                                "text-sm font-medium text-background/90 font-rubik h-5"
                            )}
                        >
                            id: {pageId}
                        </div>
                        <Button
                            className={cn(
                                "rounded-full aspect-square h-5",
                                "p-1 min-w-0 bg-accent text-background",
                                "hover:bg-accent/60 transition-colors duration-200"
                            )}
                            onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-3 w-3 scale-90" />
                            ) : (
                                <Maximize2 className="h-3 w-3 scale-90" />
                            )}
                        </Button>
                        <Button
                            variant="destructive"
                            className={cn("rounded-full aspect-square h-5", "p-1 min-w-0")}
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    <div className="w-full h-full bg-white overflow-hidden">
                        <iframe
                            srcDoc={`
                                <style>
                                    ::-webkit-scrollbar { display: none; }
                                    * { -ms-overflow-style: none; scrollbar-width: none; }
                                    html, body { margin: 0; padding: 0; }
                                </style>
                                ${content}
                            `}
                            className="w-full h-full border-0 [&::-webkit-scrollbar]:hidden"
                            title="preview"
                            sandbox="allow-scripts allow-same-origin"
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

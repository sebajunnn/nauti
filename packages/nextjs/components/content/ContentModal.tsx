"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X, Maximize2, Minimize2, Menu, Share2, Download, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

const defaultContent = `
        <style>
            body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #d9d9d9;
                font-family: system-ui, -apple-system, sans-serif;
            }
            h1 {
                color: #666;
                font-weight: 400;
            }
        </style>
        <h4>No content minted</h4>
    `;

export function ContentModal({
    open,
    onOpenChange,
    pageId = 0,
    content,
    name = "",
    description = "",
}: ContentModalProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsFullscreen(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className={cn("bg-black/20 backdrop-brightness-125")} />
            <DialogContent
                className={cn(
                    "max-w-4xl h-[calc(100vh-3rem)] flex flex-col",
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
                        "relative justify-between"
                    )}
                >
                    <div className="flex items-center gap-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className={cn(
                                        "rounded-full aspect-square h-5",
                                        "p-1 min-w-0 bg-accent text-background",
                                        "hover:bg-primary hover:text-accent transition-colors duration-200"
                                    )}
                                >
                                    <Menu className="h-3 w-3" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-72 bg-foreground text-background rounded-xl border-0"
                                align="start"
                                sideOffset={12}
                            >
                                {description && (
                                    <div className="mb-3 px-2">
                                        <h4 className="text-sm font-medium mb-1">Description</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {description}
                                        </p>
                                    </div>
                                )}
                                <div className="mb-3 px-2">
                                    <h4 className="text-sm font-medium mb-1">More Metadata</h4>
                                    <p className="text-sm text-muted-foreground">...</p>
                                </div>
                                <div className="flex flex-row gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start gap-2 rounded-xl"
                                        onClick={() => {}}
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start gap-2 rounded-xl"
                                        onClick={() => {}}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start gap-2 rounded-xl"
                                        onClick={() => {}}
                                    >
                                        <Info className="h-4 w-4" />
                                        Details
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div
                            className={cn(
                                "flex items-center bg-background/50 rounded-full px-3",
                                "text-sm font-medium text-background/90 font-rubik h-5"
                            )}
                        >
                            id: {pageId}
                        </div>
                    </div>
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
                        <Button
                            className={cn(
                                "rounded-full aspect-square h-5",
                                "p-1 min-w-0 bg-chart-2 text-chart-4",
                                "hover:bg-chart-4 transition-colors duration-200",
                                "hover:text-chart-2"
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
                            className={cn(
                                "rounded-full aspect-square h-5",
                                "p-1 min-w-0 bg-chart-5 text-white",
                                "hover:bg-chart-1 transition-colors duration-200",
                                "hover:text-chart-5"
                            )}
                            onClick={() => {
                                onOpenChange(false);
                            }}
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
                                ${content?.trim() || defaultContent}
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

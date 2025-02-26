"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    console.log("content", content);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 font-redaction">
                <DialogHeader className="px-6 py-2 flex-none border-b">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <DialogTitle className="text-xl font-[350]">
                                {name || "Web3 Page"}
                            </DialogTitle>
                            <div className="flex items-center gap-2"></div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    {description && (
                        <DialogDescription className="text-sm mt-1">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-auto p-6">
                    <Card className="bg-background h-full">
                        <CardContent className="p-0 h-full">
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
                </div>
            </DialogContent>
        </Dialog>
    );
}

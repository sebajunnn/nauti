"use client";

import { Settings } from "lucide-react";
import { useSpiralStore } from "@/stores/useSpiralStore";
import { useSquareStore } from "@/stores/useSquareStore";
import { useState } from "react";
import { SearchInput } from "./SearchInput";
import { IndexState } from "./IndexState";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RainbowKitCustomConnectButton } from "@/components/RainbowKitCustomConnectButton";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function Navbar() {
    const router = useRouter();
    const { zoomDepth, setResetTargetScale } = useSpiralStore();
    const { squares } = useSquareStore();
    const [showIndex, setShowIndex] = useState(false);

    const handleReset = () => {
        setResetTargetScale(true);
        router.push("/");
    };

    // bg-[hsl(222,88%,10%)]
    return (
        <div className="absolute top-7 right-7 z-10 select-none">
            <div
                className={cn(
                    "h-full bg-primary-foreground text-primary rounded-xl overflow-hidden antialiased"
                )}
            >
                <Accordion type="single" collapsible defaultValue="index-state">
                    <AccordionItem value="index-state" className="border-none h-full group/nav">
                        <div className="flex flex-col">
                            <div
                                className={cn(
                                    "flex items-center gap-0 h-full bg-none",
                                    "transition-colors duration-200 ease-in-out"
                                )}
                            >
                                <button
                                    className={cn(
                                        "flex items-center gap-2 h-8",
                                        "pl-4 pr-3",
                                        "bg-background hover:bg-chart-1",
                                        "text-black hover:text-foreground",
                                        "transition-colors duration-200 ease-in-out"
                                    )}
                                    onClick={handleReset}
                                >
                                    <h1
                                        className={cn(
                                            "translate-y-[1px] text-3xl leading-none",
                                            "font-redaction font-[200] text-bold "
                                        )}
                                    >
                                        Nauti
                                    </h1>
                                </button>
                                <div
                                    className={cn(
                                        "flex items-center gap-2",
                                        "pl-3 pr-2 h-full bg-primary-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-1 text-primary translate-y-[1px] pr-1">
                                        <Image
                                            src="/nauti-logo-y.svg"
                                            alt="Nauti Logo"
                                            width={16}
                                            height={16}
                                            className="text-primary"
                                        />
                                        <span className="text-base min-w-2">{zoomDepth}</span>
                                    </div>
                                    <SearchInput className="min-w-28 h-6" />
                                    <div className="group">
                                        <AccordionTrigger className="py-2">
                                            <div className="flex flex-col items-start gap-0"></div>
                                        </AccordionTrigger>
                                        <div
                                            className={cn(
                                                "h-0 group-hover:h-6 transition-all duration-200 overflow-hidden",
                                                "absolute left-0 right-0 top-5 -z-10 bg-accent rounded-b-xl"
                                            )}
                                        >
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-[0.8rem] text-bold text-primary translate-y-[5px]">
                                                    +
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <AccordionContent className="px-4 py-2 bg-accent">
                            <div>
                                <div
                                    className={cn(
                                        "flex flex-row gap-2 justify-between",
                                        showIndex && "pb-4"
                                    )}
                                >
                                    <div className="flex flex-row gap-2">
                                        <Link
                                            href="/buildpage"
                                            className={cn(
                                                "bg-primary text-primary-foreground px-2 rounded-full",
                                                "hover:bg-chart-3 hover:text-background",
                                                "transition-colors duration-200 ease-in-out",
                                                "text-sm font-medium"
                                            )}
                                        >
                                            Publish
                                        </Link>
                                        <Link
                                            href="/updatepage"
                                            className={cn(
                                                "bg-primary text-primary-foreground px-2 rounded-full",
                                                "hover:bg-chart-3 hover:text-background",
                                                "transition-colors duration-200 ease-in-out",
                                                "text-sm font-medium"
                                            )}
                                        >
                                            Update
                                        </Link>
                                    </div>
                                    <RainbowKitCustomConnectButton />

                                    {/* <button
                                        onClick={() => setShowIndex(!showIndex)}
                                        data-state={showIndex ? "on" : "off"}
                                        className={cn(
                                            "bg-primary text-primary-foreground px-2 rounded-full",
                                            "hover:bg-chart-3 hover:text-background",
                                            "transition-colors duration-200 ease-in-out",
                                            "text-sm font-medium",
                                            "flex items-center gap-1"
                                            // "data-[state=on]:bg-chart-3 data-[state=on]:text-background"
                                        )}
                                    >
                                        Debug
                                        <Settings size={14} className="" />
                                    </button> */}
                                </div>
                            </div>

                            {showIndex && <IndexState squares={squares} />}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}

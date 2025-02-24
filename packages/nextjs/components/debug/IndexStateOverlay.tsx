import { useState } from "react";
import { SpiralSquare } from "@/types/golden-spiral";
import { useSquareStore } from "@/stores/useSquareStore";
import { ChevronDown, ChevronUp } from "lucide-react";

export function IndexStateOverlay({ squares }: { squares: SpiralSquare[] }) {
    const [isOpen, setIsOpen] = useState(true);
    const { isSquareVisible, getIndex } = useSquareStore();

    return (
        <div className="absolute top-7 right-7 z-10">
            <div
                className="bg-background text-foreground rounded-xl overflow-hidden shadow-lg"
                style={{ maxHeight: isOpen ? "fit-content" : "48px" }}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-neutral-800/50"
                >
                    <span className="text-xs">Index State</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <div
                    className={`overflow-auto transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-fit py-2" : "max-h-0"
                    }`}
                    style={{
                        msOverflowStyle: "none", // IE and Edge
                        scrollbarWidth: "none", // Firefox
                        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
                    }}
                >
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    <div className="px-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {squares.map((square) => (
                                <div
                                    key={square.id}
                                    className="flex items-center justify-start gap-2 text-xs bg-background/30 rounded-lg"
                                >
                                    <div
                                        className={`flex items-center gap-2 w-8 justify-center rounded-full ${
                                            isSquareVisible(square.id)
                                                ? "bg-green-500/70"
                                                : "bg-red-500/30"
                                        }`}
                                    >
                                        <span>#{square.id}</span>
                                    </div>
                                    <span className="opacity-70 pr-4">{getIndex(square.id)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

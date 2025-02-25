import { useState } from "react";
import { SpiralSquare } from "@/types/golden-spiral";
import { useSquareStore } from "@/stores/useSquareStore";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useSpiralStore } from "@/stores/useSpiralStore";

export function IndexStateOverlay({
    squares,
    handleReset,
}: {
    squares: SpiralSquare[];
    handleReset: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { isSquareVisible, getIndex } = useSquareStore();
    const { zoomDepth } = useSpiralStore();

    return (
        <div className="absolute top-7 right-7 z-10">
            <div
                className="gap-0 bg-background text-foreground rounded-2xl overflow-hidden shadow-lg"
                style={{ maxHeight: isOpen ? "fit-content" : "48px" }}
            >
                <div className="flex items-center justify-between">
                    <button className="px-4 py-3 hover:bg-neutral-800/50" onClick={handleReset}>
                        <RefreshCw size={20} className="text-neutral-400" />
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full px-4 py-2 flex items-center justify-between hover:bg-neutral-800/50"
                    >
                        <div className="flex flex-col items-start gap-0">
                            <span className="text-xs">Index State</span>
                            <span className="text-xs opacity-50">Depth: {zoomDepth}</span>
                        </div>
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

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

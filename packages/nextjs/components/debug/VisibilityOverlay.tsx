import { cn } from "@/lib/utils";
import { useSquareStore } from "@/stores/useSquareStore";
import { SpiralSquare } from "@/types/golden-spiral";

export function VisibilityOverlay({ squares }: { squares: SpiralSquare[] }) {
    const { squareMap } = useSquareStore();

    return (
        <div className="absolute top-7 right-7 z-10 w-48 bg-background/50 backdrop-blur-sm p-2 rounded-xl pointer-events-none">
            <h3 className="text-xs font-semibold mb-1">Visibility</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 max-h-screen overflow-y-auto text-[10px]">
                {squares.map((square) => {
                    const squareState = squareMap.get(square.id);
                    return (
                        <div
                            key={square.id}
                            className="flex items-center justify-between p-0.5 rounded bg-background/30"
                        >
                            <span>
                                #{square.id} ( i: {squareState?.index ?? "?"} )
                            </span>
                            <span
                                className={cn(
                                    "px-1.5 rounded",
                                    squareState?.isVisible
                                        ? "bg-green-500/20 text-green-300"
                                        : "bg-red-500/20 text-red-300"
                                )}
                            >
                                {squareState?.isVisible ? "✓" : "×"}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

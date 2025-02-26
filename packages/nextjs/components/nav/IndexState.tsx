import { SpiralSquare } from "@/types/golden-spiral";
import { useSquareStore } from "@/stores/useSquareStore";
import { cn } from "@/lib/utils";

interface IndexStateProps {
    squares: SpiralSquare[];
}

export function IndexState({ squares }: IndexStateProps) {
    const { isSquareVisible, getIndex } = useSquareStore();

    return (
        <div className={cn("grid grid-cols-3 gap-x-4 gap-y-1 max-h-[50vh] pb-1")}>
            {squares.map((square) => (
                <div
                    key={square.id}
                    className={cn(
                        "flex items-center justify-between p-1 gap-1",
                        "text-[0.6rem] font-black tracking-tight",
                        "text-chart-3/70 bg-chart-3/15 rounded-full"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center gap-2 w-8 justify-center rounded-full",
                            isSquareVisible(square.id) ? "bg-green-500" : "bg-red-500"
                        )}
                    >
                        <span>#{square.id}</span>
                    </div>
                    <span className="pr-3">{getIndex(square.id)}</span>
                </div>
            ))}
        </div>
    );
}

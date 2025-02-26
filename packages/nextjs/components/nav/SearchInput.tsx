import { cn } from "@/lib/utils";
import { useSpiralStore } from "@/stores/useSpiralStore";
import { Search } from "lucide-react";

export function SearchInput({ className }: { className?: string }) {
    const { setZoomDepth } = useSpiralStore();

    const handleSearch = (value: number) => {
        if (!isNaN(value) && value >= 0) {
            setZoomDepth(0); // Reset zoom first
            useSpiralStore.getState().zoomToSquare(value);
        }
    };

    return (
        <div className={cn("flex gap-2", className)}>
            <input
                type="number"
                placeholder="... id"
                className={cn(
                    "w-full h-full px-3 py-2 rounded-full bg-background/50",
                    "hover:bg-background/90 hover:text-foreground transition-colors",
                    "duration-200 text-white placeholder:text-background",
                    "hover:placeholder:text-foreground/80",
                    "placeholder:text-sm placeholder:font-semibold",
                    "focus:outline-none focus:ring-2 focus:ring-primary"
                )}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value) || value < 0) {
                        e.target.value = "";
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        const value = parseInt((e.target as HTMLInputElement).value);
                        handleSearch(value);
                    }
                }}
            />
            <button
                className="absolute right-10 p-1 text-background hover:text-white transition-colors"
                onClick={() => {
                    const input = document.querySelector(
                        'input[type="number"]'
                    ) as HTMLInputElement;
                    const value = parseInt(input.value);
                    handleSearch(value);
                }}
            >
                <Search size={16} />
            </button>
        </div>
    );
}

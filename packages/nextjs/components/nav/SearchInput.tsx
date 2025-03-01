import { cn } from "@/lib/utils";
import { useSpiralStore } from "@/stores/useSpiralStore";
import { useSquareStore } from "@/stores/useSquareStore";
import { Search } from "lucide-react";
import { useState } from "react";

export function SearchInput({ className }: { className?: string }) {
    const { setZoomDepth } = useSpiralStore();
    const { totalSupply } = useSquareStore();
    const [error, setError] = useState<string | null>(null);

    const validateValue = (value: number | string): string | null => {
        if (typeof value === "string" && value === "") return null;
        const numValue = typeof value === "string" ? parseInt(value) : value;

        if (isNaN(numValue)) return "Please enter a valid number";
        if (numValue < 0) return "ID cannot be negative";
        if (numValue > totalSupply + 1)
            return `ID must be less than or equal to ${totalSupply + 1}`;
        return null;
    };

    const validateAndSearch = (value: number) => {
        const validationError = validateValue(value);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setZoomDepth(0); // Reset zoom first
        const adjustedValue = totalSupply - value;
        useSpiralStore.getState().zoomToSquare(adjustedValue);
    };

    return (
        <div className={cn("flex gap-2 relative", className)}>
            <input
                type="number"
                placeholder="... id"
                className={cn(
                    "w-full h-full px-3 pr-8 py-2 rounded-full bg-background/50",
                    "hover:bg-background/90 hover:text-foreground transition-colors",
                    "duration-200 text-white placeholder:text-background",
                    "hover:placeholder:text-foreground/80",
                    "placeholder:text-sm placeholder:font-semibold",
                    "focus:outline-none focus:ring-2",
                    error ? "focus:ring-red-500 ring-2 ring-red-500" : "focus:ring-primary"
                )}
                onChange={(e) => {
                    setError(validateValue(e.target.value));
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        const value = parseInt((e.target as HTMLInputElement).value);
                        validateAndSearch(value);
                    }
                }}
            />
            <button
                className="absolute right-1 p-1 text-background hover:text-white transition-colors"
                onClick={() => {
                    const input = document.querySelector(
                        'input[type="number"]'
                    ) as HTMLInputElement;
                    const value = parseInt(input.value);
                    validateAndSearch(value);
                }}
            >
                <Search size={16} />
            </button>
            {/* {error && (
                <div className="absolute bottom-0 right-0 text-lg text-red-500 font-medium">
                    {error}
                </div>
            )} */}
        </div>
    );
}

import { type SpiralSquare } from "@/types/spiral";

interface Props {
    square: SpiralSquare;
    baseSize: number;
    getContext: () => CanvasRenderingContext2D | null;
}

export function SpiralSquareComponent({ square, baseSize, getContext }: Props) {
    const size = square.size * baseSize;
    console.log(square, baseSize);

    return (
        <div
            className="absolute bg-background/50 border border-blue-500/50 
                       hover:bg-background/80 transition-colors cursor-pointer"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                transform: `translate(${square.x * baseSize}px, ${square.y * baseSize}px)`,
                transformOrigin: "center",
                left: `-${size / 2}px`,
                top: `-${size / 2}px`,
            }}
        >
            <div className="p-2 text-xs">
                Square {square.id}
                <br />
                Size: {square.size}
            </div>
        </div>
    );
}

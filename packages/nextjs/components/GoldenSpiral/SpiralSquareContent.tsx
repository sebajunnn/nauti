import Image from "next/image";
import { useEffect, useRef } from "react";
import { useSquareStore } from "@/stores/useSquareStore";
import { SpiralSquare, Vector } from "@/types/golden-spiral";
import { goldenSpiralConstants } from "@/types/golden-spiral";
import { cn } from "@/lib/utils";

interface SpiralSquareContentProps {
    square: SpiralSquare;
    squareIndex?: number;
    baseSize: number;
    scale: number;
    offset: Vector;
    zoomDepth: number;
}

export function SpiralSquareContent({
    square,
    squareIndex,
    baseSize,
    scale,
    offset,
    zoomDepth,
}: SpiralSquareContentProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const { updateSquareState, getNextPatternIndex, isSquareVisible, setIndex, getIndex } =
        useSquareStore();
    const { patternLength } = goldenSpiralConstants;
    const squareActualIndex = getIndex(square.id);

    // Calculate dimensions and position
    const size = square.size * baseSize;
    const finalX = square.x * baseSize * scale + offset.x * scale;
    const finalY = square.y * baseSize * scale + offset.y * scale;
    const scaledSize = size * scale;

    const checkVisibility = () => {
        const buffer = 2000; // buffer zone beyond viewport for visibility check
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate element bounds relative to viewport center
        const centerX = viewportWidth / 2;
        const centerY = viewportHeight / 2;

        // Calculate element bounds
        const left = centerX + finalX;
        const top = centerY + finalY;
        const right = left + scaledSize;
        const bottom = top + scaledSize;

        // Check if element is within viewport + buffer
        const visible = !(
            right < -buffer ||
            left > viewportWidth + buffer ||
            bottom < -buffer ||
            top > viewportHeight + buffer
        );

        const isCurrentlyVisible = isSquareVisible(square.id);
        if (visible !== isCurrentlyVisible) {
            updateSquareState(square.id, visible, squareIndex || 0);
        }
    };

    useEffect(() => {
        checkVisibility();

        // Still need resize listener as viewport size affects visibility
        window.addEventListener("resize", checkVisibility);
        return () => window.removeEventListener("resize", checkVisibility);
    }, [
        finalX,
        finalY,
        scaledSize,
        square.id,
        squareIndex,
        updateSquareState,
        getNextPatternIndex,
        setIndex,
    ]);

    // Calculate appropriate image size based on zoom
    const imageSize = Math.min(Math.ceil(scaledSize), 2048); // Cap max size

    return (
        <div
            ref={elementRef}
            className="absolute bg-neutral-700/0 overflow-hidden"
            style={{
                width: `${scaledSize}px`,
                height: `${scaledSize}px`,
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate3d(${finalX}px, ${finalY}px, 0)`,
                willChange: "transform",
                backfaceVisibility: "hidden",
                perspective: 1000,
                pointerEvents: "none",
            }}
        >
            {/* {inView && ( // Only render image when in view */}
            {/* {true && ( // Only render image when in view
                <Image
                    src="/test.jpg"
                    alt="Logo"
                    width={imageSize}
                    height={imageSize}
                    className="w-full h-full object-cover"
                    quality={scaledSize > 1000 ? 75 : 60} // Adjust quality based on size
                    // loading="lazy"
                    sizes={`${scaledSize}px`} // Help browser optimize loading
                    style={{
                        transformOrigin: "center",
                        backfaceVisibility: "hidden",
                    }}
                />
            )} */}
            <div className="flex items-center justify-center w-full h-full">
                <h1 className={cn("px-1 rounded-sm", "bg-white text-black")}>
                    {squareActualIndex}
                </h1>
            </div>
        </div>
    );
}

import { SpiralSquare, Vector } from "@/types/golden-spiral";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

interface SpiralSquareProps {
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
}: SpiralSquareProps) {
    // Increase rootMargin to preload images before they enter viewport
    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
        rootMargin: "1000px", // Preload images 500px before they enter viewport
        // delay: 100, // Small delay to prevent rapid changes
    });

    // Calculate base dimensions
    const size = square.size * baseSize;

    // Calculate final position including all transformations
    const finalX = square.x * baseSize * scale + offset.x * scale;
    const finalY = square.y * baseSize * scale + offset.y * scale;

    // Calculate scaled dimensions
    const scaledSize = size * scale;

    // Calculate appropriate image size based on zoom
    const imageSize = Math.min(Math.ceil(scaledSize), 2048); // Cap max size

    return (
        <div
            ref={ref}
            className="absolute bg-black overflow-hidden rounded-3xl"
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
                // opacity: inView ? 1 : 0, // Fade in when visible
                transition: "opacity 0.3s ease-in-out", // Smoother transition
            }}
        >
            {/* {inView && ( // Only render image when in view */}
            {true && ( // Only render image when in view
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
            )}
        </div>
    );
}

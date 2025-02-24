import Image from "next/image";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSquareStore } from "@/stores/useSquareStore";
import { SpiralSquare, Vector } from "@/types/golden-spiral";
import { cn } from "@/lib/utils";

interface SpiralSquareContentProps {
    square: SpiralSquare;
    squareIndex?: number;
    baseSize: number;
    scale: number;
    offset: Vector;
    zoomDepth: number;
}

interface ContentData {
    content: string;
    image: string;
    index: string;
}

const LOW_QUALITY = 25;
const HIGH_QUALITY = 75;
const FIXED_IMAGE_SIZE = 400;
const FIXED_QUALITY = 100;

// Custom debounce hook
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    );
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
    const { updateSquareState, isSquareVisible, getIndex } = useSquareStore();
    const squareActualIndex = getIndex(square.id);
    const [data, setData] = useState<ContentData>();
    const [loading, setLoading] = useState(false);

    // Memoize expensive calculations
    const { size, finalX, finalY, scaledSize, imageSize } = useMemo(() => {
        const size = square.size * baseSize;
        const finalX = square.x * baseSize * scale + offset.x;
        const finalY = square.y * baseSize * scale + offset.y;
        const scaledSize = size * scale;
        const imageSize = Math.min(Math.ceil(scaledSize), 2048);
        return { size, finalX, finalY, scaledSize, imageSize };
    }, [square, baseSize, scale, offset]);

    const checkVisibility = useCallback(() => {
        if (!elementRef.current) return;

        const buffer = 500;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const centerX = viewportWidth / 2;
        const centerY = viewportHeight / 2;

        const left = centerX + finalX;
        const top = centerY + finalY;
        const right = left + scaledSize;
        const bottom = top + scaledSize;

        let visible = !(
            right < -buffer ||
            left > viewportWidth + buffer ||
            bottom < -buffer ||
            top > viewportHeight + buffer
        );

        const isTooSmall = scaledSize < 10;
        if (isTooSmall) {
            visible = false;
        }

        const isCurrentlyVisible = isSquareVisible(square.id);

        if (visible !== isCurrentlyVisible) {
            updateSquareState(square.id, visible, squareIndex || 0, isTooSmall);
        }
    }, [finalX, finalY, scaledSize, square.id, squareIndex, updateSquareState, isSquareVisible]);

    // Debounce visibility check
    const debouncedCheck = useDebounce(checkVisibility, 100);

    useEffect(() => {
        checkVisibility();
        window.addEventListener("resize", debouncedCheck);
        return () => {
            window.removeEventListener("resize", debouncedCheck);
        };
    }, [checkVisibility, debouncedCheck]);

    // Only fetch when visible
    useEffect(() => {
        setData(undefined);
        setLoading(true);

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/content?index=${squareActualIndex}`);
                const data = await res.json();
                setData(data);
            } catch (error) {
                console.error("Failed to fetch content:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [squareActualIndex]);

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
            {loading ? (
                <div className="flex items-center justify-center w-full h-full bg-white/10">
                    <span>...</span>
                </div>
            ) : data ? (
                <div className="relative w-full h-full">
                    <Image
                        src={data.image}
                        alt={data.content}
                        width={FIXED_IMAGE_SIZE}
                        height={FIXED_IMAGE_SIZE}
                        className="w-full h-full object-cover"
                        quality={FIXED_QUALITY}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${btoa(
                            '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#666"/></svg>'
                        )}`}
                        style={{
                            transformOrigin: "center",
                            backfaceVisibility: "hidden",
                        }}
                    />
                    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black/0 text-white">
                        <h1>{data.index}</h1>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full h-full">
                    <span>{squareActualIndex}</span>
                </div>
            )}
        </div>
    );
}

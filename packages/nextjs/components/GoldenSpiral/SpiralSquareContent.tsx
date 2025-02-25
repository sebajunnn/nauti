import Image from "next/image";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSquareStore } from "@/stores/useSquareStore";
import { goldenSpiralConstants, SpiralSquare, Vector } from "@/types/golden-spiral";
import { cn } from "@/lib/utils";
import { Textfit } from "react-textfit";

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
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 2048 2048' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

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

    const startingSquareIndex = goldenSpiralConstants.startingSquareIndex;

    // Memoize expensive calculations
    const { size, finalX, finalY, scaledSize, imageSize, fontSize, titleSize } = useMemo(() => {
        const size = square.size * baseSize;
        const finalX = square.x * baseSize * scale + offset.x;
        const finalY = square.y * baseSize * scale + offset.y;
        const scaledSize = size * scale;
        const imageSize = Math.min(Math.ceil(scaledSize), 2048);
        const fontSize = Math.max(12, Math.floor(scaledSize * 0.02));
        const titleSize = Math.floor(scaledSize * 0.4); // 40% of container width
        return { size, finalX, finalY, scaledSize, imageSize, fontSize, titleSize };
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
            {
                startingSquareIndex === (squareIndex ?? 0) && zoomDepth === 0 ? (
                    <div
                        className={cn(
                            "flex items-center justify-center w-full h-full px-12 pr-12 py-0",
                            ""
                        )}
                    >
                        <div
                            className={cn(
                                "w-full h-full rounded-4xl bg-primary border-2 border-primary-foreground",
                                "flex items-center justify-between flex-col text-primary-foreground"
                            )}
                        >
                            <header className="flex flex-row items-center justify-between w-full px-4 py-2">
                                <h3 className="font-bold" style={{ fontSize: `${fontSize}px` }}>
                                    • issue: 001
                                </h3>
                                <h3 className="font-bold" style={{ fontSize: `${fontSize}px` }}>
                                    story: undefined
                                </h3>
                            </header>
                            <div className="flex-1 flex flex-row items-center justify-center overflow-hidden">
                                <h1 className="text-[100px] w-full font-redaction font-[350]">
                                    Nauti
                                </h1>
                            </div>
                            <footer className="flex flex-row items-center justify-between w-full px-4 py-2">
                                <h4 className="text-base font-bold">by nature</h4>
                                <h4 className="text-base font-bold text-center absolute left-1/2 -translate-x-1/2">
                                    Eternal Web3 Content
                                </h4>
                            </footer>
                        </div>
                    </div>
                ) : data ? (
                    <div className="relative w-full h-full p-1">
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
                                // filter: "brightness(0.8) contrast(1.1) saturate(1.3) sepia(0.2) hue-rotate(20deg)",
                            }}
                        />
                        <div
                            className="absolute inset-1 pointer-events-none opacity-[0.5] mix-blend-overlay"
                            style={{
                                backgroundImage: NOISE_SVG,
                                filter: "contrast(320%) brightness(100%)",
                            }}
                        />
                        {/* for debugging */}
                        {/* <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black/0 text-white">
                        <h1>{data.index}</h1>
                    </div> */}
                    </div>
                ) : null
                // <div className="flex items-center justify-center w-full h-full">
                //     <span>{squareActualIndex}</span>
                // </div>
            }
        </div>
    );
}

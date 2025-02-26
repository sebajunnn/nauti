import Image from "next/image";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSquareStore } from "@/stores/useSquareStore";
import { goldenSpiralConstants, SpiralSquare, Vector } from "@/types/golden-spiral";
import { cn } from "@/lib/utils";
import { Textfit } from "react-textfit";
import { HeroCard } from "@/components/content/HeroCard";
import { ContentCard } from "@/components/content/ContentCard";
import { useContentFetch } from "@/hooks/useContentFetch";
import { ContentModal } from "@/components/content/ContentModal";

interface GoldenSquareContainerProps {
    square: SpiralSquare;
    squareIndex?: number;
    baseSize: number;
    scale: number;
    offset: Vector;
    zoomDepth: number;
    onCardClick: (data: ModalData) => void;
}

interface ModalData {
    content: string;
    index: number;
    name?: string;
    description?: string;
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

export function GoldenSquareContainer({
    square,
    squareIndex,
    baseSize,
    scale,
    offset,
    zoomDepth,
    onCardClick,
}: GoldenSquareContainerProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const { updateSquareState, isSquareVisible, getIndex } = useSquareStore();
    const squareActualIndex = getIndex(square.id);
    const { data, loading } = useContentFetch(squareActualIndex);
    const startingSquareIndex = goldenSpiralConstants.startingSquareIndex;

    // Memoize expensive calculations
    const { finalX, finalY, scaledSize, fontSize } = useMemo(() => {
        const size = square.size * baseSize;
        const finalX = square.x * baseSize * scale + offset.x;
        const finalY = square.y * baseSize * scale + offset.y;
        const scaledSize = size * scale;
        const fontSize = Math.max(12, Math.floor(scaledSize * 0.02));
        return { finalX, finalY, scaledSize, fontSize };
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
            }}
        >
            {startingSquareIndex === (squareIndex ?? 0) && zoomDepth === 0 ? (
                <HeroCard fontSize={fontSize} />
            ) : (
                <ContentCard
                    image={data?.image || null}
                    content={data?.content || ""}
                    loading={loading}
                    onClick={() =>
                        onCardClick({
                            content: data?.content || "",
                            index: squareActualIndex,
                            name: data?.name,
                            description: data?.description,
                        })
                    }
                    index={squareActualIndex}
                />
            )}
        </div>
    );
}

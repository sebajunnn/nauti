"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { GoldenSquareContainer } from "@/components/goldenSpiral/GoldenSquareContainer";
import { cn, debounce } from "@/lib/utils";
import { SpiralSquare, Vector, goldenSpiralConstants } from "@/types/golden-spiral";
import { useSpiralStore } from "@/stores/useSpiralStore";
import { IndexStateOverlay } from "@/components/debug/IndexStateOverlay";
import { useSquareStore } from "@/stores/useSquareStore";
import { ContentModal } from "@/components/content/ContentModal";

interface ModalData {
    content: string;
    index: number;
    name?: string;
    description?: string;
}

export default function GoldenSpiral({ className }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [startingOffset, setStartingOffset] = useState<Vector>({ x: 0, y: 0 });

    const { scale, zoomDepth, setScale, setZoomDepth, reset } = useSpiralStore();
    const { reset: resetVisibility } = useSquareStore();

    const scaleRef = useRef(1);
    const targetScale = useRef(1);
    const rafRef = useRef<number>(1);
    const lastWheelTime = useRef(0);

    // Fibonacci Calculations
    const {
        patternLength,
        resetThreshold,
        startingSquareIndex,
        startingSquareDirection,
        mainIterationCount,
        totalCount,
        fibonacciSequence,
    } = goldenSpiralConstants;

    // State for golden spiral squares
    const [squares, setSquares] = useState<SpiralSquare[]>([]);
    const [baseSize, setBaseSize] = useState(0);
    const baseSizeRatio = 1;
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const calculateBaseSize = (height: number, squareSize: number) => {
        // Account for 1rem (16px) padding on each side (inset-2 = 0.5rem * 2 * 2)
        const padding = 16;
        const size = Math.min(window.innerHeight - padding, height - padding);
        return (size * baseSizeRatio) / squareSize;
    };

    const calculateSquares = (
        _totalCount: number,
        _startingSquareDirection: number
    ): SpiralSquare[] => {
        const squares: SpiralSquare[] = [];
        const sequence = fibonacciSequence.reverse();

        // Start with largest square
        squares.push({
            id: 0,
            x: 0,
            y: 0,
            size: sequence[0], // here
            direction: _startingSquareDirection,
        });

        // Calculate all positions first
        let pos: Vector = { x: 0, y: 0 };
        for (let i = 0; i < sequence.length - 1; i++) {
            const current = sequence[i];
            const next = sequence[i + 1];

            switch (i % 4) {
                case 0:
                    pos = { x: pos.x + current, y: pos.y };
                    break;
                case 1:
                    pos = { x: pos.x + current - next, y: pos.y + current };
                    break;
                case 2:
                    pos = { x: pos.x - next, y: pos.y + current - next };
                    break;
                case 3:
                    pos = { x: pos.x, y: pos.y - next };
                    break;
            }

            squares.push({
                id: i + 1 - startingSquareIndex,
                x: pos.x,
                y: pos.y,
                size: next,
                direction: i % 4,
            });
        }

        // Find center offset
        const lastSquare = squares[squares.length - 1];
        const centerOffset = {
            x: lastSquare.x + (lastSquare.direction === 2 ? lastSquare.size : 0),
            y: lastSquare.y + (lastSquare.direction === 3 ? lastSquare.size : 0),
        };
        // Apply both offsets to all squares
        squares.forEach((square) => {
            square.x -= centerOffset.x;
            square.y -= centerOffset.y;
        });

        return squares.slice(squares.length - mainIterationCount);
    };

    const calculateStartingOffset = (squares: SpiralSquare[]) => {
        if (!squares.length) return { x: 0, y: 0 } as Vector;

        const startingSquare = squares[startingSquareIndex];
        return {
            x: startingSquare.x + startingSquare.size,
            y: startingSquare.y + startingSquare.size / 2,
        } as Vector;
    };

    const setup = () => {
        const container = containerRef.current;
        if (!container) {
            console.log("Setup failed: No container");
            return;
        }

        // Add dimension checks
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            console.log("Setup failed: Container has no dimensions", rect);
            return;
        }

        const newSquares = calculateSquares(totalCount, startingSquareDirection);
        const baseSize = calculateBaseSize(rect.height, newSquares[startingSquareIndex].size);
        const offset = calculateStartingOffset(newSquares);

        setStartingOffset(offset);
        setSquares(newSquares);
        setBaseSize(baseSize);
        resetVisibility(newSquares);
    };

    // Initial setup
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Give the container a moment to properly initialize
        const timeoutId = setTimeout(() => {
            setup();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, []); // Run once on mount

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleResize = () => {
            setup();
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const animateScale = useCallback(() => {
        const diff = targetScale.current - scaleRef.current;
        if (Math.abs(diff) < 0.0001) {
            scaleRef.current = targetScale.current;
            setScale(targetScale.current);
            return;
        }

        // Smoother easing with smaller step
        scaleRef.current += diff * 0.1;
        setScale(scaleRef.current);
        rafRef.current = requestAnimationFrame(animateScale);
    }, []);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();

        const now = performance.now();
        if (now - lastWheelTime.current < 16) return;
        lastWheelTime.current = now;

        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newTargetScale = targetScale.current * scaleFactor;

        // Prevent zooming out past 0.75 when at depth 0
        if (zoomDepth === 0 && newTargetScale < 0.75 && scaleFactor < 1) {
            return;
        }

        // Zooming in past threshold
        if (newTargetScale > resetThreshold) {
            targetScale.current = newTargetScale / resetThreshold;
            scaleRef.current = scaleRef.current / resetThreshold;
            setScale(scale / resetThreshold);

            if (scaleFactor > 1) {
                setZoomDepth(zoomDepth + 1);
            }
        }
        // Zooming out when we have depth
        else if (newTargetScale < 1 && zoomDepth > 0) {
            targetScale.current = newTargetScale * resetThreshold;
            scaleRef.current = scaleRef.current * resetThreshold;
            setScale(scale * resetThreshold);

            setZoomDepth(zoomDepth - 1);
        }
        // Normal zooming
        else {
            targetScale.current = newTargetScale;
        }

        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(animateScale);
    };

    // Cleanup RAF on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    const handleReset = () => {
        targetScale.current = 1;
        setScale(1);
        setZoomDepth(0);
    };

    // Calculate eased and scaled offset based on scale
    const finalOffset = useMemo(() => {
        if (zoomDepth === 0) {
            const effectiveScale = Math.max(1, scale);
            const easeOutFactor = Math.max(0, 1 - (effectiveScale - 1) * 0.5);
            return {
                x: -startingOffset.x * baseSize * easeOutFactor,
                y: -startingOffset.y * baseSize * easeOutFactor,
            };
        }
        return { x: 0, y: 0 };
    }, [scale, startingOffset, baseSize]);

    const handleCardClick = (data: ModalData) => {
        setModalData(data);
        setIsModalOpen(true);
    };

    return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
            {/* Squares container - keep overflow hidden */}
            <div
                ref={containerRef}
                className="absolute inset-2 overflow-hidden rounded-4xl"
                onWheel={handleWheel}
            >
                {squares.map((square, index) => (
                    <GoldenSquareContainer
                        key={square.id}
                        square={square}
                        squareIndex={index}
                        baseSize={baseSize}
                        scale={scale}
                        offset={finalOffset}
                        zoomDepth={zoomDepth}
                        onCardClick={handleCardClick}
                    />
                ))}
            </div>

            {/* Overlays */}
            <IndexStateOverlay squares={squares} handleReset={handleReset} />

            {/* Content Modal */}
            <ContentModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                pageId={modalData?.index ?? 0}
                content={modalData?.content}
                name={modalData?.name}
                description={modalData?.description}
            />
        </div>
    );
}

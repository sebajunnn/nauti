import { useState, useRef, useCallback } from "react";
import { SpiralSquare, Vector, ZoomState } from "@/types/spiral";
import { SPIRAL_CONSTANTS } from "@/types/spiral";
import {
    generateFibonacciSequence,
    calculateNextPosition,
    centerSquares,
} from "@/lib/spiral-utils";

export function useSpiral() {
    const [zoom, setZoom] = useState<ZoomState>({ scale: 1, depth: 0 });
    const [squares, setSquares] = useState<SpiralSquare[]>([]);
    const [offset, setOffset] = useState<Vector>({ x: 0, y: 0 });

    const scaleRef = useRef(1);
    const targetScale = useRef(1);
    const rafRef = useRef<number>(1);
    const lastWheelTime = useRef(0);
    const squaresRef = useRef<SpiralSquare[]>([]);

    const calculateSquares = useCallback((iterations: number): SpiralSquare[] => {
        const squares: SpiralSquare[] = [];
        const sequence = generateFibonacciSequence(iterations);
        let pos: Vector = { x: 0, y: 0 };

        squares.push({
            id: 0,
            x: 0,
            y: 0,
            size: sequence[0],
            direction: (3 + SPIRAL_CONSTANTS.OUTER_SQUARE_COUNT) % 4,
        });

        for (let i = 0; i < sequence.length - 1; i++) {
            pos = calculateNextPosition(pos, sequence[i], sequence[i + 1], i);
            squares.push({
                id: i + 1,
                x: pos.x,
                y: pos.y,
                size: sequence[i + 1],
                direction: i % 4,
            });
        }

        return centerSquares(squares);
    }, []);

    const animateScale = useCallback(() => {
        const diff = targetScale.current - scaleRef.current;

        // Check if we're crossing zoom depths
        const nearThreshold = Math.abs(scaleRef.current - SPIRAL_CONSTANTS.RESET_THRESHOLD) < 1;
        const nearOne = Math.abs(scaleRef.current - 1) < 0.1;

        if (nearThreshold || nearOne) {
            // Instant transition when crossing zoom depths
            scaleRef.current = targetScale.current;
            setZoom((prev) => ({ ...prev, scale: targetScale.current }));
            return;
        }

        if (Math.abs(diff) < 0.0001) {
            scaleRef.current = targetScale.current;
            setZoom((prev) => ({ ...prev, scale: targetScale.current }));
            return;
        }

        scaleRef.current += diff * 0.1;
        setZoom((prev) => ({ ...prev, scale: scaleRef.current }));
        rafRef.current = requestAnimationFrame(animateScale);
    }, []);

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();

            const now = performance.now();
            if (now - lastWheelTime.current < 16) return;
            lastWheelTime.current = now;

            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newTargetScale = targetScale.current * scaleFactor;

            if (
                zoom.depth === 0 &&
                newTargetScale < SPIRAL_CONSTANTS.MIN_SCALE &&
                scaleFactor < 1
            ) {
                return;
            }

            // Check for zoom depth changes
            if (newTargetScale > SPIRAL_CONSTANTS.RESET_THRESHOLD) {
                targetScale.current = newTargetScale / SPIRAL_CONSTANTS.RESET_THRESHOLD;
                // Don't update scaleRef directly
                setZoom((prev) => ({
                    scale: prev.scale, // Keep current scale
                    depth: prev.depth + 1,
                }));
            } else if (newTargetScale < 1 && zoom.depth > 0) {
                targetScale.current = newTargetScale * SPIRAL_CONSTANTS.RESET_THRESHOLD;
                // Don't update scaleRef directly
                setZoom((prev) => ({
                    scale: prev.scale, // Keep current scale
                    depth: prev.depth - 1,
                }));
            } else {
                targetScale.current = newTargetScale;
            }

            // Always animate
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = requestAnimationFrame(animateScale);
        },
        [zoom.depth, animateScale]
    );

    const handleReset = useCallback(() => {
        targetScale.current = 1;
        scaleRef.current = zoom.scale;

        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        const animate = () => {
            const diff = targetScale.current - scaleRef.current;
            if (Math.abs(diff) < 0.0001) {
                scaleRef.current = targetScale.current;
                setZoom({ scale: 1, depth: 0 });
                setOffset({ x: 0, y: 0 });
                return;
            }

            scaleRef.current += diff * 0.1;
            setZoom((prev) => ({
                scale: scaleRef.current,
                depth: prev.depth,
            }));
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
    }, [zoom.scale]);

    return {
        zoom,
        squares,
        offset,
        handleWheel,
        handleReset,
        calculateSquares,
    };
}

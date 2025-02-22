"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { SpiralSquareContent } from "@/components/GoldenSpiral/SpiralSquareContent";
import { cn, debounce } from "@/lib/utils";
import { SpiralSquare, Vector, goldenSpiralConstants } from "@/types/golden-spiral";
import { useSpiralStore } from "@/stores/useSpiralStore";

// Constants for sizing
const BASE_SIZE_RATIO = 0.8;
const calculateBaseSize = (height: number, squareSize: number) =>
    (height * BASE_SIZE_RATIO) / squareSize;

export default function GoldenSpiral({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawGoldenSpiral, setDrawGoldenSpiral] = useState(false);

    const { scale, zoomDepth, offset, setScale, setZoomDepth, setOffset, reset } = useSpiralStore();

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
        outerSquareCount,
        totalCount,
        fibonacciSequence,
    } = goldenSpiralConstants;

    // State for golden spiral squares
    const [squares, setSquares] = useState<SpiralSquare[]>([]);
    const squaresRef = useRef<SpiralSquare[]>([]);
    const [baseSize, setBaseSize] = useState(0);

    const zoomDepthRef = useRef(0);

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
                id: i + 1,
                x: pos.x,
                y: pos.y,
                size: next,
                direction: i % 4,
            });
        }

        // Find position of smallest square (last one)
        const lastSquare = squares[squares.length - 1];

        // Adjust center point based on direction of smallest square
        const centerOffset = {
            x: lastSquare.x + (lastSquare.direction === 2 ? lastSquare.size : 0),
            y: lastSquare.y + (lastSquare.direction === 3 ? lastSquare.size : 0),
        };

        // Offset all squares relative to adjusted center
        squares.forEach((square) => {
            square.x -= centerOffset.x;
            square.y -= centerOffset.y;
        });

        // Return only the squares we want to display
        return squares.slice(squares.length - mainIterationCount);
    };

    const getCanvasContext = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        return { canvas, ctx };
    }, []);

    const setup = () => {
        const res = getCanvasContext();
        if (!res) {
            console.log("Setup failed: No canvas context");
            return;
        }
        const { canvas, ctx } = res;

        // Add dimension checks
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            console.log("Setup failed: Canvas has no dimensions", rect);
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const newSquares = calculateSquares(totalCount, startingSquareDirection);
        const baseSize = calculateBaseSize(canvas.height, newSquares[startingSquareIndex].size);

        squaresRef.current = newSquares;
        setBaseSize(baseSize);
        setSquares(newSquares);

        draw(ctx, canvas, newSquares);
    };

    const draw = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        currentSquares: SpiralSquare[]
    ) => {
        if (!drawGoldenSpiral) return;
        if (!ctx || !canvas || !currentSquares.length) {
            console.log("Draw skipped:", { ctx, canvas, currentSquares });
            return;
        }

        console.log("Drawing with:", { scale, offset });

        ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
        ctx.save();

        const centerX = canvas.width / (2 * window.devicePixelRatio);
        const centerY = canvas.height / (2 * window.devicePixelRatio);
        const canvasHeight = canvas.height / window.devicePixelRatio;

        // Transform sequence
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(offset.x, offset.y);

        // Debug center point
        ctx.beginPath();
        ctx.arc(0, 0, 5 / scale, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.lineWidth = 0.5 / scale;
        ctx.strokeStyle = "white";

        // Draw squares and arcs
        currentSquares.forEach((square, index) => {
            const x = square.x * baseSize;
            const y = square.y * baseSize;
            const size = square.size * baseSize;
            const fontSize = size / 30;

            // Draw square
            ctx.strokeStyle = "white";
            ctx.strokeRect(x, y, size, size);

            // Draw circle inside square
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            if (index === startingSquareIndex) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = "rgba(200, 0, 0, 0.4)";
            }
            ctx.fill();

            // Add square number and properties
            if (index === startingSquareIndex) {
                ctx.save();
                ctx.fillStyle = "white";
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // Square number
                ctx.fillText((index - startingSquareIndex).toString(), x + size / 2, y + size / 2);

                // Additional properties
                const lineHeight = fontSize * 1.2;
                ctx.fillText(`Size: ${square.size}`, x + size / 2, y + size / 2 + lineHeight);
                ctx.fillText(
                    `Direction: ${square.direction}`,
                    x + size / 2,
                    y + size / 2 + lineHeight * 2
                );
                ctx.fillText(
                    `Position: (${square.x.toFixed(1)}, ${square.y.toFixed(1)})`,
                    x + size / 2,
                    y + size / 2 + lineHeight * 3
                );

                ctx.restore();
            }

            // Shade starting square
            if (index === startingSquareIndex && zoomDepth === 0) {
                ctx.save();
                ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
                ctx.fillRect(x, y, size, size);

                // Add text
                ctx.fillStyle = "white";
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("Starting Square", x + size / 2, y + fontSize);
                ctx.restore();
            }

            // Draw arc for each square except the first
            if (index > 0) {
                ctx.strokeStyle = "grey";
                drawArc(ctx, square, baseSize);
            }
        });

        ctx.restore();
    };

    const drawArc = (ctx: CanvasRenderingContext2D, square: SpiralSquare, baseSize: number) => {
        const x = square.x * baseSize;
        const y = square.y * baseSize;
        const size = square.size * baseSize;

        const angles = [
            [-Math.PI / 2, 0], // right
            [0, Math.PI / 2], // down
            [Math.PI / 2, Math.PI], // left
            [Math.PI, (3 * Math.PI) / 2], // up
        ];

        const [startAngle, endAngle] = angles[square.direction];
        const arcX = x + (square.direction === 2 || square.direction === 3 ? size : 0);
        const arcY = y + (square.direction === 0 || square.direction === 3 ? size : 0);

        ctx.beginPath();
        ctx.arc(arcX, arcY, size, startAngle, endAngle);
        ctx.stroke();
    };

    // Initial setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Give the canvas a moment to properly initialize
        const timeoutId = setTimeout(() => {
            setup();
            console.log(squaresRef.current);
        }, 0);

        return () => clearTimeout(timeoutId);
    }, []); // Run once on mount

    useEffect(() => {
        const result = getCanvasContext();
        if (!result) return;
        const { canvas, ctx } = result;

        const handleResize = () => {
            setup();
        };

        draw(ctx, canvas, squaresRef.current);

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [scale, offset, squaresRef.current]);

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

    // Add wheel event options
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const now = performance.now();
            if (now - lastWheelTime.current < 16) return;
            lastWheelTime.current = now;

            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newTargetScale = targetScale.current * scaleFactor;

            // Prevent zooming out past 0.75 when at depth 0
            if (zoomDepthRef.current === 0 && newTargetScale < 0.75 && scaleFactor < 1) {
                return;
            }

            // Zooming in past threshold
            if (newTargetScale > resetThreshold) {
                targetScale.current = newTargetScale / resetThreshold;
                scaleRef.current = scaleRef.current / resetThreshold;
                setScale(scale / resetThreshold);

                if (scaleFactor > 1) {
                    zoomDepthRef.current++;
                    setZoomDepth(zoomDepthRef.current);
                }
            }
            // Zooming out when we have depth
            else if (newTargetScale < 1 && zoomDepthRef.current > 0) {
                targetScale.current = newTargetScale * resetThreshold;
                scaleRef.current = scaleRef.current * resetThreshold;
                setScale(scale * resetThreshold);

                zoomDepthRef.current--;
                setZoomDepth(zoomDepthRef.current);
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

        canvas.addEventListener("wheel", handleWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, [scale]); // Add dependencies as needed

    // Cleanup RAF on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    const animateOffset = useCallback(
        (targetOffset: { x: number; y: number }) => {
            const animate = () => {
                const diffX = targetOffset.x - offset.x;
                const diffY = targetOffset.y - offset.y;

                if (Math.abs(diffX) < 0.1 && Math.abs(diffY) < 0.1) {
                    setOffset(targetOffset);
                    return;
                }

                setOffset((current) => ({
                    x: current.x + diffX * 0.15,
                    y: current.y + diffY * 0.15,
                }));

                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        },
        [offset]
    );

    const handleReset = () => {
        zoomDepthRef.current = 0;
        targetScale.current = 1;
        reset();
    };

    // Add virtualization to only render visible squares
    // const visibleSquares = useMemo(() => {
    //     return squares.filter((square) => {
    //         const size = square.size * baseSize * scale;
    //         const x = square.x * baseSize * scale + offset.x * scale;
    //         const y = square.y * baseSize * scale + offset.y * scale;

    //         // Check if square is in viewport
    //         return (
    //             x + size > -window.innerWidth / 2 &&
    //             x < window.innerWidth / 2 &&
    //             y + size > -window.innerHeight / 2 &&
    //             y < window.innerHeight / 2
    //         );
    //     });
    // }, [squares, baseSize, scale, offset]);

    return (
        <div className={cn("", className)}>
            <div
                className="absolute top-7 left-7 z-10 px-3 py-1 bg-background 
                          text-foreground rounded-full"
            >
                Zoom Depth: {zoomDepth}
            </div>
            <button
                onClick={handleReset}
                className="absolute bottom-5 right-5 z-10 px-3 py-1 bg-foreground/50 hover:bg-foreground/20 
                          text-foreground rounded-full transition-colors"
            >
                Reset View
            </button>
            <div className="relative w-full h-full">
                <canvas
                    ref={canvasRef}
                    className="absolute w-full h-full rounded-3xl bg-neutral-700/30 border-white"
                />

                {/* {squares.map(
                    (square, index) =>
                        [4, 5, 6].includes(index) && (
                            <SpiralSquareComponent
                                key={square.id}
                                square={square}
                                baseSize={baseSize}
                                scale={scale}
                                offset={offset}
                            />
                        )
                )} */}
                {squares.map((square, index) => (
                    <SpiralSquareContent
                        key={square.id}
                        square={square}
                        baseSize={baseSize}
                        scale={scale}
                        offset={offset}
                        zoomDepth={zoomDepth}
                    />
                ))}
            </div>
        </div>
    );
}

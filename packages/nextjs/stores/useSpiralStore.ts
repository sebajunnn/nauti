import { create } from "zustand";
import { Vector } from "@/types/golden-spiral";
import { goldenSpiralConstants } from "@/types/golden-spiral";
import { useSquareStore } from "@/stores/useSquareStore";

interface SpiralStoreState {
    scale: number;
    zoomDepth: number;
    offset: Vector;
    startingOffset: Vector;
    setScale: (scale: number) => void;
    setZoomDepth: (depth: number) => void;
    setOffset: (offset: Vector | ((current: Vector) => Vector)) => void;
    setStartingOffset: (offset: Vector) => void;
    zoomToSquare: (targetIndex: number) => void;
    reset: () => void;
}

export const useSpiralStore = create<SpiralStoreState>((set, get) => ({
    scale: 1,
    zoomDepth: 0,
    offset: { x: 0, y: 0 },
    startingOffset: { x: 0, y: 0 },
    setScale: (scale) => set({ scale }),
    setZoomDepth: (depth: number) => {
        set({ zoomDepth: depth });
        // Update square indices when zoom depth changes
        useSquareStore.getState().updateAllSquareIndex(depth);
    },
    setOffset: (offset) =>
        set((state) => ({
            offset: typeof offset === "function" ? offset(state.offset) : offset,
        })),
    setStartingOffset: (offset) => set({ startingOffset: offset }),
    zoomToSquare: (targetIndex: number) => {
        const { patternLength, resetThreshold } = goldenSpiralConstants;
        const targetDepth = Math.floor(targetIndex / patternLength);

        // Calculate how far into the current depth we are (0 to patternLength-1)
        const depthProgress = targetIndex % patternLength;

        // Calculate scale based on progress through the pattern
        // We want to be fully zoomed (resetThreshold) when we're at the last square of the pattern
        const progressScale = depthProgress / (patternLength - 1);
        const targetScale = 1 + (resetThreshold - 1) * progressScale;

        set({
            scale: targetScale,
            zoomDepth: targetDepth,
        });
        useSquareStore.getState().updateAllSquareIndex(targetDepth);
    },
    reset: () =>
        set({ scale: 1, zoomDepth: 0, offset: { x: 0, y: 0 }, startingOffset: { x: 0, y: 0 } }),
}));

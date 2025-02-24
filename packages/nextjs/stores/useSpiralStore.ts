import { create } from "zustand";
import { Vector } from "@/types/golden-spiral";
import { useSquareStore } from "@/stores/useSquareStore";

interface SpiralStoreState {
    scale: number;
    zoomDepth: number;
    offset: Vector;
    setScale: (scale: number) => void;
    setZoomDepth: (depth: number) => void;
    setOffset: (offset: Vector | ((current: Vector) => Vector)) => void;
    reset: () => void;
}

export const useSpiralStore = create<SpiralStoreState>((set, get) => ({
    scale: 1,
    zoomDepth: 0,
    offset: { x: 0, y: 0 },
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
    reset: () => set({ scale: 1, zoomDepth: 0, offset: { x: 0, y: 0 } }),
}));

import { create } from "zustand";
import { Vector } from "@/types/golden-spiral";

interface SpiralState {
    scale: number;
    zoomDepth: number;
    offset: Vector;
    setScale: (scale: number) => void;
    setZoomDepth: (depth: number) => void;
    setOffset: (offset: Vector | ((current: Vector) => Vector)) => void;
    reset: () => void;
}

export const useSpiralStore = create<SpiralState>((set) => ({
    scale: 1,
    zoomDepth: 0,
    offset: { x: 0, y: 0 },
    setScale: (scale) => set({ scale }),
    setZoomDepth: (depth) => set({ zoomDepth: depth }),
    setOffset: (offset) =>
        set((state) => ({
            offset: offset instanceof Function ? offset(state.offset) : offset,
        })),
    reset: () => set({ scale: 1, zoomDepth: 0, offset: { x: 0, y: 0 } }),
}));

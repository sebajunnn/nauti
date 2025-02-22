import { create } from "zustand";

interface SpiralState {
    scale: number;
    zoomDepth: number;
    offset: { x: number; y: number };
    setScale: (scale: number) => void;
    setZoomDepth: (depth: number) => void;
    setOffset: (offset: { x: number; y: number }) => void;
    reset: () => void;
}

export const useSpiralStore = create<SpiralState>((set) => ({
    scale: 1,
    zoomDepth: 0,
    offset: { x: 0, y: 0 },
    setScale: (scale) => set({ scale }),
    setZoomDepth: (depth) => set({ zoomDepth: depth }),
    setOffset: (offset) => set({ offset }),
    reset: () => set({ scale: 1, zoomDepth: 0, offset: { x: 0, y: 0 } }),
}));

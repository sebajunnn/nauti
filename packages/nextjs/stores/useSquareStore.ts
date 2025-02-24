import { create } from "zustand";
import { SpiralSquare } from "@/types/golden-spiral";
import { goldenSpiralConstants } from "@/types/golden-spiral";
import { useSpiralStore } from "@/stores/useSpiralStore";

interface SquareState {
    isVisible: boolean;
    index: number;
}

interface SquareStoreState {
    squareMap: Map<number, SquareState>;
    setIndex: (id: number, nextIndex: number) => void;
    getIndex: (id: number) => number;
    updateSquareState: (id: number, isVisible: boolean, baseIndex: number) => void;
    updateAllSquareIndex: (zoomDepth: number) => void;
    getVisibleSquares: (squares: SpiralSquare[]) => SpiralSquare[];
    getNextPatternIndex: (currentIndex: number) => number;
    getSquaresNeedingData: (squares: SpiralSquare[]) => number[];
    isSquareVisible: (id: number) => boolean;
    reset: (squares: SpiralSquare[]) => void;
}

export const useSquareStore = create<SquareStoreState>((set, get) => ({
    squareMap: new Map(),

    updateSquareState: (id: number, isVisible: boolean, baseIndex: number) =>
        set((state) => {
            const newMap = new Map(state.squareMap);
            const zoomDepth = useSpiralStore.getState().zoomDepth;
            const { patternLength } = goldenSpiralConstants;

            // Calculate actual index based on zoom depth
            let actualIndex;
            if (isVisible) {
                actualIndex = baseIndex + (patternLength - 1) * zoomDepth;
            } else {
                actualIndex = baseIndex + (patternLength - 1) * (zoomDepth + 1);
            }

            console.log(
                `Square ${id} is now ${
                    isVisible ? "visible" : "hidden"
                }. Fetching new index ${actualIndex}`
            );
            newMap.set(id, { isVisible, index: actualIndex });
            return { squareMap: newMap };
        }),

    updateAllSquareIndex: (zoomDepth: number) =>
        set((state) => {
            const newMap = new Map(state.squareMap);
            const { patternLength } = goldenSpiralConstants;
            const squareCount = newMap.size;

            // Loop over all entries in the map
            newMap.forEach((squareState, squareId) => {
                const baseIndex = squareState.index % squareCount;
                const actualIndex = squareId + (patternLength - 1) * zoomDepth;

                console.log(
                    `Square ${squareId} (${
                        squareState.isVisible ? "visible" : "hidden"
                    }) updating to index ${actualIndex}`
                );

                newMap.set(squareId, {
                    ...squareState,
                    index: actualIndex,
                });
            });

            return { squareMap: newMap };
        }),

    setIndex: (id: number, nextIndex: number) =>
        set((state) => {
            const newMap = new Map(state.squareMap);
            const currentState = state.squareMap.get(id);
            newMap.set(id, {
                isVisible: currentState?.isVisible || false,
                index: nextIndex,
            });
            return { squareMap: newMap };
        }),

    isSquareVisible: (id) => get().squareMap.get(id)?.isVisible || false,

    getIndex: (id) => get().squareMap.get(id)?.index ?? 0,

    reset: (squares) =>
        set((state) => {
            const newMap = new Map(state.squareMap);
            squares.forEach((square, index) => newMap.set(square.id, { isVisible: false, index }));
            return { squareMap: newMap };
        }),

    getVisibleSquares: (squares) =>
        squares.filter((square) => get().squareMap.get(square.id)?.isVisible),

    getNextPatternIndex: (currentIndex: number) => {
        const { patternLength } = goldenSpiralConstants;
        const zoomDepth = useSpiralStore.getState().zoomDepth;
        return currentIndex + patternLength * (zoomDepth + 1);
    },

    getSquaresNeedingData: (squares) => {
        const { squareMap, getNextPatternIndex } = get();
        const needsData: number[] = [];

        squares.forEach((square) => {
            const squareState = squareMap.get(square.id);
            if (!squareState?.isVisible && squareState?.index !== undefined) {
                const nextPatternIndex = getNextPatternIndex(squareState.index);
                needsData.push(nextPatternIndex);
            }
        });

        return needsData;
    },
}));

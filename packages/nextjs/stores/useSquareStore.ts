import { create } from "zustand";
import { goldenSpiralConstants, SpiralSquare } from "@/types/golden-spiral";
import { useSpiralStore } from "@/stores/useSpiralStore";
import { getTotalSupply } from "@/app/actions/content";

interface SquareState {
    isVisible: boolean;
    index: number;
}

interface SquareStoreState {
    squares: SpiralSquare[];
    squareMap: Map<number, SquareState>;
    totalSupply: number;
    setSquares: (squares: SpiralSquare[]) => void;
    getIndex: (id: number) => number;
    updateSquareState: (
        id: number,
        isVisible: boolean,
        baseIndex: number,
        isTooSmall: boolean
    ) => void;
    updateAllSquareIndex: (zoomDepth: number) => void;
    isSquareVisible: (id: number) => boolean;
    reset: (squares: SpiralSquare[]) => void;
    fetchTotalSupply: () => Promise<number>;
}

export const useSquareStore = create<SquareStoreState>((set, get) => ({
    squares: [],
    squareMap: new Map(),
    totalSupply: 0,

    setSquares: (squares: SpiralSquare[]) => set({ squares }),

    getIndex: (id) => get().squareMap.get(id)?.index ?? 0,

    fetchTotalSupply: async (): Promise<number> => {
        try {
            const totalSupply = await getTotalSupply();
            set({ totalSupply });
            return totalSupply;
        } catch (error) {
            console.error("Error fetching total supply:", error);
            return 0;
        }
    },

    updateSquareState: (id: number, isVisible: boolean, baseIndex: number, isTooSmall: boolean) =>
        set((state) => {
            const zoomDepth = useSpiralStore.getState().zoomDepth;
            const { patternLength } = goldenSpiralConstants;

            // Calculate actual index based on zoom depth
            let actualIndex;
            if (isVisible) {
                actualIndex = baseIndex + (patternLength - 1) * zoomDepth;
            } else if (isTooSmall) {
                actualIndex = baseIndex + (patternLength - 1) * Math.abs(zoomDepth - 1);
            } else {
                actualIndex = baseIndex + (patternLength - 1) * (zoomDepth + 1);
            }

            console.log(
                `Square ${id} is now ${
                    isVisible ? "visible" : "hidden"
                }. Fetching new index ${actualIndex}`
            );
            state.squareMap.set(id, { isVisible, index: actualIndex });
            return { squareMap: state.squareMap };
        }),

    // For when zoom depth changes
    // Needs optimising for checking if square index is already correct
    updateAllSquareIndex: (zoomDepth: number) =>
        set((state) => {
            const { patternLength } = goldenSpiralConstants;

            state.squareMap.forEach((squareState, squareId) => {
                if (squareState.isVisible) {
                    // const baseIndex = squareState.index % squareCount;
                    const actualIndex = squareId + (patternLength - 1) * zoomDepth;

                    console.log(
                        `Square ${squareId} (${
                            squareState.isVisible ? "visible" : "hidden"
                        }) updating to index ${actualIndex}`
                    );
                    state.squareMap.set(squareId, {
                        ...squareState,
                        index: actualIndex,
                    });
                }
            });

            return { squareMap: state.squareMap };
        }),

    isSquareVisible: (id) => get().squareMap.get(id)?.isVisible || false,

    reset: (squares) =>
        set((state) => {
            squares.forEach((square, index) =>
                state.squareMap.set(square.id, { isVisible: false, index })
            );
            return { squareMap: state.squareMap };
        }),
}));

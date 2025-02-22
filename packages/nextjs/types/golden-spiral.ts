import { fibonacciSequence } from "@/lib/spiral-utils";

export interface SpiralSquare {
    id: number;
    x: number;
    y: number;
    size: number;
    direction: number;
    imageUrl?: string;
}

export interface Vector {
    x: number;
    y: number;
}

export const goldenSpiralConstants = {
    patternLength: 13,
    startingSquareIndex: 4,
    startingSquareDirection: 2,
    get mainIterationCount() {
        return Math.floor(this.patternLength * 2.5);
    },
    get outerSquareCount() {
        let n = 0;
        while (true) {
            const count = this.startingSquareDirection - this.startingSquareIndex + n * 4;
            if (count > 0) return count;
            n++;
        }
    },
    get totalCount() {
        return this.mainIterationCount + this.outerSquareCount;
    },
    get fibonacciSequence() {
        return fibonacciSequence(this.totalCount);
    },
    get resetThreshold() {
        return this.fibonacciSequence[this.patternLength];
    },
};

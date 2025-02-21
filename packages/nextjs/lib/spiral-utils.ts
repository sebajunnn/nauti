import { Vector, SpiralSquare } from "@/types/spiral";
import { SPIRAL_CONSTANTS } from "@/types/spiral";

export function generateFibonacciSequence(iterations: number): number[] {
    let sequence = [1, 1];
    for (let i = 0; i < iterations + SPIRAL_CONSTANTS.OUTER_SQUARE_COUNT; i++) {
        sequence.push(sequence[i + 1] + sequence[i]);
    }
    return sequence.reverse();
}

export function calculateNextPosition(
    pos: Vector,
    current: number,
    next: number,
    direction: number
): Vector {
    switch (direction % 4) {
        case 0:
            return { x: pos.x + current, y: pos.y };
        case 1:
            return { x: pos.x + current - next, y: pos.y + current };
        case 2:
            return { x: pos.x - next, y: pos.y + current - next };
        case 3:
            return { x: pos.x, y: pos.y - next };
        default:
            return pos;
    }
}

export function centerSquares(squares: SpiralSquare[]): SpiralSquare[] {
    const lastSquare = squares[squares.length - 1];
    const centerOffset = {
        x: lastSquare.x + (lastSquare.direction === 2 ? lastSquare.size : 0),
        y: lastSquare.y + (lastSquare.direction === 3 ? lastSquare.size : 0),
    };

    return squares.map((square) => ({
        ...square,
        x: square.x - centerOffset.x,
        y: square.y - centerOffset.y,
    }));
}

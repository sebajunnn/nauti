import { Vector, SpiralSquare } from "@/types/golden-spiral";

export function fibonacciSequence(iterations: number): number[] {
    let sequence = [1, 1];
    for (let i = 0; i < iterations; i++) {
        sequence.push(sequence[i + 1] + sequence[i]);
    }
    return sequence;
}

export function calculateNextPosition(
    pos: Vector,
    current: number,
    next: number,
    direction: number
): Vector {
    // Direction indicates position of current square in relation to next square
    switch (direction % 4) {
        case 0: // Right
            return { x: pos.x + current, y: pos.y };
        case 1: // Down
            return { x: pos.x + current - next, y: pos.y + current };
        case 2: // Left
            return { x: pos.x - next, y: pos.y + current - next };
        case 3: // Up
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

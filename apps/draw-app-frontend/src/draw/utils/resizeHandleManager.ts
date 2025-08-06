import { Point } from "@/types/shapeType";
import { BoundType, Direction } from "../index";



export function getResizeHandles(bounds: BoundType): {
    handle: Direction,
    x: number, y: number
}[] {
    const { x, y, width, height } = bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return [
        { handle: "nw", x, y },
        { handle: "n", x: x + halfWidth, y },
        { handle: "ne", x: x + width, y },
        { handle: "w", x, y: y + halfHeight },
        { handle: "e", x: x + width, y: y + halfHeight },
        { handle: "sw", x, y: y + height },
        { handle: "s", x: x + halfWidth, y: y + height },
        { handle: "se", x: x + width, y: y + height }
    ];
}

export function getHandleAtPoint(bounds: BoundType, point: Point, tolerance = 8): Direction | null {
    const handles = getResizeHandles(bounds);

    for (const { handle, x, y } of handles) {
        const distance = Math.hypot(point.x - x, point.y - y);
        if (distance <= tolerance) {
            return handle;
        }
    }

    return null;
}

export function getCursorForHandle(handle: Direction): string {
    const cursors = {
        "nw": "nw-resize",
        "n": "n-resize",
        "ne": "ne-resize",
        "w": "w-resize",
        "e": "e-resize",
        "sw": "sw-resize",
        "s": "s-resize",
        "se": "se-resize"
    };
    return cursors[handle];
}
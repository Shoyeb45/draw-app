import { Shape } from "@/types/shapeType";
import { BoundType, Direction, interactionState } from "..";
import { getShapeBounds } from "./shapeSelection";

export function handleResize(handle: Direction, deltaX: number, deltaY: number, selectedShapes: Shape[], ctx: CanvasRenderingContext2D, setShapes: React.Dispatch<React.SetStateAction<Shape[]>>) {
    if (!interactionState.originalBounds || selectedShapes.length <= 0) {
        return;
    }
    
    if (selectedShapes.length === 1) {
        const originalShape = selectedShapes[0];
        if (originalShape) {
            console.log(originalShape);
            const newShape = resizeShape(originalShape, handle, deltaX, deltaY, ctx);
            console.log(newShape);
            setShapes(prev => prev.map(x => x.id === newShape.id ? newShape: x));
        }
    } else {

    }
}

export function resizeShape(shape: Shape, handle: Direction, deltaX: number, deltaY: number, ctx: CanvasRenderingContext2D) {
    let bounds = getShapeBounds(shape, ctx);
    let temp: BoundType = {
        x: bounds?.left,
        y: bounds?.bottom,
        width: bounds?.right - bounds?.left,
        height: bounds.top - bounds.bottom
    }
    const newBounds = calculateNewBounds(temp, handle, deltaX, deltaY);
    return applyBoundsToShape(shape, newBounds, ctx);
}


export function calculateNewBounds(bounds: BoundType, handle: Direction, deltaX: number, deltaY: number): BoundType {
    let { x, y, width, height } = bounds;

    switch (handle) {
        case "nw":
            x += deltaX;
            y += deltaY;
            width -= deltaX;
            height -= deltaY;
            break;
        case "n":
            y += deltaY;
            height -= deltaY;
            break;
        case "ne":
            y += deltaY;
            width += deltaX;
            height -= deltaY;
            break;
        case "w":
            x += deltaX;
            width -= deltaX;
            break;
        case "e":
            width += deltaX;
            break;
        case "sw":
            x += deltaX;
            width -= deltaX;
            height += deltaY;
            break;
        case "s":
            height += deltaY;
            break;
        case "se":
            width += deltaX;
            height += deltaY;
            break;
    }

    const minSize = 10;
    if (width < minSize) {
        if (handle.includes("w")) x -= minSize - width;
        width = minSize;
    }
    if (height < minSize) {
        if (handle.includes("n")) y -= minSize - height;
        height = minSize;
    }

    return { x, y, width, height };
}


export function applyBoundsToShape(shape: Shape, bounds: BoundType, ctx: CanvasRenderingContext2D) {
    switch (shape.type) {
        case "rect":
            return {
                ...shape,
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height
            };

        case "ellipse":
            return {
                ...shape,
                x: bounds.x + bounds.width / 2,
                y: bounds.y + bounds.height / 2,
                radiusX: bounds.width / 2,
                radiusY: bounds.height / 2
            };

        case "text":
            return {
                ...shape,
                x: bounds.x,
                y: bounds.y + bounds.height
            };

        default:
            return scaleShape(shape, bounds, ctx);
    }
}

function scaleShape(shape: Shape, newBounds: BoundType, ctx: CanvasRenderingContext2D) {
    const temp = getShapeBounds(shape, ctx);
    let currentBounds = {
        x: temp.left, y: temp.bottom, width: temp.right - temp.left, height: temp.top - temp.bottom
    } 
    if (currentBounds.width === 0 || currentBounds.height === 0) {
        return shape;
    }

    const scaleX = newBounds.width / currentBounds.width;
    const scaleY = newBounds.height / currentBounds.height;

    switch (shape.type) {
        case "line":
        case "arrow":
            return {
                ...shape,
                startX: newBounds.x + (shape.startX - currentBounds.x) * scaleX,
                startY: newBounds.y + (shape.startY - currentBounds.y) * scaleY,
                endX: newBounds.x + (shape.endX - currentBounds.x) * scaleX,
                endY: newBounds.y + (shape.endY - currentBounds.y) * scaleY
            };

        case "draw":
            return {
                ...shape,
                points: shape.points.map(p => ({
                    ...p,
                    x: newBounds.x + (p.x - currentBounds.x) * scaleX,
                    y: newBounds.y + (p.y - currentBounds.y) * scaleY
                }))
            };

        default:
            return shape;
    }
}

import { Point, Shape } from "@/types/shapeType";
import { getShapeBounds } from "./shapeSelection";
import { BoundType } from "..";

export class HitTester {
    static hitTestShape(shape: Shape, point: Point, ctx: CanvasRenderingContext2D, tolerance = 5) {
        switch (shape.type) {
            case "rect":
                return this.hitTestRect(shape, point, tolerance, ctx);
            case "ellipse":
                return this.hitTestEllipse(shape, point, tolerance);
            case "line":
            case "arrow":
                return this.hitTestLine(shape, point, tolerance);
            case "draw":
                return this.hitTestDraw(shape, point, tolerance);
            case "text":
                return this.hitTestText(shape, point, tolerance, ctx);
        }
    }

    static hitTestRect(shape: Shape, point: Point, tolerance: number, ctx: CanvasRenderingContext2D) {
        if (shape.type !== "rect") {
            return;
        }
        
   
        return isPointInBounds(point, {
            x: shape.x - tolerance,
            y: shape.y - tolerance,
            width: shape.width + tolerance * 2,
            height: shape.height + tolerance * 2
        });
    }

    static hitTestEllipse(shape: Shape, point: Point, tolerance: number) {
        if (shape.type !== "ellipse") {
            return;
        }
        const dx = (point.x - shape.x) / (shape.radiusX + tolerance);
        const dy = (point.y - shape.y) / (shape.radiusY + tolerance);
        return dx * dx + dy * dy <= 1;
    }

    static hitTestLine(shape: Shape, point: Point, tolerance: number) {
        if (shape.type !== "line" && shape.type !== "arrow") {
            return;
        }
        const A = point.x - shape.startX;
        const B = point.y - shape.startY;
        const C = shape.endX - shape.startX;
        const D = shape.endY - shape.startY;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;

        if (lenSq === 0) return Math.hypot(A, B) <= tolerance;

        const param = dot / lenSq;
        const clampedParam = Math.max(0, Math.min(1, param));

        const closestX = shape.startX + clampedParam * C;
        const closestY = shape.startY + clampedParam * D;

        const distance = Math.hypot(point.x - closestX, point.y - closestY);
        return distance <= tolerance;
    }

    static hitTestDraw(shape: Shape, point: Point, tolerance: number) {
        if (shape.type !== "draw") {
            return;
        }

        for (let i = 0; i < shape.points.length - 1; i++) {
            const start = shape.points[i];
            const end = shape.points[i + 1];

            if (this.hitTestLine({
                type: "line",
                id: "",
                startX: start.x,
                startY: start.y,
                endX: end.x,
                endY: end.y
            }, point, tolerance)) {
                return true;
            }
        }
        return false;
    }

    static hitTestText(shape: Shape, point: Point, tolerance: number, ctx: CanvasRenderingContext2D) {
        const bounds = getShapeBounds(shape, ctx);
        return isPointInBounds(point, {
            x: bounds.left - tolerance,
            y: bounds.bottom - tolerance,
            width: (bounds.right - bounds.left) + tolerance * 2,
            height: (bounds.top - bounds.bottom) + tolerance * 2
        });
    }
}


function isPointInBounds(point: Point, bounds: BoundType) {
    return point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height;
}
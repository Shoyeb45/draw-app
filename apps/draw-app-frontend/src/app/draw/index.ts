import { Shape } from "@/types/shapeType";
import { initInfiniteCanvas, screenToWorldX, screenToWorldY, applyTransform } from "./infiniteCanvas";
import { act } from "react";

export function initDraw(
    canvas: HTMLCanvasElement,
    shapes: Shape[],
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
    activeShape: string,
    scale: number,
    setScale: (s: number) => void
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => { };

    // Initialize infinite canvas
    const cleanupInfinite = initInfiniteCanvas(
        { current: canvas },
        scale,
        setScale,
        () => redraw(canvas, shapes, scale)
    );

    // Resize handler
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redraw(canvas, shapes, scale);
    };
    window.addEventListener("resize", resizeCanvas);

    let isDrawing = false;
    let startX = 0, startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
        if (isPanning() || isTouchPanning()) return;
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        startX = screenToWorldX(e.clientX - rect.left, scale);
        startY = screenToWorldY(e.clientY - rect.top, scale);
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (!isDrawing) return;
        isDrawing = false;
        const rect = canvas.getBoundingClientRect();
        const endX = screenToWorldX(e.clientX - rect.left, scale);
        const endY = screenToWorldY(e.clientY - rect.top, scale);

        if (activeShape === "rect") {
            setShapes((prev) => [
                ...prev,
                {
                    type: "rect",
                    x: Math.min(startX, endX),
                    y: Math.min(startY, endY),
                    width: Math.abs(endX - startX),
                    height: Math.abs(endY - startY),
                },
            ]);
        } else if (activeShape === "ellipse") {
            const newShape: Shape = {
                type: "ellipse",
                // Store world coordinates
                x: startX + (endX - startX) / 2,
                y: startY + (endY - startY) / 2,
                radiusX: Math.abs(endX - startX) / 2,
                radiusY: Math.abs(endY - startY) / 2,
            };
            setShapes((prev: Shape[]) => [...prev, newShape]);
        } else if (activeShape === "line") {
            const newShape: Shape = {
                type: "line",
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY
            }
            setShapes((prev: Shape[]) => [...prev, newShape]);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDrawing || isPanning() || isTouchPanning()) return;
        const rect = canvas.getBoundingClientRect();
        const currentX = screenToWorldX(e.clientX - rect.left, scale);
        const currentY = screenToWorldY(e.clientY - rect.top, scale);

        redraw(canvas, shapes, scale);

        ctx.save();
        applyTransform(ctx, scale);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1 / scale;

        if (activeShape === "rect") {
            ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
        } else if (activeShape === "ellipse") {
            const width = currentX - startX;
            const height = currentY - startY;
            ctx.beginPath()
            ctx.ellipse(
                startX + width / 2,
                startY + height / 2,
                Math.abs(width) / 2,
                Math.abs(height) / 2,
                0,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        } else if (activeShape === "line") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            // ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    resizeCanvas();

    return () => {
        cleanupInfinite();
        window.removeEventListener("resize", resizeCanvas);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
    };
}

function redraw(canvas: HTMLCanvasElement, shapes: Shape[], scale: number) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    applyTransform(ctx, scale);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1 / scale;

    shapes.forEach((shape) => {
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "ellipse") {
            ctx.beginPath();
            ctx.ellipse(shape.x, shape.y, shape.radiusX, shape.radiusY, 0, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shape.type === "line") {
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
        }
    });

    ctx.restore();
}

// Helpers
function isPanning() {
    return (window as any).isPanning || false;
}
function isTouchPanning() {
    return (window as any).isTouchPanning || false;
}
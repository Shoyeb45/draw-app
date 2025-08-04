// draw/infiniteCanvas.ts
import { Shape } from "@/types/shapeType";
import { RefObject } from "react";

// --- VIEWPORT STATE ---
let offsetX = 0;
let offsetY = 0;

// --- PAN STATE ---
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartOffsetX = 0;
let panStartOffsetY = 0;

// --- TOUCH PAN STATE ---
let isTouchPanning = false;
let lastTouchCenter = { x: 0, y: 0 };

// --- KEYBOARD ---
const keysPressed = new Set<string>();
let panAnimationId: number | null = null;

// Redraw callback
let redrawCallback: (() => void) | null = null;

// Public getters for external use
export const getOffset = () => ({ offsetX, offsetY });
// export const getScale = () => scale;
// export const setScale = (newScale: number) => {
//     scale = newScale;
// };

// Coordinate conversion
export const screenToWorldX = (screenX: number, currentScale: number): number => {
    return screenX / currentScale + offsetX;
};

export const screenToWorldY = (screenY: number, currentScale: number): number => {
    return screenY / currentScale + offsetY;
};

export const worldToScreenX = (worldX: number, currentScale: number): number => {
    return (worldX - offsetX) * currentScale;
};

export const worldToScreenY = (worldY: number, currentScale: number): number => {
    return (worldY - offsetY) * currentScale;
};

// Apply transform to canvas context
export const applyTransform = (
    ctx: CanvasRenderingContext2D,
    currentScale: number
) => {
    ctx.scale(currentScale, currentScale);
    ctx.translate(-offsetX, -offsetY);
};

/**
 * Initializes infinite canvas behavior
 */
export function initInfiniteCanvas(
    canvasRef: RefObject<HTMLCanvasElement>,
    scale: number,
    setScale: (s: number) => void,
    redraw: () => void
) {
    redrawCallback = redraw;
    const canvas = canvasRef.current;
    if (!canvas) return () => { };

    const rect = canvas.getBoundingClientRect();

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        const r = canvas.getBoundingClientRect();
        const mouseX = e.clientX - r.left;
        const mouseY = e.clientY - r.top;

        const isPinch = e.ctrlKey || e.deltaZ !== 0;
        if (isPinch) {
            const worldX = screenToWorldX(mouseX, scale);
            const worldY = screenToWorldY(mouseY, scale);

            const sensitivity = 0.015;
            const scaleFactor = Math.exp(-e.deltaY * sensitivity);
            const newScale = Math.max(0.1, Math.min(5, scale * scaleFactor));

            offsetX = worldX - mouseX / newScale;
            offsetY = worldY - mouseY / newScale;
            setScale(newScale);
        } else {
            offsetX += e.deltaX / scale;
            offsetY += e.deltaY / scale;
        }

        redraw();
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 1 || e.button === 2 || (e.button === 0 && keysPressed.has(" "))) {
            e.preventDefault();
            console.log("Hello Came here");
            
            isPanning = true;
            const r = canvas.getBoundingClientRect();
            panStartX = e.clientX - r.left;
            panStartY = e.clientY - r.top;
            panStartOffsetX = offsetX;
            panStartOffsetY = offsetY;
            canvas.style.cursor = "grabbing";
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isPanning) {
            const r = canvas.getBoundingClientRect();
            const dx = e.clientX - r.left - panStartX;
            const dy = e.clientY - r.top - panStartY;

            offsetX = panStartOffsetX - dx / scale;
            offsetY = panStartOffsetY - dy / scale;

            redraw();
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (isPanning) {
            isPanning = false;
            // canvas.style.cursor = e.button === 1 || e.button === 2 || (e.button === 0 && keysPressed.has(" ")) ? "grabbing" : "default";
        }
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            isTouchPanning = true;
            const r = canvas.getBoundingClientRect();
            let x = 0, y = 0;
            for (let i = 0; i < e.touches.length; i++) {
                x += e.touches[i].clientX - r.left;
                y += e.touches[i].clientY - r.top;
            }
            lastTouchCenter = { x: x / 2, y: y / 2 };
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2 && isTouchPanning) {
            e.preventDefault();
            const r = canvas.getBoundingClientRect();
            let x = 0, y = 0;
            for (let i = 0; i < e.touches.length; i++) {
                x += e.touches[i].clientX - r.left;
                y += e.touches[i].clientY - r.top;
            }
            const center = { x: x / 2, y: y / 2 };
            const dx = center.x - lastTouchCenter.x;
            const dy = center.y - lastTouchCenter.y;

            offsetX -= dx / scale;
            offsetY -= dy / scale;

            lastTouchCenter = center;
            redraw();
        }
    };

    const handleTouchEnd = () => {
        isTouchPanning = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        keysPressed.add(e.key);

        if (e.key === " ") {
            canvas.style.cursor = "grab";
        }

        // if (
        //     ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"].includes(
        //         e.key.toLowerCase()
        //     ) &&
        //     !panAnimationId
        // ) {
        //     panAnimationId = requestAnimationFrame(performKeyboardPan);
        // }

        // Reset view
        if (e.altKey && (e.key === "r" || e.key === "R")) {
            offsetX = 0;
            offsetY = 0;
            setScale(1);
            redraw();
        }

        // Fit to content
        if (e.altKey && (e.key === "f" || e.key === "f")) {
            fitToContent(canvas, redraw, scale, setScale);
        }

        // Zoom with Ctrl + +/-/= 
        if (e.ctrlKey && (e.key === "+" || e.key === "=")) {
            e.preventDefault();
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const worldX = screenToWorldX(cx, scale);
            const worldY = screenToWorldY(cy, scale);
            const newScale = Math.min(5, scale * 1.2);
            offsetX = worldX - cx / newScale;
            offsetY = worldY - cy / newScale;
            setScale(newScale);
            redraw();
        }

        if (e.ctrlKey && e.key === "-") {
            e.preventDefault();
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const worldX = screenToWorldX(cx, scale);
            const worldY = screenToWorldY(cy, scale);
            const newScale = Math.max(0.1, scale * 0.8);
            offsetX = worldX - cx / newScale;
            offsetY = worldY - cy / newScale;
            setScale(newScale);
            redraw();
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed.delete(e.key);
        if (e.key === " ") {
            canvas.style.cursor = isPanning ? "grabbing" : "default";
        }
    };

    // const performKeyboardPan = () => {
    //     let dx = 0, dy = 0;
    //     const speed = 20;

    //     // if (keysPressed.has("ArrowLeft") || keysPressed.has("a")) dx -= speed;
    //     // if (keysPressed.has("ArrowRight") || keysPressed.has("d")) dx += speed;
    //     // if (keysPressed.has("ArrowUp") || keysPressed.has("w")) dy -= speed;
    //     // if (keysPressed.has("ArrowDown") || keysPressed.has("s")) dy += speed;

    //     if (dx || dy) {
    //         offsetX += dx / scale;
    //         offsetY += dy / scale;
    //         redraw();
    //     }

    //     if (Array.from(keysPressed).some(k => ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"].includes(k.toLowerCase()))) {
    //         panAnimationId = requestAnimationFrame(performKeyboardPan);
    //     } else {
    //         panAnimationId = null;
    //     }
    // };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Attach listeners
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("contextmenu", handleContextMenu);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    canvas.tabIndex = 0;
    canvas.focus();

    return () => {
        canvas.removeEventListener("wheel", handleWheel);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("contextmenu", handleContextMenu);
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
        canvas.removeEventListener("touchcancel", handleTouchEnd);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        if (panAnimationId) cancelAnimationFrame(panAnimationId);
    };
}

/**
 * Fits all shapes into view
 */
export function fitToContent(
    canvas: HTMLCanvasElement,
    redraw: () => void,
    scale: number,
    setScale: (s: number) => void,
    shapes: Shape[] = []
) {
    if (shapes.length === 0) {
        offsetX = 0;
        offsetY = 0;
        setScale(1);
        redraw();
        return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const shape of shapes) {
        if (shape.type === "rect") {
            minX = Math.min(minX, shape.x);
            minY = Math.min(minY, shape.y);
            maxX = Math.max(maxX, shape.x + shape.width);
            maxY = Math.max(maxY, shape.y + shape.height);
        } else if (shape.type === "ellipse") {
            minX = Math.min(minX, shape.x - shape.radiusX);
            minY = Math.min(minY, shape.y - shape.radiusY);
            maxX = Math.max(maxX, shape.x + shape.radiusX);
            maxY = Math.max(maxY, shape.y + shape.radiusY);
        }
    }

    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const w = maxX - minX;
    const h = maxY - minY;

    const scaleX = canvas.width / w;
    const scaleY = canvas.height / h;
    const newScale = Math.min(scaleX, scaleY, 1);

    setScale(newScale);
    offsetX = minX - (canvas.width / newScale - w) / 2;
    offsetY = minY - (canvas.height / newScale - h) / 2;

    redraw();
}
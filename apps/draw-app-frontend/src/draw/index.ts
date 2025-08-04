import { Shape } from "@/types/shapeType";
import { initInfiniteCanvas, screenToWorldX, screenToWorldY, applyTransform } from "./infiniteCanvas";
import { Point } from "@/types/shapeType";
import { CommunicationMessage } from "@repo/common";

const ARROW_ANGLE = Math.PI / 6;
const ARROW_LENGTH = 10;

/**
 * Draws an arrow from (x1, y1) to (x2, y2) with an arrowhead.
 */
function drawArrow(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    scale: number
) {
    const headLength = ARROW_LENGTH; // Size of arrowhead (in world units)
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);

    // Draw main line (without arrowhead)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - headLength * Math.cos(angle - ARROW_ANGLE),
        y2 - headLength * Math.sin(angle - ARROW_ANGLE)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - headLength * Math.cos(angle + ARROW_ANGLE),
        y2 - headLength * Math.sin(angle + ARROW_ANGLE)
    );
    // ctx.closePath();
    ctx.stroke();
    // ctx.fill(); // Optional: fill the arrowhead
}

function sendMessageInRoom(changes: Shape[], roomId: string | undefined, ws: WebSocket | undefined, type: "ADD" | "UPDATE" | "REMOVE") {
    console.log(`room Id: ${roomId}, ws: ${ws}`);
    
    if (!ws || !roomId) {
        console.log("Web socket pr roomId is null, can't send the message");
        return;
    }
    const data: CommunicationMessage = {
        type: "CHAT",
        roomId,
        delta: {
            type, shapes: changes
        },
    };

    ws.send(JSON.stringify(data));
}
export function initDraw(
    canvas: HTMLCanvasElement,
    shapes: Shape[],
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
    activeShape: string,
    scale: number,
    setScale: (s: number) => void,
    selectedShapes: Shape[],
    setSelectedShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
    webSocket?: WebSocket | undefined,
    roomId?: string
) {

    const ctx = canvas.getContext("2d");
    if (!ctx) return () => { };


    // Initialize infinite canvas
    const cleanupInfinite = initInfiniteCanvas(
        { current: canvas },
        scale,
        setScale,
        () => redraw(canvas, shapes, scale, selectedShapes)
    );

    const addTextInput = function (screenX: number, screenY: number) {
        const rect = canvas.getBoundingClientRect();
        const worldX = screenToWorldX(screenX - rect.left, scale);
        const worldY = screenToWorldY(screenY - rect.top, scale);

        const input = document.createElement("textarea");
        input.className =
            "canvas-text-input py-0.5 absolute bg-transparent text-white border-none rounded font-sans text-base outline-none min-w-[100px] resize-none overflow-hidden z-10";
        input.style.left = screenX + "px";
        input.style.top = screenY + "px";
        input.style.transform = `scale(${scale})`;
        input.style.transformOrigin = "top left";
        input.placeholder = "";
        input.value = ""; // start empty
        input.rows = 1;

        canvas.parentElement?.appendChild(input);
        input.focus();

        autoResizeTextarea(input);

        // Resize as user types
        input.addEventListener("input", () => {
            autoResizeTextarea(input);
        });

        // Finish editing on Enter (without Shift) or blur
        const finishEditing = () => {
            if (input.value.trim()) {
                const newShape: Shape = {
                    id: crypto.randomUUID(),
                    type: "text",
                    x: worldX,
                    y: worldY,
                    content: input.value,
                };

                sendMessageInRoom([newShape], roomId, webSocket, "ADD");
                setShapes((prev) => [...prev, newShape]);
            }
            input.remove();
        };

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                finishEditing();
            } else if (e.key === "Escape") {
                input.remove();
            }
        });

        input.addEventListener("blur", () => {
            // Delay removal to allow click detection
            // setTimeout(finishEditing, 100);
        });
    };
    const autoResizeTextarea = function (textarea: HTMLTextAreaElement) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";

        ctx.font = "16px Cascadia Code, Chalkboard SE, sans-serif";
        ctx.textAlign = "center";
        ctx.letterSpacing = "1px"
        const lines = textarea.value.split("\n");
        const maxWidth = Math.max(
            ...lines.map((line) => ctx.measureText(line).width)
        );
        textarea.style.width = Math.max(100, maxWidth + 20) + "px";
    }
    // Resize handler
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redraw(canvas, shapes, scale, selectedShapes);
    };
    window.addEventListener("resize", resizeCanvas);

    let isDrawing = false;
    let startX = 0, startY = 0;
    let tempPoints: Point[] = [];


    const handleMouseDown = (e: MouseEvent) => {
        if (isPanning() || isTouchPanning()) return;
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        startX = screenToWorldX(e.clientX - rect.left, scale);
        startY = screenToWorldY(e.clientY - rect.top, scale);
        if (activeShape === "draw") {
            tempPoints.push({
                x: startX, y: startY, drag: false
            })
        }
    };


    const handleMouseUp = (e: MouseEvent) => {
        if (!isDrawing) return;
        isDrawing = false;
        const rect = canvas.getBoundingClientRect();
        const endX = screenToWorldX(e.clientX - rect.left, scale);
        const endY = screenToWorldY(e.clientY - rect.top, scale);

        const id = crypto.randomUUID();

        if (canvas.style.cursor === "grabbing") {
            canvas.style.cursor = activeShape === "" ? "default" : "crosshair";
            return;
        }

        if (activeShape === "rect") {
            const newShape: Shape = {
                    id,
                    type: "rect",
                    x: Math.min(startX, endX),
                    y: Math.min(startY, endY),
                    width: Math.abs(endX - startX),
                    height: Math.abs(endY - startY),
            }; 
            setShapes((prev) => [
                ...prev,
                newShape
            ]);
            sendMessageInRoom([newShape], roomId, webSocket, "ADD");
        } else if (activeShape === "ellipse") {
            const newShape: Shape = {
                id,
                type: "ellipse",
                // Store world coordinates
                x: startX + (endX - startX) / 2,
                y: startY + (endY - startY) / 2,
                radiusX: Math.abs(endX - startX) / 2,
                radiusY: Math.abs(endY - startY) / 2,
            };
            setShapes((prev: Shape[]) => [...prev, newShape]);
            sendMessageInRoom([newShape], roomId, webSocket, "ADD");
        } else if (activeShape === "line") {
            const newShape: Shape = {
                id,
                type: "line",
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY
            }
            setShapes((prev: Shape[]) => [...prev, newShape]);
            sendMessageInRoom([newShape], roomId, webSocket, "ADD");
        } else if (activeShape === "arrow") {
            const newShape: Shape = {
                id,
                type: "arrow",
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY
            }
            setShapes((prev: Shape[]) => [...prev, newShape]);
            sendMessageInRoom([newShape], roomId, webSocket, "ADD");
        } else if (activeShape === "draw") {
            const newShape: Shape = {
                id,
                type: "draw",
                points: tempPoints
            }
            setShapes((prev: Shape[]) => [...prev, newShape]);
            sendMessageInRoom([newShape], roomId, webSocket, "ADD");
            tempPoints = [];
        } else {

            // Normalize selection box
            const x1 = Math.min(startX, endX);
            const y1 = Math.min(startY, endY);
            const x2 = Math.max(startX, endX);
            const y2 = Math.max(startY, endY);

            const tempSelectedShapes = shapes.filter((shape) => {
                let left, top, right, bottom;

                if (shape.type === "rect") {
                    left = shape.x;
                    top = shape.y;
                    right = shape.x + shape.width;
                    bottom = shape.y + shape.height;
                } else if (shape.type === "ellipse") {
                    left = shape.x - shape.radiusX;
                    top = shape.y - shape.radiusY;
                    right = shape.x + shape.radiusX;
                    bottom = shape.y + shape.radiusY;
                } else if (shape.type === "line" || shape.type === "arrow") {
                    left = Math.min(shape.startX, shape.endX);
                    top = Math.min(shape.startY, shape.endY);
                    right = Math.max(shape.startX, shape.endX);
                    bottom = Math.max(shape.startY, shape.endY);
                } else if (shape.type === "draw") {
                    if (shape.points.length <= 0) {
                        return false;
                    }
                    let startX = shape.points[0].x, startY = shape.points[0].y;
                    let endX = shape.points[shape.points.length - 1].x, endY = shape.points[shape.points.length - 1].y;
                    left = Math.min(startX, endX);
                    top = Math.min(startY, endY);
                    right = Math.max(startX, endX);
                    bottom = Math.max(startY, endY);
                } else {
                    return false; // Unknown shape
                }

                // Check if bounding boxes intersect
                return left >= x1 &&
                    top >= y1 &&
                    right <= x2 &&
                    bottom <= y2;
            });

            setSelectedShapes(tempSelectedShapes);
            console.log(tempSelectedShapes);

            redraw(canvas, shapes, scale, selectedShapes);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDrawing || isPanning() || isTouchPanning()) return;
        const rect = canvas.getBoundingClientRect();
        const currentX = screenToWorldX(e.clientX - rect.left, scale);
        const currentY = screenToWorldY(e.clientY - rect.top, scale);

        redraw(canvas, shapes, scale, selectedShapes);

        if (canvas.style.cursor === "grabbing") {
            return;
        }

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
        } else if (activeShape === "arrow") {
            drawArrow(ctx, startX, startY, currentX, currentY, scale);

        } else if (activeShape === "draw") {
            tempPoints.push({ x: currentX, y: currentY, drag: true });
            drawFreeHandDrawing(ctx, tempPoints); // draw entire drawing till now
        } else if (activeShape === "") {
            ctx.setLineDash([4 / scale]);
            ctx.fillStyle = "rgba(255, 255, 255, 0.03)";

            ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
            ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);

        }

        ctx.restore();
    };

    const handleMouseClick = (e: MouseEvent) => {
        if (activeShape === "text") {
            addTextInput(e.clientX, e.clientY);
        }
    }

    const handleMouseDoubleClick = (e: MouseEvent) => {
        console.log("Hi");

        addTextInput(e.clientX, e.clientY);
    }


    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleMouseClick);
    canvas.addEventListener("dblclick", handleMouseDoubleClick);
    resizeCanvas();

    return () => {
        cleanupInfinite();
        window.removeEventListener("resize", resizeCanvas);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("click", handleMouseClick);
        canvas.removeEventListener("dblclick", handleMouseDoubleClick);
    };
}

function drawFreeHandDrawing(ctx: CanvasRenderingContext2D, points: Point[]) {
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.lineJoin = "round";

        if (points[i].drag && i) {
            ctx.moveTo(points[i - 1].x, points[i - 1].y);
        } else {
            ctx.moveTo(points[i].x - 1, points[i].y);
        }
        ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.stroke();
    }

}

function redraw(canvas: HTMLCanvasElement, shapes: Shape[], scale: number, selectedShapes: Shape[]) {
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
        } else if (shape.type === "arrow") {
            drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY, scale);
        } else if (shape.type === "draw") {
            drawFreeHandDrawing(ctx, shape.points);
        } else if (shape.type === "text") {
            ctx.font = `16px Cascadia Code, Chalkboard SE, sans-serif`;
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.letterSpacing = "2px"
            ctx.textBaseline = "top";
            ctx.fillText(shape.content, shape.x, shape.y);
        }
    });

    // highlight selected shapes, if any
    if (selectedShapes.length >= 1) {
        if (selectedShapes.length === 1) {
            // only one shape selected
        } else {
            // multiple shapes selected
        }
    }
    ctx.restore();
}

// Helpers
function isPanning() {
    return (window as any).isPanning || false;
}
function isTouchPanning() {
    return (window as any).isTouchPanning || false;
}

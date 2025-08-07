import { DrawingState, Shape } from "@/types/shapeType";
import { initInfiniteCanvas } from "./infiniteCanvas";
import { Point } from "@/types/shapeType";
import { CommunicationMessage } from "@repo/common";
import { redraw } from "./rendering/shapeRenderer";
import { createMouseHandlers } from "./handlers/mouseHandlers";

export type Direction = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";
export type BoundType = { x: number, y: number, width: number, height: number }
export type interactionState = {
  mode: "select" | "draw" | "drag" | "resize",
  isDragging: boolean,
  isResizing: boolean,
  originalBounds?: BoundType 
  resizeHandle?: Direction
}

export const interactionState: interactionState = {
  mode: "select",
  isDragging: false,
  isResizing: false,
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
  drawingStateRef: React.MutableRefObject<DrawingState>,
  selectedShapesRef: React.MutableRefObject<Shape[]>,
  webSocket?: WebSocket | undefined,
  roomId?: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  // Initialize infinite canvas
  const cleanupInfinite = initInfiniteCanvas(
    { current: canvas },
    scale,
    setScale,
    () => redraw(canvas, shapes, scale, selectedShapes)
  );

  // Resize handler
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw(canvas, shapes, scale, selectedShapes);
  };

  // Create mouse handlers
  const mouseHandlers = createMouseHandlers(
    canvas,
    shapes,
    setShapes,
    activeShape,
    scale,
    selectedShapes,
    setSelectedShapes,
    ctx,
    drawingStateRef,
    selectedShapesRef,
    webSocket,
    roomId,
  );

  // Add event listeners
  window.addEventListener("resize", resizeCanvas);
  canvas.addEventListener("mousedown", mouseHandlers.handleMouseDown);
  canvas.addEventListener("mouseup", mouseHandlers.handleMouseUp);
  canvas.addEventListener("mousemove", mouseHandlers.handleMouseMove);
  canvas.addEventListener("click", mouseHandlers.handleMouseClick);
  canvas.addEventListener("dblclick", mouseHandlers.handleMouseDoubleClick);

  resizeCanvas();

  // Cleanup function
  return () => {
    cleanupInfinite();
    window.removeEventListener("resize", resizeCanvas);
    canvas.removeEventListener("mousedown", mouseHandlers.handleMouseDown);
    canvas.removeEventListener("mouseup", mouseHandlers.handleMouseUp);
    canvas.removeEventListener("mousemove", mouseHandlers.handleMouseMove);
    canvas.removeEventListener("click", mouseHandlers.handleMouseClick);
    canvas.removeEventListener("dblclick", mouseHandlers.handleMouseDoubleClick);
  };
}
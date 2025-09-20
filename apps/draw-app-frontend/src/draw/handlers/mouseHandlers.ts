import { DrawingState, Shape } from "@/types/shapeType";
import { screenToWorldX, screenToWorldY } from "../infiniteCanvas";
import { redraw } from "../rendering/shapeRenderer";
import { isPanning, isTouchPanning } from "../utils/canvas";
import { getCombinedBounds, getShapesInSelection } from "../utils/shapeSelection";
import { sendMessageInRoom } from "../utils/websocket";
import { createShape } from "../utils/shapeCreation";
import { renderPreview } from "../rendering/previewRenderer";
import { createTextInput } from "../utils/textInput";
import { getCursorForHandle, getHandleAtPoint, getResizeHandles } from "../utils/resizeHandleManager";
import { interactionState } from "..";
import { handleResize } from "../utils/resize";
import { resizeShapesPreview } from "../rendering/resizePreview";
import { drawSelection } from "../rendering/selectionRenderer";
import { HitTester } from "../utils/hitTest";


export function createMouseHandlers(
  canvas: HTMLCanvasElement,
  shapes: Shape[],
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
  activeShape: string,
  scale: number,
  selectedShapes: Shape[],
  setSelectedShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
  ctx: CanvasRenderingContext2D,
  drawingStateRef: React.MutableRefObject<DrawingState>,
  selectedShapesRef: React.MutableRefObject<Shape[]>,
  webSocket?: WebSocket,
  roomId?: string,
) {

  const handleMouseDown = (e: MouseEvent) => {
    if (isPanning() || isTouchPanning()) return;
    const rect = canvas.getBoundingClientRect();
    drawingStateRef.current.startX = screenToWorldX(e.clientX - rect.left, scale);
    drawingStateRef.current.startY = screenToWorldY(e.clientY - rect.top, scale);

    if (activeShape === "" && selectedShapes.length >= 1 && !interactionState.isResizing) {

      const bounds = getCombinedBounds(selectedShapes, ctx);
      if (bounds) {
        const handle = getHandleAtPoint(bounds, { x: drawingStateRef.current.startX, y: drawingStateRef.current.startY });
        if (handle) {
          interactionState.isResizing = true;
          interactionState.mode = "resize";
          interactionState.originalBounds = { ...bounds };
          interactionState.resizeHandle = handle;
          return;
        }
      }
    }
    drawingStateRef.current.isDrawing = true;

    if (activeShape === "draw") {
      drawingStateRef.current.tempPoints.push({
        x: drawingStateRef.current.startX,
        y: drawingStateRef.current.startY,
        drag: false,
      });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!interactionState.isResizing && !drawingStateRef.current.isDrawing) return;

    drawingStateRef.current.isDrawing = false;
    const rect = canvas.getBoundingClientRect();
    const endX = screenToWorldX(e.clientX - rect.left, scale);
    const endY = screenToWorldY(e.clientY - rect.top, scale);

    if (interactionState.isResizing && interactionState.originalBounds) {
      const deltaX = endX - drawingStateRef.current.startX;
      const deltaY = endY - drawingStateRef.current.startY;

      const newShapes = resizeShapesPreview(
        selectedShapesRef.current,
        interactionState.originalBounds,
        interactionState.resizeHandle!,
        deltaX,
        deltaY,
        ctx
      );

      // ✅ Now update React state
      setShapes(prev =>
        prev.map(s => newShapes.find(ns => ns.id === s.id) || s)
      );

      // Clean up
      setSelectedShapes(newShapes);
      interactionState.isResizing = false;
      interactionState.mode = "select";
      interactionState.originalBounds = undefined;
      interactionState.resizeHandle = undefined;
      drawingStateRef.current.isDrawing = false;
      return;
    }

    if (canvas.style.cursor === "grabbing") {
      canvas.style.cursor = activeShape === "" ? "default" : "crosshair";
      return;
    }

    const newShape = createShape(
      activeShape,
      drawingStateRef.current.startX,
      drawingStateRef.current.startY,
      endX,
      endY,
      drawingStateRef.current.tempPoints
    );

    if (newShape) {
      setShapes((prev) => [...prev, newShape]);
      sendMessageInRoom([newShape], roomId, webSocket, "ADD");

      if (activeShape === "draw") {
        drawingStateRef.current.tempPoints = [];
      }
    } else if (activeShape === "") {
      // Handle selection and click 
      const hitShape = shapes.find(shape => HitTester.hitTestShape(shape, { x: endX, y: endY }, ctx));

      if (hitShape) {
        // Select single shape
        setSelectedShapes([hitShape]);
        redraw(canvas, shapes, scale, [hitShape]);
      } else {
        // Clicked empty space → deselect
        const x1 = Math.min(drawingStateRef.current.startX, endX);
        const y1 = Math.min(drawingStateRef.current.startY, endY);
        const x2 = Math.max(drawingStateRef.current.startX, endX);
        const y2 = Math.max(drawingStateRef.current.startY, endY);
  
        const selectedShapes = getShapesInSelection(shapes, x1, y1, x2, y2, ctx);
        setSelectedShapes(selectedShapes);
        redraw(canvas, shapes, scale, selectedShapes);
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const currentX = screenToWorldX(e.clientX - rect.left, scale);
    const currentY = screenToWorldY(e.clientY - rect.top, scale);

    if (activeShape === "") {
      canvas.style.cursor = "default";
    }
    if (!interactionState.isResizing && activeShape === "") {
      const hitShape = shapes.find(shape => HitTester.hitTestShape(shape, { x: currentX, y: currentY }, ctx));

      if (hitShape) {
        canvas.style.cursor = "move"; // or "grab"
      }
    }
    // This is for selected shape
    if (activeShape === "" && selectedShapes.length > 0) {
      const boundingBox = getCombinedBounds(selectedShapes, ctx);
      const handle = getHandleAtPoint(boundingBox, { x: currentX, y: currentY })
      if (handle) {
        canvas.style.cursor = getCursorForHandle(handle)
      }
    }


    if (interactionState.isResizing) {

      const deltaX = currentX - drawingStateRef.current.startX;
      const deltaY = currentY - drawingStateRef.current.startY;
      if (interactionState.resizeHandle) {

        const newShapes = resizeShapesPreview(
          selectedShapes,
          interactionState.originalBounds!,
          interactionState.resizeHandle,
          deltaX,
          deltaY,
          ctx
        );
        // Optional: Highlight bounding box and handles again
        redraw(canvas, [
          ...shapes.filter(s => !selectedShapes.some(sel => sel.id === s.id)),
          ...newShapes,
        ], scale, newShapes);

      }

    }

    if (!drawingStateRef.current.isDrawing || isPanning() || isTouchPanning()) return;


    redraw(canvas, shapes, scale, selectedShapes);

    if (canvas.style.cursor === "grabbing") return;

    if (activeShape === "draw") {
      drawingStateRef.current.tempPoints.push({
        x: currentX,
        y: currentY,
        drag: true
      });
    }

    renderPreview(
      canvas.getContext("2d")!,
      activeShape,
      drawingStateRef.current.startX,
      drawingStateRef.current.startY,
      currentX,
      currentY,
      scale,
      drawingStateRef.current.tempPoints
    );
  };

  const handleMouseClick = (e: MouseEvent) => {

    if (activeShape === "text") {
      createTextInput(canvas, e.clientX, e.clientY, scale, (content, worldX, worldY) => {
        const newShape: Shape = {
          id: crypto.randomUUID(),
          type: "text",
          x: worldX,
          y: worldY,
          content,
        };

        sendMessageInRoom([newShape], roomId, webSocket, "ADD");
        setShapes((prev) => [...prev, newShape]);
      });
    }
  };

  const handleMouseDoubleClick = (e: MouseEvent) => {
    createTextInput(canvas, e.clientX, e.clientY, scale, (content, worldX, worldY) => {
      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: "text",
        x: worldX,
        y: worldY,
        content,
      };

      sendMessageInRoom([newShape], roomId, webSocket, "ADD");
      setShapes((prev) => [...prev, newShape]);
    });
  };

  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseClick,
    handleMouseDoubleClick,
  };
}



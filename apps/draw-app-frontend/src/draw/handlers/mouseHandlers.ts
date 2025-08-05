import { DrawingState, Shape } from "@/types/shapeType";
import { screenToWorldX, screenToWorldY } from "../infiniteCanvas";
import { redraw } from "../rendering/shapeRenderer";
import { isPanning, isTouchPanning } from "../utils/canvas";
import { getCombinedBounds, getShapesInSelection } from "../utils/shapeSelection";
import { sendMessageInRoom } from "../utils/websocket";
import { createShape } from "../utils/shapeCreation";
import { renderPreview } from "../rendering/previewRenderer";
import { createTextInput } from "../utils/textInput";
import { getCursorForHandle, getHandleAtPoint } from "../utils/resizeHandleManager";


export function createMouseHandlers(
  canvas: HTMLCanvasElement,
  shapes: Shape[],
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
  activeShape: string,
  scale: number,
  selectedShapes: Shape[],
  setSelectedShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
  ctx: CanvasRenderingContext2D,
  webSocket?: WebSocket,
  roomId?: string
) {
  const drawingState: DrawingState = {
    isDrawing: false,
    startX: 0,
    startY: 0,
    tempPoints: [],
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (isPanning() || isTouchPanning()) return;
    
    drawingState.isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    drawingState.startX = screenToWorldX(e.clientX - rect.left, scale);
    drawingState.startY = screenToWorldY(e.clientY - rect.top, scale);
    
    if (activeShape === "draw") {
      drawingState.tempPoints.push({
        x: drawingState.startX,
        y: drawingState.startY,
        drag: false,
      });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!drawingState.isDrawing) return;
    
    drawingState.isDrawing = false;
    const rect = canvas.getBoundingClientRect();
    const endX = screenToWorldX(e.clientX - rect.left, scale);
    const endY = screenToWorldY(e.clientY - rect.top, scale);

    if (canvas.style.cursor === "grabbing") {
      canvas.style.cursor = activeShape === "" ? "default" : "crosshair";
      return;
    }

    const newShape = createShape(
      activeShape,
      drawingState.startX,
      drawingState.startY,
      endX,
      endY,
      drawingState.tempPoints
    );

    if (newShape) {
      setShapes((prev) => [...prev, newShape]);
      sendMessageInRoom([newShape], roomId, webSocket, "ADD");
      
      if (activeShape === "draw") {
        drawingState.tempPoints = [];
      }
    } else if (activeShape === "") {
      // Handle selection
      const x1 = Math.min(drawingState.startX, endX);
      const y1 = Math.min(drawingState.startY, endY);
      const x2 = Math.max(drawingState.startX, endX);
      const y2 = Math.max(drawingState.startY, endY);

      const selectedShapes = getShapesInSelection(shapes, x1, y1, x2, y2, ctx);
      setSelectedShapes(selectedShapes);
      console.log(selectedShapes);
      redraw(canvas, shapes, scale, selectedShapes);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const currentX = screenToWorldX(e.clientX - rect.left, scale);
    const currentY = screenToWorldY(e.clientY - rect.top, scale);
    // This is for selected shape
    if (activeShape === "") {
      const boundingBox = getCombinedBounds(selectedShapes, ctx);
      const handle = getHandleAtPoint(boundingBox, {x: currentX, y: currentY })
      
      if (handle) {
        canvas.style.cursor = getCursorForHandle(handle)
      }
    }
    
    if (!drawingState.isDrawing || isPanning() || isTouchPanning()) return;
    

    redraw(canvas, shapes, scale, selectedShapes);

    if (canvas.style.cursor === "grabbing") return;

    if (activeShape === "draw") {
      drawingState.tempPoints.push({ 
        x: currentX, 
        y: currentY, 
        drag: true 
      });
    }

    renderPreview(
      canvas.getContext("2d")!,
      activeShape,
      drawingState.startX,
      drawingState.startY,
      currentX,
      currentY,
      scale,
      drawingState.tempPoints
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



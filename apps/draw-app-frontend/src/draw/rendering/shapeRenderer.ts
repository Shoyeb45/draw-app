import { Shape } from "@/types/shapeType";
import { applyTransform } from "../infiniteCanvas";
import { drawFreeHandDrawing } from "../utils/freehand";
import { drawArrow } from "../utils/arrow";

export function renderShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  scale: number
) {
  switch (shape.type) {
    case "rect":
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;

    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(shape.x, shape.y, shape.radiusX, shape.radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
      break;

    case "line":
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
      break;

    case "arrow":
      drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY, scale);
      break;

    case "draw":
      drawFreeHandDrawing(ctx, shape.points);
      break;

    case "text":
      ctx.font = `16px Cascadia Code, Chalkboard SE, sans-serif`;
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.letterSpacing = "2px";
      ctx.textBaseline = "top";
      ctx.fillText(shape.content, shape.x, shape.y);
      break;
  }
}

export function redraw(
  canvas: HTMLCanvasElement,
  shapes: Shape[],
  scale: number,
  selectedShapes: Shape[]
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply transform and set styles
  ctx.save();
  applyTransform(ctx, scale);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1 / scale;

  // Render all shapes
  shapes.forEach((shape) => renderShape(ctx, shape, scale));

  // Highlight selected shapes if needed
  if (selectedShapes.length >= 1) {
    // Add selection highlighting logic here
  }

  ctx.restore();
}
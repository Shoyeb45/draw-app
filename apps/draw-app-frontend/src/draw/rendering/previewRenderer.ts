import { Point } from "@/types/shapeType";
import { applyTransform } from "../infiniteCanvas";
import { drawFreeHandDrawing } from "../utils/freehand";
import { drawArrow } from "../utils/arrow";

export function renderPreview(
  ctx: CanvasRenderingContext2D,
  activeShape: string,
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  scale: number,
  tempPoints: Point[]
) {
  ctx.save();
  applyTransform(ctx, scale);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1 / scale;

  switch (activeShape) {
    case "rect":
      ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
      break;

    case "ellipse":
      const width = currentX - startX;
      const height = currentY - startY;
      ctx.beginPath();
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
      break;

    case "line":
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      break;

    case "arrow":
      drawArrow(ctx, startX, startY, currentX, currentY, scale);
      break;

    case "draw":
      drawFreeHandDrawing(ctx, tempPoints);
      break;

    case "":
      // Selection box
      ctx.setLineDash([4 / scale]);
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
      ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
      break;
  }

  ctx.restore();
}
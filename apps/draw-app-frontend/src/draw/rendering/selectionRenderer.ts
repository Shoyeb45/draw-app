import { Shape } from "@/types/shapeType";
import { getResizeHandles } from "../utils/resizeHandleManager";
import { getCombinedBounds } from "../utils/shapeSelection";

export function drawSelection(ctx: CanvasRenderingContext2D, selectedShapes: Shape[]) {
  const bounds = getCombinedBounds(selectedShapes, ctx);
  ctx.strokeStyle = '#0066cc';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  ctx.strokeRect(bounds.x , bounds.y , bounds.width , bounds.height );
  ctx.setLineDash([]);

  // Draw resize handles
  const handles = getResizeHandles(bounds);
  handles.forEach(({ x, y }) => {
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(x - 4, y - 4, 8, 8);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 4, y - 4, 8, 8);
  });
}
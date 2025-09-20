import { Shape } from "@/types/shapeType";
import { getResizeHandles } from "../utils/resizeHandleManager";
import { getCombinedBounds } from "../utils/shapeSelection";

export function drawSelection(ctx: CanvasRenderingContext2D, selectedShapes: Shape[], scale: number) {
  console.log(selectedShapes);
  
  const bounds = getCombinedBounds(selectedShapes, ctx);
  ctx.strokeStyle = '#0066cc';
  ctx.setLineDash([5 , 5 ]);
  ctx.lineWidth = 1 / scale;
  ctx.strokeRect(bounds.x , bounds.y, bounds.width , bounds.height );
  ctx.setLineDash([]);
  
  // Draw resize handles
  const handles = getResizeHandles(bounds);
  handles.forEach(({ x, y }) => {
    ctx.lineWidth = 1 / scale;
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(x - 4, y - 4, 8, 8);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 / scale;
    ctx.strokeRect(x - 4, y - 4, 8, 8);
  });
  ctx.save();
}
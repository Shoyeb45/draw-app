import { Point } from "@/types/shapeType";

export function drawFreeHandDrawing(ctx: CanvasRenderingContext2D, points: Point[]) {
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
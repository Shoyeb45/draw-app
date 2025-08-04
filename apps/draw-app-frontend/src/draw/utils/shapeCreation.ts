import { Point, Shape } from "@/types/shapeType"

export function createShape(
  activeShape: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  tempPoints: Point[]
): Shape | null {
  const id = crypto.randomUUID();

  switch (activeShape) {
    case "rect":
      return {
        id,
        type: "rect",
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
      };

    case "ellipse":
      return {
        id,
        type: "ellipse",
        x: startX + (endX - startX) / 2,
        y: startY + (endY - startY) / 2,
        radiusX: Math.abs(endX - startX) / 2,
        radiusY: Math.abs(endY - startY) / 2,
      };

    case "line":
      return {
        id,
        type: "line",
        startX,
        startY,
        endX,
        endY,
      };

    case "arrow":
      return {
        id,
        type: "arrow",
        startX,
        startY,
        endX,
        endY,
      };

    case "draw":
      return {
        id,
        type: "draw",
        points: [...tempPoints],
      };

    default:
      return null;
  }
}

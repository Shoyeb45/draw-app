import { Shape } from "@/types/shapeType";

export function getShapesInSelection(
  shapes: Shape[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ctx: CanvasRenderingContext2D
): Shape[] {
  return shapes.filter((shape) => {
    const bounds = getShapeBounds(shape, ctx);
    if (!bounds) return false;

    const { left, top, right, bottom } = bounds;
    return left >= x1 && top >= y1 && right <= x2 && bottom <= y2;
  });
}

export function getShapeBounds(shape: Shape, ctx: CanvasRenderingContext2D): { left: number, right: number, top: number, bottom: number } {
  switch (shape.type) {
    case "rect":
      return {
        left: shape.x,
        top: shape.y,
        right: shape.x + shape.width,
        bottom: shape.y + shape.height,
      };

    case "ellipse":
      return {
        left: shape.x - shape.radiusX,
        top: shape.y - shape.radiusY,
        right: shape.x + shape.radiusX,
        bottom: shape.y + shape.radiusY,
      };

    case "line":
    case "arrow":
      return {
        left: Math.min(shape.startX, shape.endX),
        top: Math.min(shape.startY, shape.endY),
        right: Math.max(shape.startX, shape.endX),
        bottom: Math.max(shape.startY, shape.endY),
      };

    case "draw":
      if (shape.points.length <= 0) return {left: 0, right: 0, top: 0, bottom: 0};
      const xs = shape.points.map(p => p.x);
      const ys = shape.points.map(p => p.y);
      return {
        left: Math.min(...xs),
        top: Math.min(...ys),
        right: Math.max(...xs),
        bottom: Math.max(...ys),
      };

    case "text":
      const fontSize = 16;
      // const avgCharWidth = 6;
      const textWidth = ctx.measureText(shape.content).width;
      const textHeight = shape.content.split("\n").length * fontSize;

      return {
        left: shape.x,
        top: shape.y + textHeight,
        right: shape.x + textWidth,
        bottom: shape.y,
      };

    default:
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      };
  }
}


export function getCombinedBounds(shapes: Shape[], ctx: CanvasRenderingContext2D) {
  if (shapes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const bounds = shapes.map(shape => getShapeBounds(shape, ctx)).filter((b): b is NonNullable<typeof b> => b !== null);

  const minX = Math.min(...bounds.map(b => b.left));
  const minY = Math.min(...bounds.map(b => b.top));
  const maxX = Math.max(...bounds.map(b => b.right));
  const maxY = Math.max(...bounds.map(b => b.bottom));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
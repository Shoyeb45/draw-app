import { Shape } from "@/types/shapeType";
import { BoundType, Direction } from "..";
import { calculateNewBounds } from "../utils/resize";
import { getShapeBounds } from "../utils/shapeSelection";

export function resizeShapesPreview(
  selectedShapes: Shape[],
  originalBounds: BoundType,
  handle: Direction,
  deltaX: number,
  deltaY: number,
  ctx: CanvasRenderingContext2D
): Shape[] {
  const tempBounds = { ...originalBounds };
  const newBounds = calculateNewBounds(tempBounds, handle, deltaX, deltaY);

  return selectedShapes.map(shape => {
    return scaleShapeToNewBounds(shape, originalBounds, newBounds, ctx);
  });
}
function scaleShapeToNewBounds(
  shape: Shape,
  oldBounds: BoundType,
  newBounds: BoundType,
  ctx: CanvasRenderingContext2D
): Shape {
  const shapeBounds = getShapeBounds(shape, ctx);
  const oldLeft = shapeBounds.left;
  const oldTop = shapeBounds.top;
  const oldRight = shapeBounds.right;
  const oldBottom = shapeBounds.bottom;

  const scaleX = newBounds.width / oldBounds.width;
  const scaleY = newBounds.height / oldBounds.height;

  const offsetX = newBounds.x - oldBounds.x;
  const offsetY = newBounds.y - oldBounds.y;

  // Map old local position relative to oldBounds → newBounds
  const mapX = (x: number) => newBounds.x + (x - oldBounds.x) * scaleX;
  const mapY = (y: number) => newBounds.y + (y - oldBounds.y) * scaleY;

  switch (shape.type) {
    case "rect":
      return {
        ...shape,
        x: mapX(shape.x),
        y: mapY(shape.y),
        width: shape.width * scaleX,
        height: shape.height * scaleY,
      };

    case "ellipse":
      return {
        ...shape,
        x: mapX(shape.x),
        y: mapY(shape.y),
        radiusX: shape.radiusX * scaleX,
        radiusY: shape.radiusY * scaleY,
      };

    case "text":
      return {
        ...shape,
        x: mapX(shape.x),
        y: mapY(shape.y), // assuming y is baseline
      };

    case "line":
    case "arrow":
      return {
        ...shape,
        startX: mapX(shape.startX),
        startY: mapY(shape.startY),
        endX: mapX(shape.endX),
        endY: mapY(shape.endY),
      };

    case "draw":
      return {
        ...shape,
        points: shape.points.map(p => ({
          ...p,
          x: mapX(p.x),
          y: mapY(p.y),
        })),
      };

    default:
      return shape;
  }
}
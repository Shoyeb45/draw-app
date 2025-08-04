export type { Shape, Point } from "@repo/common";
import  type { Point } from "@repo/common";

export interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  tempPoints: Point[];
}
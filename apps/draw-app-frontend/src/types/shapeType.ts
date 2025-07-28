export type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "ellipse",
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
};
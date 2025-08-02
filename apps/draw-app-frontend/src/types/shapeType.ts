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
} | {
    type: "line",
    startX: number,
    startY: number,
    endX: number,
    endY: number,
} | {
    type: "arrow",
    startX: number,
    startY: number,
    endX: number,
    endY: number
} | {
    type: "draw",
    points: Point[]
} | {
    type: "text",
    x: number,
    y: number,
    content: string
};


export type Point = {
    x: number, y: number, drag?: boolean
}
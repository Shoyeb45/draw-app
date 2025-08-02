export type Shape = {
    id: string,
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    id: string,
    type: "ellipse",
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
} | {
    id: string,
    type: "line",
    startX: number,
    startY: number,
    endX: number,
    endY: number,
} | {
    id: string,
    type: "arrow",
    startX: number,
    startY: number,
    endX: number,
    endY: number
} | {
    id: string,
    type: "draw",
    points: Point[]
} | {
    id: string,
    type: "text",
    x: number,
    y: number,
    content: string
};


export type Point = {
    x: number, y: number, drag?: boolean
}
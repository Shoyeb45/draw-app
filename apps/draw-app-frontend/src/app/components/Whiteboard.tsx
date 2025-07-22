"use client";



type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "circle",
    x: number,
    y: number,
    radius: number,
};

import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { initDraw } from "../draw";

export function Whiteboard() {
    const [shapes, setShape] = useState<Shape[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        initDraw(canvas, shapes);
    }, [canvasRef])

    return <div>
        <canvas ref={canvasRef} height={1200} width={1200}></canvas>
    </div>
}
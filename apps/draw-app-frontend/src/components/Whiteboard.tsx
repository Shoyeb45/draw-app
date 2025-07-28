"use client";

import { initDraw } from "@/app/draw";
import { useShapeContext } from "@/context/store";
import { useContext, useEffect, useRef, useState } from "react";



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



export function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { shapes, setShapes, shape } = useShapeContext();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        
        const cleanup = initDraw(canvas, shapes, setShapes, shape);

        return () => {
            if (cleanup) cleanup();
        };
    }, [canvasRef, shape, shapes]);


    return <div>
        <canvas ref={canvasRef} height={1200} width={1200}></canvas>
    </div>
}
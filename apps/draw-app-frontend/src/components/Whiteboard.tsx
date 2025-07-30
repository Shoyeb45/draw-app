"use client";

import { initDraw } from "@/app/draw";
import { useShapeContext } from "@/context/store";
import { useContext, useEffect, useRef, useState } from "react";




export function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { selectedShapes, setSelectedShapes, shapes, setShapes, shape, scale, setScale, setCursorType, cursorType } = useShapeContext();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.style.cursor = cursorType;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        
        const cleanup = initDraw(canvas, shapes, setShapes, shape, scale, setScale, selectedShapes, setSelectedShapes);

        return () => {
            if (cleanup) cleanup();
        };
    }, [canvasRef, shape, shapes, scale, cursorType]);


    return <div>
        <canvas ref={canvasRef} height={1200} width={1200}></canvas>
    </div>
}
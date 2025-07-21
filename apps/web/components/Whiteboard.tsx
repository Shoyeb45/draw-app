"use client";

import { useEffect, useRef } from "react";

export default function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.strokeRect(20, 20, 123, 123);
    })
    return (
        <div>
            <canvas height={500} width={500}></canvas>
        </div>
    )
}
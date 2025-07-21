"use client";

import { useEffect } from "react";
import { useRef } from "react";

export function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        ctx.strokeRect(0, 0, 123, 123);
    }, [canvasRef])

    return <div>
        <canvas height={600} width={600} ref={canvasRef}></canvas>
    </div>
}
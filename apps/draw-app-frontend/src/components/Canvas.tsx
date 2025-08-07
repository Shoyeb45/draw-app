"use client";

import { initDraw } from "@/draw/index";
import { useShapeContext } from "@/context/store";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { CommunicationMessage, ClientSideMessage, Delta } from "@repo/common";
import { performShapeChanges } from "@repo/common";
import { Shape } from "@repo/common";
import { DrawingState } from "@/types/shapeType";


export function Canvas({ roomId }: { roomId?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { selectedShapes, setSelectedShapes, shapes, setShapes, shape, scale, setScale, setCursorType, cursorType } = useShapeContext();
    const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);
    const [isInitialized, setIsInitialized] = useState(false);
    const drawingStateRef = useRef<DrawingState>({
        isDrawing: false,
        startX: 0,
        startY: 0,
        tempPoints: [],
    });
    // Load shapes from localStorage on mount
    useEffect(() => {
        const storedShapes = localStorage.getItem("shapes");
        if (storedShapes) {
            try {
                const parsedShapes = JSON.parse(storedShapes);
                setShapes(parsedShapes);
            } catch (e) {
                console.error("Error parsing shapes from localStorage", e);
            }
        }
        setIsInitialized(true);
    }, [setShapes]);

    // ✅ Add ref for selectedShapes to avoid stale closures
    const selectedShapesRef = useRef<Shape[]>([]);
    useEffect(() => {
        selectedShapesRef.current = selectedShapes;
    }, [selectedShapes]);

    // Save shapes to localStorage whenever shapes change
    useEffect(() => {
        if (isInitialized && shapes) {
            localStorage.setItem("shapes", JSON.stringify(shapes));
        }
    }, [shapes, isInitialized]);

    // Initialize canvas and WebSocket
    useEffect(() => {
        if (!isInitialized) return; // Wait for localStorage load to complete

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.style.cursor = cursorType;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        console.log(shapes);

        // Set up WebSocket connection
        console.log(roomId);
        if (roomId && !webSocket) {

            const ws = new WebSocket(`ws://localhost:8080`);
            ws.onopen = () => {
                setWebSocket(ws);
                const data: CommunicationMessage = {
                    type: "JOIN_ROOM",
                    roomId,
                    shapes
                };
                ws.send(JSON.stringify(data));

                ws.onmessage = (message) => {
                    try {
                        type MessageType = {
                            shapes: Shape[]
                        }
                        const data: ClientSideMessage | Delta = JSON.parse(message.data)
                        const newShapes: Shape[] = data.shapes ?? [];

                        if (data.type === "INITIALISE") {
                            setShapes(newShapes);
                        } else {
                            const updateShapes = performShapeChanges(newShapes, shapes, data.type);
                            setShapes(updateShapes);
                        }

                    } catch (error) {
                        console.error(error);

                    }
                }
            };

            ws.onclose = () => {
                setWebSocket(undefined);

            };
        }
        if (webSocket) {
            webSocket.onmessage = (message) => {
                try {
                    type MessageType = {
                        shapes: Shape[]
                    }
                    const data: ClientSideMessage | Delta = JSON.parse(message.data)
                    const newShapes: Shape[] = data.shapes ?? [];

                    if (data.type === "INITIALISE") {
                        setShapes(newShapes);
                    } else {
                        const updateShapes = performShapeChanges(shapes, newShapes, data.type);
                        setShapes(updateShapes);
                    }

                } catch (error) {
                    console.error(error);

                }
            }
        }
        const cleanup = initDraw(canvas, shapes, setShapes, shape, scale, setScale, selectedShapes, setSelectedShapes, drawingStateRef, selectedShapesRef, webSocket, roomId);

        return () => {
            if (cleanup) cleanup();
            // Note: No need to save here since we save on every shapes change
        };
    }, [isInitialized, canvasRef, shape, shapes, scale, cursorType, roomId, selectedShapes, setSelectedShapes, setShapes, setScale]);

    return (
        <div>
            <canvas ref={canvasRef} height={1200} width={1200}></canvas>
        </div>
    );
}
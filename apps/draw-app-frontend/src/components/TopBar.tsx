"use client";
import { useShapeContext } from "@/context/store"

export function Topbar() {
    const { shape, setShape, setIsDrawingShape } = useShapeContext();

    return (
        <div className="absolute text-white flex gap-3">
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("ellipse");
                setIsDrawingShape(true);
            }}>Circle</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("rect");
                setIsDrawingShape(true);
            }}>Rectangle</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("line");
                setIsDrawingShape(true);
            }}>Line</button>
        </div>
    )
}
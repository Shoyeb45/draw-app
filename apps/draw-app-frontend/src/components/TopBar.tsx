"use client";
import { useShapeContext } from "@/context/store"

export function Topbar() {
    const { shape, setShape, setCursorType } = useShapeContext();

    return (
        <div className="absolute text-white flex gap-3">
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("ellipse");
                setCursorType("crosshair");
            }}>Circle</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("rect");
                setCursorType("crosshair");
            }}>Rectangle</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("line");
                setCursorType("crosshair");
            }}>Line</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("arrow");
                setCursorType("crosshair");
            }}>Arrow</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("");
                setCursorType("default");
            }}>Select</button>
            

        </div>
    )
}
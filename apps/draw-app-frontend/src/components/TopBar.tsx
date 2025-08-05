"use client";
import { useShapeContext } from "@/context/store"

export function Topbar() {
    const { setShape, setCursorType, setSelectedShapes } = useShapeContext();

    return (
        <div className="absolute text-white flex gap-3">
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("ellipse");
                setSelectedShapes([]);
                setCursorType("crosshair");
            }}>Circle</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("rect");
                setSelectedShapes([]);
                setCursorType("crosshair");
            }}>Rectangle</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("line");
                setSelectedShapes([]);
                setCursorType("crosshair");
            }}>Line</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("arrow");
                setSelectedShapes([]);
                setCursorType("crosshair");
            }}>Arrow</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("draw");
                setSelectedShapes([]);
                setCursorType("crosshair");
            }}>Draw</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("text");
                setSelectedShapes([]);
                setCursorType("crosshair");
            }}>Text</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {
                setShape("");
                setSelectedShapes([]);
                setCursorType("default");
            }}>Select</button>
            <button className="bg-yellow-500 p-2 rounded-xl" onClick={(e) => {

            }}>Share</button>
            

        </div>
    )
}
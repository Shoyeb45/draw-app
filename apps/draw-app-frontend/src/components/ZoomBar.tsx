"use client"
import { useShapeContext } from "@/context/store";

export function ZoomBar() {
    const { scale, setScale, shapes } = useShapeContext();
    
    // Zoom configuration
    const ZOOM_FACTOR = 1.2;
    const MIN_SCALE = 0.1;
    const MAX_SCALE = 5;
    
    const handleZoomIn = () => {
        const newScale = Math.min(MAX_SCALE, scale * ZOOM_FACTOR);
        setScale(newScale);
    };
    
    const handleZoomOut = () => {
        const newScale = Math.max(MIN_SCALE, scale / ZOOM_FACTOR);
        setScale(newScale);
    };
    
    const handleResetZoom = () => {
        setScale(1);
    };

    return (
        <div className="absolute bg-white flex bottom-2 p-2 text-center gap-5 rounded-xl justify-center items-center">
            <button 
                className={"text-2xl font-black hover:bg-gray-100 px-2 py-1 rounded " + (scale <= MIN_SCALE ? "font-light": "")} 
                onClick={handleZoomOut}
                disabled={scale <= MIN_SCALE}
            > 
                - 
            </button>
            <div 
                className="flex justify-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded" 
                onClick={handleResetZoom}
                title="Click to reset zoom to 100%"
            > 
                {(scale * 100).toFixed(0)}% 
            </div>
            <button 
                className={"text-2xl font-bold hover:bg-gray-100 px-2 py-1 rounded " + (scale >= MAX_SCALE ? "font-light": "")}
                onClick={handleZoomIn}
                disabled={scale >= MAX_SCALE}
            > 
                + 
            </button>
        </div>
    );
}
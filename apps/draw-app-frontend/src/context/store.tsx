"use client"
import { Shape } from '@/types/shapeType';
import { BlobOptions } from 'buffer';
import { createContext, useContext, useState, ReactNode } from 'react'

type ContextType = {
    shapes: Shape[];
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
    shape: string,
    setShape: (shape: string) => void,
    cursorType: string,
    setCursorType: React.Dispatch<React.SetStateAction<string>>,
    scale: number,
    setScale: React.Dispatch<React.SetStateAction<number>>,
    selectedShapes: Shape[],
    setSelectedShapes: React.Dispatch<React.SetStateAction<Shape[]>>
}


const Context = createContext<ContextType | null>(null);

type ContextProviderProps = {
    children: ReactNode
}


export const ContextProvider = ({ children }: ContextProviderProps) => {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [shape, setShape] = useState<string>("");
    const [cursorType, setCursorType] = useState<string>("default");
    const [scale, setScale] = useState<number>(1);
    const [selectedShapes, setSelectedShapes] = useState<Shape[]>([]);
    
    return (
        <Context.Provider value={{ setSelectedShapes, selectedShapes, shapes, setShapes, shape, setShape, cursorType, setCursorType, scale, setScale }}>
            {children}
        </Context.Provider>
    )
}


export const useShapeContext = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useShapeContext must be used within a ContextProvider");
    }
    return context;
}
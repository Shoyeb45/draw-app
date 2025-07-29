"use client"
import { Shape } from '@/types/shapeType';
import { BlobOptions } from 'buffer';
import { createContext, useContext, useState, ReactNode } from 'react'

type ContextType = {
    shapes: Shape[];
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
    shape: string,
    setShape: (shape: string) => void,
    isDrawingShape: boolean,
    setIsDrawingShape: React.Dispatch<React.SetStateAction<boolean>>,
    scale: number,
    setScale: React.Dispatch<React.SetStateAction<number>>
}


const Context = createContext<ContextType | null>(null);

type ContextProviderProps = {
    children: ReactNode
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [shape, setShape] = useState<string>("");
    const [isDrawingShape, setIsDrawingShape] = useState<boolean>(false);
    const [scale, setScale] = useState<number>(1);

    return (
        <Context.Provider value={{ shapes, setShapes, shape, setShape, isDrawingShape, setIsDrawingShape, scale, setScale}}>
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
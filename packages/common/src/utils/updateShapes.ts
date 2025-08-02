import { Shape } from "../types/shape.types";

export function performShapeChanges(
    oldShapes: Shape[],
    newShapes: Shape[],
    type: "ADD" | "REMOVE" | "UPDATE"
): Shape[] {
    if (!oldShapes || !newShapes) {
        return [];
    }

    let newArrayShapes: Shape[] = [];

    switch (type) {
        case "ADD":
            newArrayShapes = [...oldShapes, ...newShapes];
            break;

        case "REMOVE":
            const toRemoveIds = new Set(newShapes.map(shape => shape.id));
            newArrayShapes = oldShapes.filter(shape => !toRemoveIds.has(shape.id));
            break;

        case "UPDATE":
            const updateMap = new Map(newShapes.map(shape => [shape.id, shape]));
            newArrayShapes = oldShapes.map(shape => updateMap.get(shape.id) || shape);
            break;

        default:
            newArrayShapes = [...oldShapes]; // fallback
            break;
    }

    return newArrayShapes;
}

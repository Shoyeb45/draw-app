import { Shape } from "./shape.types"

export type Delta = {
    type: "ADD" | "REMOVE" | "UPDATE",
    shapes: Shape[]
}
export type CommunicationMessage = {
    type: "CHAT",
    roomId: string,
    delta: Delta 
} | {
    type: "JOIN_ROOM",
    roomId: string,
    shapes: Shape[] 
} | {
    type: "LEAVE_ROOM",
    roomId: string,
};
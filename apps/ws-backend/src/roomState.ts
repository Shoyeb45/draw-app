import { Delta, performShapeChanges, Shape, ClientSideMessage } from '@repo/common';
import WebSocket from 'ws'; // Make sure this import is present if using Node.js

interface User {
    userId: string;
    ws: WebSocket;
}

class Rooms {
    private static instance: Rooms;
    private rooms: Map<string, User[]> = new Map();
    private roomState: Map<string, Shape[]> = new Map();
    private constructor() {}

    public static getInstance(): Rooms {
        if (!Rooms.instance) {
            Rooms.instance = new Rooms();
        }
        return Rooms.instance;
    }

    public addUser(roomId: string, userId: string, ws: WebSocket, oldShapes: Shape[]): void {
        const user: User = { userId, ws };

        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, []);
            this.roomState.set(roomId, oldShapes);
        }
        // Check if the user already exists, then no need to add
        if (this.rooms.get(roomId)?.some((user: User) => user.userId === userId)) {
            console.log("User already exists in state");
            const shapes = this.roomState.get(roomId);
            if (ws.readyState === WebSocket.OPEN) {
                const msg: ClientSideMessage = {
                    type: "INITIALISE",
                    shapes: shapes ?? []
                }
                ws.send(JSON.stringify(msg))
            }
            return;
        }
        const shapes = this.roomState.get(roomId);

        if (ws.readyState === WebSocket.OPEN) {
            const msg: ClientSideMessage = {
                type: "INITIALISE",
                shapes: shapes ?? []
            }
            ws.send(JSON.stringify(msg))
        }
        this.rooms.get(roomId)!.push(user);
    }

    public brodcastChanges(roomId: string, shapes: Shape[] | undefined, type: "ADD" | "REMOVE" | "UPDATE", currentWs: WebSocket): void {
        try {
            const users = this.rooms.get(roomId);
            // First send the changes to all the connected users
            users?.forEach((user: User) => {
                if (user.ws.readyState === WebSocket.OPEN && currentWs != user.ws) {
                    const msg: Delta = {
                        type,
                        shapes: shapes ?? []
                    } 
                    user.ws.send(JSON.stringify(msg));
                }
            });
    
            // Now calculate the change and update the state
            const oldShapes = this.roomState.get(roomId);
            const updatedState = performShapeChanges(oldShapes, shapes, type)
            this.roomState.set(roomId, updatedState);
        } catch (error) {
            console.log(error);
            
        }
    }

    public removeUser(roomId: string, userId: string): void {
        console.log("User removed with id: " + userId);
        
        const users = this.rooms.get(roomId)?.filter(user => user.userId !== userId) || [];

        if (users.length === 0) {
            this.rooms.delete(roomId);
            this.roomState.delete(roomId);
        } else {
            this.rooms.set(roomId, users);
        }
    }
}

export default Rooms;

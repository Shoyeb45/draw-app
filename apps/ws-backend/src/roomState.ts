import { Delta, Shape } from '@repo/common';
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
        }
        // Check if the user already exists, then no need to add
        if (this.rooms.get(roomId)?.some((user: User) => user.userId === userId)) {
            console.log("User already exists in state");
            return;
        }
        this.rooms.get(roomId)!.push(user);
    }

    public brodcastChanges(roomId: string, new_shapes: Delta | undefined): void {
        const users = this.rooms.get(roomId);
        // First send the changes to all the connected users
        users?.forEach((user: User) => {
            if (user.ws.readyState === WebSocket.OPEN) {
                user.ws.send(JSON.stringify(new_shapes));
            }
        });

        // Now calculate the change and update the state
    }

    public removeUser(roomId: string, userId: string): void {
        const users = this.rooms.get(roomId)?.filter(user => user.userId !== userId) || [];

        if (users.length === 0) {
            this.rooms.delete(roomId);
        } else {
            this.rooms.set(roomId, users);
        }
    }
}

export default Rooms;

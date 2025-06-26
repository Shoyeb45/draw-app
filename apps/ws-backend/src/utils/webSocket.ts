import { WebSocketServer } from "ws";

export const createWebSocket = () => {
    const wss = new WebSocketServer({
        port: 8080
    });
    
    return wss;
}
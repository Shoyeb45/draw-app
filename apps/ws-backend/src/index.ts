import { createWebSocket } from "./utils/webSocket";

const wss = createWebSocket();

wss.on("connection", (ws) => {
    ws.on('message', (data, isBinary) => {
        ws.send("Pong")
    })
})
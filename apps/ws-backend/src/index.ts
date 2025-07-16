import { createWebSocket } from "./utils/webSocket";
import * as cookie from "cookie";
import { verifyUser } from "./utils/verifyUser";
const wss = createWebSocket();

wss.on("connection", (ws, request) => {
    const cookies = cookie.parse(request.headers.cookie || "");
    const token = cookies["token"];

    const userId = verifyUser(token);

    if (!userId) {
        console.log("Failed to verify user")
        return null;
    }
    ws.on('message', (data, isBinary) => {
        ws.send("Pong")
    })
})
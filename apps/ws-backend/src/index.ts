import { createWebSocket } from "./utils/webSocket";
import * as cookie from "cookie";
import { verifyUser } from "./utils/verifyUser";
import Rooms from "./roomState";
import type { CommunicationMessage } from "@repo/common";
import { performShapeChanges } from "@repo/common";
const wss = createWebSocket();

wss.on("connection", (ws, request) => {
    const cookies = cookie.parse(request.headers.cookie || "");
    const token = cookies["token"];

    const userId = verifyUser(token);

    if (!userId) {
        console.log("Failed to verify user");
        ws.close(); 
        return null;
    }
    ws.on('message', (data, isBinary) => {
        let parsedData: CommunicationMessage;

        if (typeof data === "string") {
            parsedData = JSON.parse(data);
        } else {
            parsedData = JSON.parse(data.toString());
        }

        if (parsedData.type === "JOIN_ROOM") {
            console.log("User with user id: " + userId + " joined the room with id: " + parsedData.roomId);
            Rooms.getInstance().addUser(parsedData.roomId, userId, ws, parsedData.shapes);
        } else if (parsedData.type === "LEAVE_ROOM") {
            console.log("User with user id: " + userId + " leave the room with id: " + parsedData.roomId);
            Rooms.getInstance().removeUser(parsedData.roomId, userId);
        } else if (parsedData.type === "CHAT") {
            
            Rooms.getInstance().brodcastChanges(parsedData.roomId, parsedData.delta.shapes, parsedData.delta.type, ws);
        }
    })
})
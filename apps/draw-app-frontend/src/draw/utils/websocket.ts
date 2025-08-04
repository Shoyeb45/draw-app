import { CommunicationMessage } from "@repo/common";
import { Shape } from "@/types/shapeType";

export function sendMessageInRoom(
  changes: Shape[],
  roomId: string | undefined,
  ws: WebSocket | undefined,
  type: "ADD" | "UPDATE" | "REMOVE"
) {
  console.log(`room Id: ${roomId}, ws: ${ws}`);
  
  if (!ws || !roomId) {
    console.log("Web socket or roomId is null, can't send the message");
    return;
  }

  const data: CommunicationMessage = {
    type: "CHAT",
    roomId,
    delta: {
      type,
      shapes: changes,
    },
  };

  ws.send(JSON.stringify(data));
}
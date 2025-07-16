import jwt from "jsonwebtoken";
import { config } from "@repo/backend-common";
import prisma  from "@repo/db/client";

export function verifyUser(token: string | undefined): string | null  {
    // verify the token with jwt secret and return true or false 
    try {
        if (!token) {
            console.log("Given token is null");
            return null;
        }

        const decoded = jwt.verify(token, config.jwt_secret ?? "JWT_SECRET");

        if (typeof decoded == "string" || !decoded || !decoded.id) {
            console.log("Decoded is a type of string or user id is not present")
            return null;
        }

        return decoded.id;
    } catch(e) {
        if (e instanceof Error) {
            console.log(e.message)
        } 

        return null;
    }
}
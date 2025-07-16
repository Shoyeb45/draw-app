import jwt from "jsonwebtoken";
import { config } from "@repo/backend-common"

function generateAccessToken(id: string, email: string, name: string | null): string {
    return jwt.sign({ id, name, email}, config.jwt_secret ?? "JWT_SECRET", { expiresIn: "1d"});
}

function generateRefreshToken(id: string): string {
    return jwt.sign({ id }, config.jwt_secret ?? "JWT_SECRET", { expiresIn: "7d" });
}


export {
    generateAccessToken,
    generateRefreshToken
}
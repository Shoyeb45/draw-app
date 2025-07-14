import prisma from "@repo/db/client";
import jwt from "jsonwebtoken";

function generateAccessToken(id: number, email: string, name: string | null): string {
    return jwt.sign({ id, name, email}, process.env.JWT_SECRET ?? "JWT_SECRET", { expiresIn: "1d"});
}

function generateRefreshToken(id: number): string {
    return jwt.sign({ id }, process.env.JWT_SECRET ?? "JWT_SECRET", { expiresIn: "7d" });
}


export {
    generateAccessToken,
    generateRefreshToken
}
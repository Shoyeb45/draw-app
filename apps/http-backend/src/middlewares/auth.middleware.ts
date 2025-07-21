import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/loggeer";
import jwt from "jsonwebtoken";
import prisma from "@repo/db/client";
import { StatusCodes, ReasonPhrases } from "http-status-codes";



/**
 * 
 * @param request 
 * @param response 
 * @param next 
 * @returns 
 * @author Shoyeb Ansari
 */
export async function verify(request: Request, response: Response, next: NextFunction) {
    try {
        // get token from cookies
        const token = request.cookies?.token;
        if (!token) {
            logger.warn("No token found in cookies")
            response.status(StatusCodes.NOT_FOUND).json({
                "success": false,
                "message": "No token found, invalid access."
            });
            return;
        }

        // verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET ?? "JWT_SECRET");
   
        if (!decodedToken || typeof decodedToken === "string") {
            logger.warn("Failed to decode jwt token");
            response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
                "success": false,
                "message": "Failed to decode token"
            });
            return;
        }

    
        request.id = decodedToken.id;
        next();
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to verify user\n${error}`)
            response.status(500).json({
                "success": false,
                "message": "Internal Server Error " + error.message
            });
            return;
        }
        logger.error(`Failed to verify user\n${error}`);
        response.status(500).json({
            "success": false,
            "message": "Internal Server Error "
        });
        return;
    }      
} 
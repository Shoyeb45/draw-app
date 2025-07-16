import { Request, Response } from "express";
import { logger } from "../utils/loggeer";
import { ZodError, ZRoom } from "@repo/common";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import prisma from "@repo/db/client";

export async function createRoom( request: Request, response: Response ) {
    try {
        console.log(request.body);
        
        const body = ZRoom.parse(request.body);

        // check if the room name exists already
        const room = await prisma.room.findUnique({
            where: {
                slug: body.slug
            }
        });

        if (room) {
            logger.warn("Room name already exist, so not creating one");
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                "success": true,
                "message": "Room name already exists"
            })
            return;
        }

        // create new room
        const roomCreated = await prisma.room.create({
            data: {
                slug: body.slug,
                adminId: request.user?.id ?? "No id"
            }
        })

        if (!roomCreated) {
            logger.warn("Room not created");
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                "success": true,
                "message": "Failed to create room"
            })
        }
        response.status(StatusCodes.CREATED).json({
            "success": true,
            "message": "Room created with name " + body.slug,
            "roomId": roomCreated.id 
        })
    } catch (error) {
        if (error instanceof ZodError) {
            logger.error("Zod error in create room endpoint");
            logger.error(error.message)
            response.status(StatusCodes.BAD_REQUEST).json({
                "success": false,
                "message": error.errors
            });
            return;
        } else if (error instanceof Error) {
            logger.error(error.message);
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                "success": false,
                "message": `${ReasonPhrases.INTERNAL_SERVER_ERROR} - ${error.message}`
            });
            return;
        }
    }
} 
import { Request, Response } from "express" 
import { ZUser } from "@repo/common";
import prisma from "@repo/db/client";
import { ZodError } from "@repo/common";
import bcryptjs, { hash } from  "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";
import { logger } from "../utils/loggeer";

/**
 * Function which will be called when `/api/v1/user/signup` endpoint will be hit  
 */
export const signup = async (req: Request, res: Response) => {
    try {
        // parse the body
        let body = ZUser.parse(req?.body);
        
        // check if the user is already present
        const foundUser = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });

        if (foundUser) {
            logger.warn("User already exists, so no need of signup")
            res.status(409).json({
                "success": false,
                "message": "User already exist"
            })
            return;
        }
        
        // Hash the password
        const hashedPassword  = await bcryptjs.hash(body.password, 10);
        
        // update the database
        const dbUser = await prisma.user.create({
            data: {
                email: body.email,
                password: hashedPassword
            },
        });
        
        
        // database couldn't updated
        if (!dbUser) {
            logger.warn("Failed to create enw user in db")
            res.status(500).json({
                success: false,
                message: "Failed to create new user in database"
            })
            return;
        }

        res.status(200).json({
            message: "User created succesfully",
            success: true,
            user: dbUser
        })
    } catch (error) {
        if(error instanceof ZodError){
            logger.error("Zod error in signup")
            logger.error(error)
            res.status(500).json({
                "success": false,
                "errors": error.errors
            });
            return;
        }
        if (error instanceof Error) {
            logger.error("Error in signup while creating new user")
            logger.error(error)
            res.status(500).json({
                "success": false,
                "error": "Internal server error occurred"             
            })
            return;
        }
    }
}


/**
 * 
 * @param req Request object
 * @param res Response object
 */
export const signin = async (req: Request, res: Response) => {
    try {
        // parse the body
        const body = ZUser.parse(req.body);

        // check if the user is present or not
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });

        
        if (!user) {
            logger.warn("User not found, so not logging in...")
            res.status(404).json({
                "success": false,
                "message": "User not found"
            });
            return;
        }

        // compare the password
        const isPasswordTrue = await bcryptjs.compare(body.password, user.password);

        
        if (!isPasswordTrue) {
            logger.warn("Password did not match while logging in")
            res.status(401).json({
                "success": false,
                "message": "Password did not match"
            })
        }

        // generate jwt
        const accessToken = generateAccessToken(user.id, user.email, user.name);
        const refreshToken = generateRefreshToken(user.id);
        
        // set the cookies
        res
            .cookie("token", accessToken, option) 
            .status(200)
            .json({
                "success": true,
                "message": "User logged in succesfully"
            })
        return;
    } catch (error) {
        if (error instanceof ZodError) {
            logger.error("Zod error in signin")
            logger.error(error)
            res.status(500).json({
                "success": false,
                "error": error.errors
            });
            return;
        } else if (error instanceof Error) {
            logger.error("Error in signing in user")
            logger.error(error)
            res.status(500).json({
                "success": false,
                "error": error.message
            })
            return;
        }
        
        res.status(500).json({
            "success": false,
            "error": "Internal Server error"
        })
    }
}


export const createRoom = async (req: Request, res: Response) => {
    try {
        // autheticated user

        // create a room

        // send the response
    } catch (error) {
        
    }
}
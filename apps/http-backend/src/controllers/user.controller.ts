import { Request, Response } from "express" 
import { ZUserSignup, ZUserSigin } from "@repo/common";
import prisma from "@repo/db/client";
import { ZodError } from "@repo/common";

/**
 * Function which will be called when `/api/v1/user/signup` endpoint will be hit  
 */
export const signup = async (req: Request, res: Response) => {
    try {
        // parse the body
        let body = ZUserSignup.parse(req?.body);
        
        // check if the user is already present

        // Hash the password

        // update the database
        const dbUser = await prisma.user.create({
            data: body,
        });

        // database couldn't updated
        if (!dbUser) {

        }

        res.status(200).json({
            message: "User created succesfully",
            success: true,
            user: dbUser
        })
    } catch (error) {
        if(error instanceof ZodError){
            res.status(500).json({
                "success": false,
                "errors": error.errors
            });
            return;
        }
        if (error instanceof Error) {
            res.status(500).json({
                "success": false,
                "error": error.message                    
            })
            return;
        }
        
        return;
    }
}


/**
 * 
 * @param req Request objecgt
 * @param res Response object
 */
export const signin = async (req: Request, res: Response) => {
    try {
        // parse the body
        
        // check if the user is present or not

        // compare the password

        // generate jwt

        // update the cookies


    } catch (error) {
        if (error instanceof ZodError) {
            console.log(error);
            
        }
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
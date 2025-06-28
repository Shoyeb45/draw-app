import { Request, Response } from "express" 
import { userSignupSchema } from "@repo/zod-types/user";
import { ZodError } from "@repo/zod-types";

/**
 * Function which will be called when `/api/user/signup` endpoint will be hit  
 */
export const signup = async (req: Request, res: Response) => {
    try {
        let body = userSignupSchema.parse(req?.body);
        console.log(body);
        
        res.json({
            message:"hi"
        })
    } catch (error) {
        if(error instanceof ZodError){
            console.log(error)
        }
        res.json({
            "message": "error"
        })
    }
}
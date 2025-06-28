import  { z } from "zod";

export const userSignupSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(5).max(20)
        .refine((password) => {
            return /[A-Z]/.test(password);
        }, {
            message: "Password must include at least one uppercase letter"
        })
        .refine((password) => /[a-z]/.test(password), {
            message: "Password must include at least one lowercase letter"
        })
        .refine((password) => /\d/.test(password), {
            message: "Password must include at least one number"
        })
        .refine((password) => /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(password), {
            message: "Password must include at least one special character"
        })
});
   
export type userSignupType =  z.infer<typeof userSignupSchema>;

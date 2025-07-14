import  { z } from "zod";

export const ZUser = z.object({
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




export type TUser =  z.infer<typeof ZUser>;

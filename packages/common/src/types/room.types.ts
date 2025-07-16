import { z } from "zod";

export const ZRoom = z.object({
    slug: z.string().min(3)
});

export type TRoom = z.infer<typeof ZRoom>;

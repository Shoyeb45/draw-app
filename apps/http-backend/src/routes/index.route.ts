import { Router } from "express";
import userRouter from "./user.route";
import roomRouter from "./room.route"

export const router: Router = Router();

router.use("/user", userRouter);
router.use("/room", roomRouter);
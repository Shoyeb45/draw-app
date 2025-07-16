import { Router } from "express";
import { verify } from "../middlewares/auth.middleware";
import { createRoom } from "../controllers/room.controller";
const router: Router = Router();

router.route("/").post(verify, createRoom);

export default router;
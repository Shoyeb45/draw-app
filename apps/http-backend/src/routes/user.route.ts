import { Router } from "express";
import { signup } from "../controllers/user.controller";
const router: Router = Router();

router.post("/signup", signup);

export default router;

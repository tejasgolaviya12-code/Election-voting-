import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import electionsRouter from "./elections";
import candidatesRouter from "./candidates";
import adminRouter from "./admin";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(electionsRouter);
router.use(candidatesRouter);
router.use(adminRouter);
router.use(newsRouter);

export default router;

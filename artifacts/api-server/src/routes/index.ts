import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuItemsRouter from "./menu-items";
import ordersRouter from "./orders";
import specialsRouter from "./specials";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuItemsRouter);
router.use(ordersRouter);
router.use(specialsRouter);

export default router;

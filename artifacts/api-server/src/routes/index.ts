import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inventoryRouter from "./inventory";
import notificationsRouter from "./notifications";
import recipesRouter from "./recipes";
import groceryRouter from "./grocery";
import analyticsRouter from "./analytics";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inventoryRouter);
router.use(notificationsRouter);
router.use(recipesRouter);
router.use(groceryRouter);
router.use(analyticsRouter);
router.use(profileRouter);

export default router;

import express from "express";
import { getMyOrders, getMyOrderById } from "../controllers/order.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route GET /api/orders
 * @description Get the authenticated user's order/payment history
 * @access Private
 */
router.get("/", authenticateUser, getMyOrders);

/**
 * @route GET /api/orders/:orderId
 * @description Get a single order belonging to the authenticated user
 * @access Private
 */
router.get("/:orderId", authenticateUser, getMyOrderById);

export default router;

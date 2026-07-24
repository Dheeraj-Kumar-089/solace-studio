import express from "express";
import { getWishlist, toggleWishlistItem } from "../controllers/wishlist.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route GET /api/wishlist
 * @description Get the authenticated user's wishlist (populated products)
 * @access Private
 */
router.get("/", authenticateUser, getWishlist);

/**
 * @route POST /api/wishlist/:productId
 * @description Toggle a product in/out of the authenticated user's wishlist
 * @access Private
 */
router.post("/:productId", authenticateUser, toggleWishlistItem);

export default router;

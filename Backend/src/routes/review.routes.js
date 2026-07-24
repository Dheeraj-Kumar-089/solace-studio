import express from "express";
import { createReview, getProductReviews, deleteReview } from "../controllers/review.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validateReview } from "../validators/review.validator.js";

const router = express.Router();

/**
 * @route GET /api/reviews/:productId
 * @description Get all reviews + rating summary for a product
 * @access Public
 */
router.get("/:productId", getProductReviews);

/**
 * @route POST /api/reviews/:productId
 * @description Create or update the authenticated user's review for a product
 * @access Private
 */
router.post("/:productId", authenticateUser, validateReview, createReview);

/**
 * @route DELETE /api/reviews/entry/:reviewId
 * @description Delete the authenticated user's own review
 * @access Private
 */
router.delete("/entry/:reviewId", authenticateUser, deleteReview);

export default router;

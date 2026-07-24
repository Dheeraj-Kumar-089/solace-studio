import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }

    next();
}

export const validateReview = [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isString().isLength({ max: 1000 }).withMessage("Comment must be under 1000 characters"),
    validateRequest
]

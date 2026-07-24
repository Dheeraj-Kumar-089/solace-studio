import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }

    next();
}

export const validateSellerProduct = [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("priceAmount").isNumeric().withMessage("Price amount must be a number"),
    body("priceCurrency").notEmpty().withMessage("Price currency is required"),
    body("category").optional().isString().trim().notEmpty().withMessage("Category must not be empty"),
    validateRequest
]
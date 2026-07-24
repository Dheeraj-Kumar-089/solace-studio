import express from "express"
import { createProduct,getAllProducts,getSellerProducts,getProductDetails,addProductVariant, searchProducts, kairisSearch, deleteProduct, getSellerAnalytics, getSellerOrders } from "../controllers/product.controller.js"
import { authenticateSeller } from "../middlewares/auth.middleware.js"
import { validateSellerProduct } from "../validators/product.validator.js"
import multer from "multer"



const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
})
const router = express.Router()


/**
 * @route POST /api/products
 * @description Create a new product
 * @access Private (Seller only)
 */

router.post("/",authenticateSeller, upload.array("images", 7),validateSellerProduct, createProduct)


/** 
 * @route GET /api/products/seller
 * @description Get all products of the authenticated seller
 * @access Private (Seller only)
 */
router.get("/seller", authenticateSeller, getSellerProducts)

/**
 * @route GET /api/products/seller/analytics
 * @description Get real sales analytics (revenue, orders, units, best seller) for the authenticated seller
 * @access Private (Seller only)
 */
router.get("/seller/analytics", authenticateSeller, getSellerAnalytics)

/**
 * @route GET /api/products/seller/orders
 * @description Get all orders that include at least one of the authenticated seller's products
 * @access Private (Seller only)
 */
router.get("/seller/orders", authenticateSeller, getSellerOrders)

/**
 * @route GET /api/products
 * @description Get all products
 * @access Public
 */
router.get("/", getAllProducts)

/**
 * @route GET /api/products/search
 * @description Search products by title/description
 * @access Public
 */
router.get("/search", searchProducts)

/**
 * @route GET /api/products/kairis-search
 * @description Kairis AI natural-language shopping search — parses free-text
 *              intent (category, color, price range, "pairs with X") and
 *              returns matching products
 * @access Public
 */
router.get("/kairis-search", kairisSearch)

/**
 * @route GET /api/products/detail/:id
 * @description Get product details by ID
 * @access Public
 */
router.get("/detail/:id", getProductDetails)


/**
 * @route post /api/products/:productId/variants
 * @description Add a new variant to a product
 * @access Private (Seller only)
 */
router.post("/:productId/variants", authenticateSeller, upload.array('images', 7), addProductVariant)

/**
 * @route DELETE /api/products/:id
 * @description Delete a product
 * @access Private (Seller only)
 */
router.delete("/:id", authenticateSeller, deleteProduct)

export default router;
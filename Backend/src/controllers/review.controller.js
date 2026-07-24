import reviewModel from "../models/review.model.js";
import productModel from "../models/product.model.js";
import paymentModel from "../models/payment.model.js";

// Recompute and persist the denormalized rating summary on the product doc
async function recomputeRatingSummary(productId) {
    const stats = await reviewModel.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                average: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    const summary = stats[ 0 ]
        ? { average: Math.round(stats[ 0 ].average * 10) / 10, count: stats[ 0 ].count }
        : { average: 0, count: 0 };

    await productModel.findByIdAndUpdate(productId, { ratingSummary: summary });

    return summary;
}

export async function createReview(req, res) {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const user = req.user;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // A review counts as a "verified purchase" if this user has a paid order containing this product
        const hasPurchased = await paymentModel.exists({
            user: user._id,
            status: "paid",
            "orderItems.productId": productId
        });

        const review = await reviewModel.findOneAndUpdate(
            { product: productId, user: user._id },
            {
                product: productId,
                user: user._id,
                rating,
                comment: comment || '',
                verifiedPurchase: !!hasPurchased
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const ratingSummary = await recomputeRatingSummary(product._id);

        return res.status(201).json({
            message: "Review submitted successfully",
            success: true,
            review,
            ratingSummary
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to submit review", success: false });
    }
}

// Only the review's own author may delete it
export async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;

        const review = await reviewModel.findOne({ _id: reviewId, user: req.user._id });

        if (!review) {
            return res.status(404).json({
                message: "Review not found or you don't have permission to delete it",
                success: false
            });
        }

        const productId = review.product;
        await reviewModel.deleteOne({ _id: reviewId });

        const ratingSummary = await recomputeRatingSummary(productId);

        return res.status(200).json({
            message: "Review deleted successfully",
            success: true,
            ratingSummary
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to delete review", success: false });
    }
}

export async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;

        const reviews = await reviewModel
            .find({ product: productId })
            .populate('user', 'fullname')
            .sort({ createdAt: -1 });

        const product = await productModel.findById(productId).select('ratingSummary');

        return res.status(200).json({
            message: "Reviews fetched successfully",
            success: true,
            reviews,
            ratingSummary: product?.ratingSummary ?? { average: 0, count: 0 }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch reviews", success: false });
    }
}

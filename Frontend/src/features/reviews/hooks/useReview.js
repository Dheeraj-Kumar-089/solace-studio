import { getProductReviews, submitReview, deleteReview } from "../service/review.api";

export const useReview = () => {
    async function handleGetProductReviews(productId) {
        const data = await getProductReviews(productId);
        return { reviews: data.reviews, ratingSummary: data.ratingSummary };
    }

    async function handleSubmitReview(productId, payload) {
        const data = await submitReview(productId, payload);
        return { review: data.review, ratingSummary: data.ratingSummary };
    }

    async function handleDeleteReview(reviewId) {
        const data = await deleteReview(reviewId);
        return { ratingSummary: data.ratingSummary };
    }

    return { handleGetProductReviews, handleSubmitReview, handleDeleteReview };
};

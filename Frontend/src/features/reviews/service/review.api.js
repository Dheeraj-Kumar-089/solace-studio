import axios from "axios";
import { API_BASE_URL } from "../../../app/config";

const reviewApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/reviews`,
    withCredentials: true,
});

export async function getProductReviews(productId) {
    const response = await reviewApiInstance.get(`/${productId}`);
    return response.data;
}

export async function submitReview(productId, { rating, comment }) {
    const response = await reviewApiInstance.post(`/${productId}`, { rating, comment });
    return response.data;
}

export async function deleteReview(reviewId) {
    const response = await reviewApiInstance.delete(`/entry/${reviewId}`);
    return response.data;
}

import axios from "axios";
import { API_BASE_URL } from "../../../app/config";

const wishlistApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/wishlist`,
    withCredentials: true,
});

export async function getWishlist() {
    const response = await wishlistApiInstance.get("/");
    return response.data;
}

export async function toggleWishlistItem(productId) {
    const response = await wishlistApiInstance.post(`/${productId}`);
    return response.data;
}

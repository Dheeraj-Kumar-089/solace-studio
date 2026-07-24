import { getWishlist, toggleWishlistItem } from "../service/wishlist.api";

export const useWishlist = () => {
    async function handleGetWishlist() {
        const data = await getWishlist();
        return data.wishlist;
    }

    async function handleToggleWishlistItem(productId) {
        const data = await toggleWishlistItem(productId);
        return data.wishlisted;
    }

    return { handleGetWishlist, handleToggleWishlistItem };
};

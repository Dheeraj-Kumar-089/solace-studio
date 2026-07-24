import userModel from "../models/user.model.js";
import productModel from "../models/product.model.js";

export async function getWishlist(req, res) {
    try {
        const user = await userModel.findById(req.user._id).populate('wishlist');
        return res.status(200).json({
            message: "Wishlist fetched successfully",
            success: true,
            wishlist: user.wishlist || []
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch wishlist", success: false });
    }
}

// Toggle a product in/out of the current user's wishlist
export async function toggleWishlistItem(req, res) {
    try {
        const { productId } = req.params;

        const product = await productModel.findById(productId).select('_id');
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        const user = await userModel.findById(req.user._id);
        const alreadyWishlisted = user.wishlist.some(id => id.toString() === productId);

        if (alreadyWishlisted) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        } else {
            user.wishlist.push(productId);
        }

        await user.save();

        return res.status(200).json({
            message: alreadyWishlisted ? "Removed from wishlist" : "Added to wishlist",
            success: true,
            wishlisted: !alreadyWishlisted,
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update wishlist", success: false });
    }
}

import paymentModel from "../models/payment.model.js";

/**
 * Buyer-facing order history — every payment record the user has ever created,
 * newest first, regardless of status (pending/paid/failed) so they can see the
 * full trail including attempts that didn't go through.
 */
export async function getMyOrders(req, res) {
    try {
        const orders = await paymentModel
            .find({ user: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Orders fetched successfully",
            success: true,
            orders
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch orders", success: false });
    }
}

export async function getMyOrderById(req, res) {
    try {
        const { orderId } = req.params;

        const order = await paymentModel.findOne({ _id: orderId, user: req.user._id });

        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }

        return res.status(200).json({
            message: "Order fetched successfully",
            success: true,
            order
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch order", success: false });
    }
}

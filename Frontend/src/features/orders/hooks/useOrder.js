import { getMyOrders, getMyOrderById } from "../service/order.api";

export const useOrder = () => {
    async function handleGetMyOrders() {
        const data = await getMyOrders();
        return data.orders;
    }

    async function handleGetMyOrderById(orderId) {
        const data = await getMyOrderById(orderId);
        return data.order;
    }

    return { handleGetMyOrders, handleGetMyOrderById };
};

import axios from "axios";
import { API_BASE_URL } from "../../../app/config";

const orderApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/orders`,
    withCredentials: true,
});

export async function getMyOrders() {
    const response = await orderApiInstance.get("/");
    return response.data;
}

export async function getMyOrderById(orderId) {
    const response = await orderApiInstance.get(`/${orderId}`);
    return response.data;
}

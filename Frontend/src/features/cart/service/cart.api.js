import axios from "axios"
import { API_BASE_URL } from "../../../app/config"


const cartApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/cart`,
    withCredentials: true
})


export const addItem = async ({ productId, variantId, quantity = 1 }) => {
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`, {
        quantity
    })

    return response.data
}

export const getCart = async () => {
    const response = await cartApiInstance.get("/")
    return response.data
}

export const incrementCartItemApi = async ({ productId, variantId }) => {
    const response = await cartApiInstance.patch(`/quantity/increment/${productId}/${variantId}`)
    return response.data
}

export const decrementCartItemApi = async ({ productId, variantId }) => {
    const response = await cartApiInstance.patch(`/quantity/decrement/${productId}/${variantId}`)
    return response.data
}

export const removeCartItemApi = async ({ productId, variantId }) => {
    const response = await cartApiInstance.delete(`/remove/${productId}/${variantId}`)
    return response.data
}

export const createCartOrder = async () => {
    const response = await cartApiInstance.post("/payment/create/order")
    return response.data
}

export const verifyCartOrder = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const response = await cartApiInstance.post("/payment/verify/order", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    })

    return response.data
}
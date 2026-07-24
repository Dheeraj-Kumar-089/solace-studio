import axios from "axios";
import { API_BASE_URL } from "../../../app/config";

const productApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/products`,
    withCredentials: true,
})

export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData)

    return response.data
}

export async function getSellerProduct() {
    const response = await productApiInstance.get("/seller")
    return response.data
}

export async function getAllProducts() {
    const response = await productApiInstance.get("/")
    return response.data
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data
}

export async function addProductVariant(productId, variantData) {
    const formData = new FormData();
    
    formData.append('attributes', JSON.stringify(variantData.attributes));
    formData.append('stock', variantData.stock);
    formData.append('priceAmount', variantData.priceAmount);
    
    if (variantData.images && Array.isArray(variantData.images)) {
        variantData.images.forEach((img) => {
            if (img?.file) formData.append('images', img.file);
        });
    }

    const response = await productApiInstance.post(`/${productId}/variants`, formData)
    return response.data
}

export async function deleteProduct(productId) {
    const response = await productApiInstance.delete(`/${productId}`)
    return response.data
}

export async function getSellerAnalytics() {
    const response = await productApiInstance.get("/seller/analytics")
    return response.data
}

export async function getSellerOrders() {
    const response = await productApiInstance.get("/seller/orders")
    return response.data
}

export async function kairisSearch(query) {
    const response = await productApiInstance.get("/kairis-search", { params: { q: query } })
    return response.data
}
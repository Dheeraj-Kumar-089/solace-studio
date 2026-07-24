import { createProduct, getSellerProduct, getAllProducts, getProductById, addProductVariant, deleteProduct, getSellerAnalytics, getSellerOrders, kairisSearch } from "../service/product.api"
import { useDispatch } from "react-redux"
import { setSellerProducts, setProducts, removeSellerProduct } from "../state/product.slice"



export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProduct()
        dispatch(setSellerProducts(data.products))
        return data.products
    }

    async function handleGetAllProducts() {

        const data = await getAllProducts()
        dispatch(setProducts(data.products))
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        return data.product
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        const data = await addProductVariant(productId, newProductVariant)

        return data
    }

    async function handleDeleteProduct(productId) {
        const data = await deleteProduct(productId)
        dispatch(removeSellerProduct(productId))
        return data
    }

    async function handleGetSellerAnalytics() {
        const data = await getSellerAnalytics()
        return data.analytics
    }

    async function handleGetSellerOrders() {
        const data = await getSellerOrders()
        return data.orders
    }

    async function handleKairisSearch(query) {
        const data = await kairisSearch(query)
        return data
    }

    return { handleCreateProduct, handleGetSellerProduct, handleGetAllProducts, handleGetProductById, handleAddProductVariant, handleDeleteProduct, handleGetSellerAnalytics, handleGetSellerOrders, handleKairisSearch }

};


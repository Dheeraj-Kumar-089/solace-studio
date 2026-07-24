import { addItem, getCart, incrementCartItemApi, decrementCartItemApi, removeCartItemApi, createCartOrder, verifyCartOrder } from "../service/cart.api"
import { useDispatch } from "react-redux"
import { setCart, incrementCartItem, decrementCartItem, removeCartItem } from "../state/cart.slice"


export const useCart = () => {

    const dispatch = useDispatch()

    async function handleAddItem({ productId, variantId, quantity = 1 }) {
        const data = await addItem({ productId, variantId, quantity })
        await handleGetCart()
        return data
    }

    async function handleGetCart() {
        const data = await getCart()
        dispatch(setCart(data.cart))
    }

    async function handleIncrementCartItem({ productId, variantId }) {
        await incrementCartItemApi({ productId, variantId })
        dispatch(incrementCartItem({ productId, variantId }))
        await handleGetCart()
    }

    async function handleDecrementCartItem({ productId, variantId }) {
        await decrementCartItemApi({ productId, variantId })
        dispatch(decrementCartItem({ productId, variantId }))
        await handleGetCart()
    }

    async function handleRemoveCartItem({ productId, variantId }) {
        await removeCartItemApi({ productId, variantId })
        dispatch(removeCartItem({ productId, variantId }))
        await handleGetCart()
    }

    async function handleCreateCartOrder() {
        const data = await createCartOrder()
        return data.order
    }

    async function handleVerifyCartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
        const data = await verifyCartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
        await handleGetCart()
        return data.success
    }

    return { handleAddItem, handleGetCart, handleIncrementCartItem, handleDecrementCartItem, handleRemoveCartItem, handleCreateCartOrder, handleVerifyCartOrder }

}
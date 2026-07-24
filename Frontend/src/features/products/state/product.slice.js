import { createSlice } from "@reduxjs/toolkit";


const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: []
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload
        },
        setProducts: (state, action) => {
            state.products = action.payload
        },
        removeSellerProduct: (state, action) => {
            state.sellerProducts = state.sellerProducts.filter(p => p._id !== action.payload)
            state.products = state.products.filter(p => p._id !== action.payload)
        }
    }
})


export const { setSellerProducts, setProducts, removeSellerProduct } = productSlice.actions
export default productSlice.reducer
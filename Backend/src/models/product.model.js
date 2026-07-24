import mongoose from 'mongoose';
import priceSchema from "./price.schema.js";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        default: "Clothing"
    },
    description: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    price: {
        type: priceSchema,
        required: true
    },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    // Radical margin transparency: sellers can optionally disclose what a product
    // actually costs to make, so buyers can see the real margin instead of just MRP vs. sale price.
    costBreakdown: {
        laborCost: { type: Number, default: null },
        platformFeePercent: { type: Number, default: 8 } // Solace Studio's cut, shown openly
    },
    // Denormalized rating summary, kept in sync whenever a review is created/removed
    // so listing grids can show stars without an extra query per product.
    ratingSummary: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    variants: [
        {
            images: [
                {
                    url: {
                        type: String,
                        required: true
                    }
                }
            ],
            stock: {
                type: Number,
                default: 0
            },
            attributes: {
                type: Map,
                of: String
            },
            price: {
                type: priceSchema,
            }
        },

    ]
}, { timestamps: true })


const productModel = mongoose.model('product', productSchema);

export default productModel;
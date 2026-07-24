import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    },
    // true if this user has a paid order containing this product
    verifiedPurchase: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const reviewModel = mongoose.model('review', reviewSchema);

export default reviewModel;

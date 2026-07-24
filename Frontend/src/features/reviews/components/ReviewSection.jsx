import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useReview } from '../hooks/useReview';

/* ── Star display (read-only) ─────────────────────────────────────────── */
export const StarRating = ({ value = 0, size = 16 }) => {
    const rounded = Math.round(value * 2) / 2; // allow half stars
    return (
        <div className="flex items-center" style={{ gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => {
                const filled = i <= rounded;
                const half = !filled && i - 0.5 === rounded;
                return (
                    <svg
                        key={i}
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={filled || half ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-primary"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 2.5l2.94 6.24 6.81.66-5.13 4.63 1.51 6.7L12 17.27l-6.13 3.46 1.51-6.7L2.25 9.4l6.81-.66L12 2.5z" />
                    </svg>
                );
            })}
        </div>
    );
};

/* ── Interactive star picker (for the write-a-review form) ──────────────── */
const StarPicker = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onChange(i)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    className="cursor-pointer"
                >
                    <svg
                        width={26}
                        height={26}
                        viewBox="0 0 24 24"
                        fill={i <= (hover || value) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-primary transition-colors"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 2.5l2.94 6.24 6.81.66-5.13 4.63 1.51 6.7L12 17.27l-6.13 3.46 1.51-6.7L2.25 9.4l6.81-.66L12 2.5z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

/* ── Review Section ───────────────────────────────────────────────────── */
const ReviewSection = ({ productId }) => {
    const user = useSelector((state) => state.auth.user);
    const { handleGetProductReviews, handleSubmitReview, handleDeleteReview } = useReview();
    const [deletingId, setDeletingId] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await handleGetProductReviews(productId);
            setReviews(data.reviews || []);
            setRatingSummary(data.ratingSummary || { average: 0, count: 0 });
        } catch (err) {
            console.error('Failed to load reviews', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) load();
    }, [productId]);

    const existingReview = reviews.find((r) => r.user?._id === user?.id);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment || '');
        }
    }, [reviews.length]);

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete your review?')) return;
        setDeletingId(reviewId);
        try {
            await handleDeleteReview(reviewId);
            setRating(0);
            setComment('');
            await load();
        } catch (err) {
            console.error('Failed to delete review', err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            setError('Please select a star rating.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            await handleSubmitReview(productId, { rating, comment });
            await load();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="max-w-[1440px] mx-auto w-full px-4 md:px-margin-desktop pb-section-gap">
            <div className="border-t border-outline-variant pt-12">
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="font-headline-md text-headline-md uppercase text-primary">Reviews</h2>
                    {ratingSummary.count > 0 && (
                        <div className="flex items-center gap-2">
                            <StarRating value={ratingSummary.average} size={18} />
                            <span className="font-body-md text-body-md text-secondary">
                                {ratingSummary.average.toFixed(1)} · {ratingSummary.count} review{ratingSummary.count !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Write a review */}
                    <div className="lg:col-span-5">
                        {user ? (
                            <form onSubmit={handleSubmit} className="border border-outline-variant p-6 flex flex-col gap-4">
                                <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                                    {existingReview ? 'Update your review' : 'Write a review'}
                                </p>
                                <StarPicker value={rating} onChange={setRating} />
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                    placeholder="Share your experience with this product..."
                                    className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none px-4 py-3 font-body-md text-body-md placeholder:text-outline-variant transition-colors resize-none focus:outline-none"
                                />
                                {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="self-start bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-inverse-surface transition-colors duration-200 cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                                </button>
                            </form>
                        ) : (
                            <p className="font-body-md text-body-md text-secondary">Sign in to write a review.</p>
                        )}
                    </div>

                    {/* Review list */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {loading ? (
                            <p className="font-body-md text-body-md text-secondary">Loading reviews...</p>
                        ) : reviews.length === 0 ? (
                            <p className="font-body-md text-body-md text-secondary">No reviews yet. Be the first to share your thoughts.</p>
                        ) : (
                            reviews.map((r) => {
                                const isOwn = user?.id && r.user?._id === user.id;
                                return (
                                    <div key={r._id} className="border-b border-outline-variant pb-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <StarRating value={r.rating} />
                                            <span className="font-label-md text-label-md text-primary">{r.user?.fullname || 'Anonymous'}</span>
                                            {r.verifiedPurchase && (
                                                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary border border-outline-variant px-2 py-0.5">
                                                    Verified Buyer
                                                </span>
                                            )}
                                            {isOwn && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(r._id)}
                                                    disabled={deletingId === r._id}
                                                    className="ml-auto font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-error transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    {deletingId === r._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                        {r.comment && (
                                            <p className="font-body-md text-body-md text-secondary leading-relaxed">{r.comment}</p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReviewSection;

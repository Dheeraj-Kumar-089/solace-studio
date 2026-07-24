import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../../cart/hook/useCart';
import ReviewSection, { StarRating } from '../../reviews/components/ReviewSection';
import { useWishlist } from '../../wishlist/hooks/useWishlist';
import WishlistButton from '../../wishlist/components/WishlistButton';
import { useSelector } from 'react-redux';

/* ── Currency map ──────────────────────────────────────────────────────── */
const SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#eeeeee"/><path d="M20 78l18-18a8 8 0 0111 0l6 6m-4-4l10-10a8 8 0 0111 0l19 19M30 40a4 4 0 100-8 4 4 0 000 8z" fill="none" stroke="#b5aeae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
);
const handleImgError = (e) => {
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
        e.currentTarget.src = FALLBACK_IMAGE;
        e.currentTarget.classList.add('object-contain', 'p-10', 'opacity-60');
    }
};

/* ── Skeleton ──────────────────────────────────────────────────────────── */
const Skeleton = () => (
    <div className="min-h-screen bg-background text-on-surface font-body-md animate-pulse pt-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-margin-desktop py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-3">
                <div className="aspect-[3/4] bg-surface-container-high border border-outline-variant rounded-none" />
            </div>
            <div className="space-y-5 pt-2">
                <div className="h-6 bg-surface-container-high border border-outline-variant rounded-none w-2/3" />
                <div className="h-8 bg-surface-container-high border border-outline-variant rounded-none w-1/3" />
            </div>
        </div>
    </div>
);

/* ── Helper ────────────────────────────────────────────────────────────── */
const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.toUpperCase();
};

/* ── ProductDetail ─────────────────────────────────────────────────────── */
function ProductDetail() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { handleGetProductById } = useProduct();
    const { handleAddItem } = useCart();
    const { handleGetWishlist, handleToggleWishlistItem } = useWishlist();
    const user = useSelector((state) => state.auth.user);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // UI State
    const [activeImg, setActiveImg] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [showNotification, setShowNotification] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                const data = await handleGetProductById(productId);
                const fetchedProduct = data?.product ?? data;
                setProduct(fetchedProduct);
            } catch (err) {
                console.error('Failed to fetch product details', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [productId]);

    useEffect(() => {
        if (!user || !productId) {
            setIsWishlisted(false);
            return;
        }
        (async () => {
            try {
                const wishlist = await handleGetWishlist();
                setIsWishlisted((wishlist || []).some((p) => (p._id || p) === productId));
            } catch (err) {
                console.error('Failed to load wishlist', err);
            }
        })();
    }, [user, productId]);

    const onToggleWishlist = async () => {
        setIsWishlisted((prev) => !prev);
        try {
            await handleToggleWishlistItem(productId);
        } catch (err) {
            console.error('Failed to toggle wishlist', err);
            setIsWishlisted((prev) => !prev);
        }
    };

    // Compute normalized variants (trim and uppercase keys/values for clean grouping)
    const normalizedVariants = React.useMemo(() => {
        if (!product?.variants) return [];
        return product.variants.map(v => {
            const normAttrs = {};
            if (v.attributes) {
                Object.entries(v.attributes).forEach(([k, val]) => {
                    normAttrs[k.trim().toUpperCase()] = val.trim().toUpperCase();
                });
            }
            return { ...v, normAttrs };
        });
    }, [product]);

    // Initialize default selection
    useEffect(() => {
        if (normalizedVariants.length > 0) {
            setSelectedOptions(normalizedVariants[0].normAttrs);
        }
    }, [normalizedVariants]);

    if (loading) return <Skeleton />;

    if (!product) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-on-surface">
            <p className="font-headline-md text-headline-md uppercase tracking-widest text-primary">Product not found</p>
            <button onClick={() => navigate('/')} className="font-label-md text-label-md uppercase tracking-widest border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all cursor-pointer">
                Continue Shopping
            </button>
        </div>
    );

    // Get all unique attribute keys (e.g. ['COLOR', 'SIZE'])
    const allKeys = [...new Set(normalizedVariants.flatMap(v => Object.keys(v.normAttrs)))];

    // Find the currently matched variant
    const matchedVariant = normalizedVariants.find(v =>
        Object.entries(selectedOptions).every(([k, val]) => v.normAttrs[k] === val)
    );

    // Option selection handler that guarantees we only show/select available combinations
    const handleSelectOption = (key, value) => {
        let newOptions = { ...selectedOptions, [key]: value };

        // Check if this exact combination exists
        let match = normalizedVariants.find(v =>
            Object.entries(newOptions).every(([k, val]) => v.normAttrs[k] === val)
        );

        // If not, fall back to the first variant that has the newly clicked option
        if (!match) {
            match = normalizedVariants.find(v => v.normAttrs[key] === value);
            if (match) {
                newOptions = { ...match.normAttrs };
            }
        }

        setSelectedOptions(newOptions);
        setActiveImg(0); // Reset image index on variant change
    };

    // Fallbacks
    const imagesToDisplay = (matchedVariant?.images?.length > 0) ? matchedVariant.images : (product.images ?? []);
    let displayPrice = product.price;
    if (matchedVariant && matchedVariant.price && matchedVariant.price.amount) {
        displayPrice = matchedVariant.price;
    }
    const sym = SYMBOL[displayPrice?.currency] ?? displayPrice?.currency;
    const priceAmountStr = displayPrice?.amount?.toLocaleString('en-IN') ?? '';

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md pt-16 overflow-x-hidden flex flex-col">
            <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 md:px-margin-desktop py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

                    {/* ── LEFT: Image Gallery (~75% width) ─────────────────────── */}
                    <div className="lg:col-span-9 flex flex-col-reverse lg:flex-row gap-4 lg:h-[80vh] lg:min-h-[560px]">
                        {/* Thumbnails (vertical) */}
                        <div className="flex lg:flex-col gap-3 overflow-y-auto w-full lg:w-20 flex-shrink-0 hide-scrollbar pb-2 lg:pb-0">
                            {imagesToDisplay.map((img, i) => (
                                <button
                                    key={img._id || i}
                                    onClick={() => setActiveImg(i)}
                                    className={`relative aspect-[0.8] w-20 lg:w-full flex-shrink-0 overflow-hidden rounded-none bg-surface-container transition-all duration-300 cursor-pointer
                                        ${i === activeImg ? 'ring-2 ring-primary opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img.url} alt="" onError={handleImgError} className="w-full h-full object-cover transition-all duration-500" />
                                </button>
                            ))}
                        </div>
                        {/* Main Image */}
                        <div className="flex-1 bg-surface-container relative aspect-[0.8] lg:aspect-auto lg:h-full w-full overflow-hidden rounded-none">
                            {imagesToDisplay.length > 0 ? (
                                <img
                                    key={activeImg}
                                    src={imagesToDisplay[activeImg]?.url}
                                    alt={product.title}
                                    onError={handleImgError}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-secondary font-label-md uppercase tracking-widest">No Image</span>
                                </div>
                            )}
                            <WishlistButton
                                productId={product._id}
                                isWishlisted={isWishlisted}
                                onToggle={onToggleWishlist}
                                className="absolute top-4 right-4"
                            />
                        </div>
                    </div>

                    {/* ── RIGHT: Product Info (~25% width) ──────────────────────── */}
                    <div className="lg:col-span-3 flex flex-col pt-2">

                        {/* Title */}
                        <h1 className="font-headline-lg text-headline-lg tracking-tight text-primary mb-2">
                            {product.title}
                        </h1>

                        {/* Rating summary */}
                        {product.ratingSummary?.count > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <StarRating value={product.ratingSummary.average} size={14} />
                                <span className="font-body-md text-body-md text-secondary">
                                    {product.ratingSummary.average.toFixed(1)} · {product.ratingSummary.count} review{product.ratingSummary.count !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <p className="font-headline-md text-headline-md tracking-tight text-primary mb-5 pb-5 border-b border-outline-variant">
                            {sym} {priceAmountStr}
                        </p>

                        {/* Options */}
                        <div className="flex flex-col gap-6 mb-6">
                            {allKeys.map(key => {
                                const globalValues = Array.from(new Set(normalizedVariants.map(v => v.normAttrs[key]).filter(Boolean)));
                                return (
                                    <div key={key}>
                                        <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-3">{key}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {globalValues.map(val => {
                                                const isSelected = selectedOptions[key] === val;
                                                return (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleSelectOption(key, val)}
                                                        className={`px-4 py-2.5 font-label-sm text-label-sm uppercase tracking-widest transition-all duration-200 cursor-pointer border rounded-none
                                                            ${isSelected
                                                                ? 'bg-primary text-on-primary border-primary'
                                                                : 'bg-transparent text-primary border-outline-variant hover:border-primary'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stock */}
                        {matchedVariant && (
                            <p className={`font-label-sm text-label-sm uppercase tracking-widest mb-6 ${matchedVariant.stock > 0 ? 'text-primary' : 'text-error'}`}>
                                {matchedVariant.stock > 0 ? `${matchedVariant.stock} in stock` : 'Out of stock'}
                            </p>
                        )}

                        {/* Details */}
                        <div className="mb-8 pb-6 border-b border-outline-variant">
                            <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-3">Description</p>
                            <p className="font-body-md text-body-md text-secondary leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Quantity & Buttons */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center border border-primary rounded-none px-4 py-3.5 gap-6 justify-center">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-secondary transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-[18px]">remove</span>
                                </button>
                                <span className="font-label-md text-label-md w-4 text-center">{quantity}</span>
                                <button
                                    disabled={matchedVariant?.stock <= quantity}
                                    onClick={() => setQuantity(quantity + 1)}
                                    className={`hover:text-secondary transition-colors cursor-pointer ${matchedVariant?.stock <= quantity ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                </button>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!matchedVariant || matchedVariant.stock < quantity) return;
                                    await handleAddItem({
                                        productId: product._id,
                                        variantId: matchedVariant._id,
                                        quantity
                                    });
                                    setShowNotification(true);
                                    setTimeout(() => setShowNotification(false), 2000);
                                }} 
                                disabled={!matchedVariant || matchedVariant.stock === 0}
                                className="w-full py-4 rounded-none bg-primary text-on-primary border border-primary font-label-md text-label-md uppercase tracking-widest hover:bg-on-surface-variant transition-colors active:scale-[0.98] duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {matchedVariant?.stock === 0 ? 'Out of Stock' : 'Add To Bag'}
                            </button>
                        </div>

                    </div>
                </div>
            </main>

            <ReviewSection productId={product._id} />

            {/* Notification Toast */}
            {showNotification && (
                <div className="fixed top-24 right-10 bg-primary text-on-primary px-8 py-5 border border-outline-variant shadow-xl font-label-md text-label-md uppercase tracking-widest z-50 flex items-center gap-4 transition-all">
                    <span className="material-symbols-outlined">check_circle</span>
                    Item added to bag
                </div>
            )}
        </div>
    );
}

export default ProductDetail;
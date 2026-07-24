import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { StarRating } from '../../reviews/components/ReviewSection';
import { CATEGORIES } from './CreateProduct';
import { useWishlist } from '../../wishlist/hooks/useWishlist';
import WishlistButton from '../../wishlist/components/WishlistButton';

const DISCOVER_TAB = 'Discover';
const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#eeeeee"/><path d="M20 78l18-18a8 8 0 0111 0l6 6m-4-4l10-10a8 8 0 0111 0l19 19M30 40a4 4 0 100-8 4 4 0 000 8z" fill="none" stroke="#b5aeae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
);
const handleImgError = (e) => {
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
        e.currentTarget.src = FALLBACK_IMAGE;
        e.currentTarget.classList.add('object-contain', 'p-8', 'opacity-60');
    }
};

/* ── Currency map ──────────────────────────────────────────────────────── */
const SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

/* ── Helpers ───────────────────────────────────────────────────────────── */
const isNewProduct = (product) => {
    if (!product?.createdAt) return false;
    const ageDays = (Date.now() - new Date(product.createdAt).getTime()) / 86400000;
    return ageDays <= 14;
};

// Pull distinct color options out of a product's variants (attributes.color / attributes.Color)
const getColorSwatches = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const seen = new Map();
    variants.forEach((v) => {
        const attrs = v?.attributes ?? {};
        const color = attrs.color ?? attrs.Color ?? attrs.colour ?? attrs.Colour;
        if (color && !seen.has(color.toLowerCase())) {
            seen.set(color.toLowerCase(), color);
        }
    });
    return Array.from(seen.values());
};

// Round-robin interleave the top N per category so the Discover feed reads as
// a mix rather than one category dominating the top of the grid.
const buildDiscoverFeed = (allProducts, categories, perCategory = 5) => {
    const byCategory = {};
    categories.forEach((cat) => {
        byCategory[cat] = allProducts
            .filter((p) => p.category === cat)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, perCategory);
    });

    const maxLen = Math.max(0, ...Object.values(byCategory).map((arr) => arr.length));
    const initial = [];
    for (let i = 0; i < maxLen; i++) {
        categories.forEach((cat) => {
            if (byCategory[cat][i]) initial.push(byCategory[cat][i]);
        });
    }

    const initialIds = new Set(initial.map((p) => p._id));
    const remaining = allProducts.filter((p) => !initialIds.has(p._id));

    return { initial, remaining };
};

/* ── Product Card ──────────────────────────────────────────────────────── */
const ProductCard = ({ product, isWishlisted, onToggleWishlist }) => {
    const images = product.images ?? [];
    const sym = SYMBOL[product.price?.currency] ?? product.price?.currency;
    const navigate = useNavigate();

    const mrp = product.mrp ?? product.price?.mrp;
    const hasDiscount = typeof mrp === 'number' && mrp > (product.price?.amount ?? 0);
    const discountPct = hasDiscount
        ? Math.round(((mrp - product.price.amount) / mrp) * 100)
        : null;

    const badges = [
        ...(product.tags ?? product.badges ?? []),
        ...(hasDiscount ? ['Promo'] : []),
        ...(isNewProduct(product) ? ['New'] : []),
    ].filter(Boolean);

    const colors = getColorSwatches(product);

    return (
        <div onClick={() => navigate(`/product/${product._id}`)} className="group cursor-pointer flex flex-col">
            <div className="w-full aspect-square bg-surface-container mb-3 overflow-hidden relative rounded-none">
                {images.length > 0 ? (
                    <img
                        src={images[0]?.url}
                        alt={product.title}
                        onError={handleImgError}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Badge row (Promo / New / Bestseller / custom tags) */}
                {badges.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[70%]">
                        {badges.map((badge, i) => (
                            <span
                                key={i}
                                className={`font-label-sm text-label-sm uppercase px-2 py-0.5 tracking-wide ${
                                    badge.toLowerCase() === 'promo'
                                        ? 'bg-error text-on-error'
                                        : 'bg-surface-container-lowest text-primary border border-outline-variant'
                                }`}
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                )}

                {/* Wishlist */}
                <WishlistButton
                    productId={product._id}
                    isWishlisted={isWishlisted}
                    onToggle={onToggleWishlist}
                    className="absolute top-3 right-3"
                />
            </div>

            {/* Category eyebrow */}
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-1">
                {product.category}
            </span>

            {/* Title */}
            <h3 className="font-label-md text-label-md text-primary mb-1.5 truncate">{product.title}</h3>

            {/* Rating */}
            {product.ratingSummary?.count > 0 && (
                <div className="flex items-center gap-1.5 mb-1.5">
                    <StarRating value={product.ratingSummary.average} size={12} />
                    <span className="font-label-sm text-label-sm text-secondary">({product.ratingSummary.count})</span>
                </div>
            )}

            {/* Color swatches */}
            {colors.length > 0 && (
                <div className="flex items-center gap-1.5 mb-1.5">
                    {colors.slice(0, 6).map((color, i) => (
                        <span
                            key={i}
                            title={color}
                            className="h-3 w-3 rounded-none border border-outline-variant"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2">
                <span className="font-body-md text-body-md text-primary">
                    {sym}{product.price?.amount?.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                    <>
                        <span className="font-body-md text-body-md text-secondary line-through">
                            {sym}{mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="font-label-sm text-label-sm text-error">- {discountPct}%</span>
                    </>
                )}
            </div>
        </div>
    );
};

/* ── Skeleton card ─────────────────────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="flex flex-col animate-pulse">
        <div className="w-full aspect-square bg-surface-container mb-3 rounded-none" />
        <div className="h-3 bg-surface-container rounded-none w-1/3 mb-2" />
        <div className="h-4 bg-surface-container rounded-none w-2/3 mb-2" />
        <div className="h-4 bg-surface-container rounded-none w-1/4" />
    </div>
);

/* ── Home ──────────────────────────────────────────────────────────────── */
const Home = () => {
    const { handleGetAllProducts, handleKairisSearch } = useProduct();
    const { handleGetWishlist, handleToggleWishlistItem } = useWishlist();
    const products = useSelector(state => state.product.products);
    const user = useSelector(state => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(DISCOVER_TAB);
    const [showAll, setShowAll] = useState(false);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const productsRef = useRef(null);
    const [tabsVisible, setTabsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            if (currentY > lastScrollY.current && currentY > 120) {
                setTabsVisible(false);
            } else {
                setTabsVisible(true);
            }
            lastScrollY.current = currentY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('q') || '';

    /* Kairis AI — natural-language shopping search. Driven entirely by the navbar's
       search box (the `q` param below); there's no separate AI search input on this page. */
    const [kairisResults, setKairisResults] = useState(null); // null = not run yet, array = results for the current `search`
    const [kairisIntent, setKairisIntent] = useState(null);
    const [kairisLoading, setKairisLoading] = useState(false);
    const [kairisError, setKairisError] = useState('');

    useEffect(() => {
        (async () => {
            try { await handleGetAllProducts(); }
            finally { setLoading(false); }
        })();
    }, []);

    useEffect(() => {
        if (!user) {
            setWishlistIds(new Set());
            return;
        }
        (async () => {
            try {
                const wishlist = await handleGetWishlist();
                setWishlistIds(new Set((wishlist || []).map((p) => p._id || p)));
            } catch (err) {
                console.error('Failed to load wishlist', err);
            }
        })();
    }, [user]);

    const onToggleWishlist = async (productId) => {
        // optimistic update
        setWishlistIds((prev) => {
            const next = new Set(prev);
            next.has(productId) ? next.delete(productId) : next.add(productId);
            return next;
        });
        try {
            await handleToggleWishlistItem(productId);
        } catch (err) {
            console.error('Failed to toggle wishlist', err);
            // revert on failure
            setWishlistIds((prev) => {
                const next = new Set(prev);
                next.has(productId) ? next.delete(productId) : next.add(productId);
                return next;
            });
        }
    };

    // Run Kairis AI search whenever the navbar's search box sets/changes the `q` param.
    useEffect(() => {
        if (!search.trim()) {
            setKairisResults(null);
            setKairisIntent(null);
            setKairisError('');
            return;
        }
        let cancelled = false;
        (async () => {
            setKairisLoading(true);
            setKairisError('');
            try {
                const data = await handleKairisSearch(search.trim());
                if (cancelled) return;
                setKairisResults(data.products || []);
                setKairisIntent(data.intent || null);
            } catch (err) {
                if (cancelled) return;
                console.error('Kairis AI search failed', err);
                setKairisError("Kairis couldn't process that just now — try rephrasing your request.");
                setKairisResults([]);
                setKairisIntent(null);
            } finally {
                if (!cancelled) setKairisLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [search]);

    const allProducts = Array.isArray(products) ? products : [];

    // Union of the canonical category list + any category actually present on a
    // product (e.g. legacy listings created before categories existed), so a
    // product is never silently hidden with no tab to find it under.
    const categories = useMemo(() => {
        const extra = allProducts
            .map((p) => p.category)
            .filter((c) => c && !CATEGORIES.includes(c));
        return [...CATEGORIES, ...new Set(extra)];
    }, [allProducts]);
    const tabs = useMemo(() => [DISCOVER_TAB, ...categories], [categories]);

    // Reset "show more" whenever the tab changes
    useEffect(() => { setShowAll(false); }, [activeTab]);

    const searching = search.trim().length > 0;

    // Category-tab filtering only — the `q` search box is handled entirely by Kairis AI
    // above (see the `searching` branch in the Products Section render below).
    const filtered = useMemo(() => {
        if (activeTab !== DISCOVER_TAB) {
            return allProducts.filter(p => p.category === activeTab);
        }
        return allProducts;
    }, [allProducts, activeTab]);

    const { initial: discoverInitial, remaining: discoverRemaining } = useMemo(
        () => buildDiscoverFeed(allProducts, categories, 5),
        [allProducts, categories]
    );

    const isDiscover = !searching && activeTab === DISCOVER_TAB;
    const visibleProducts = isDiscover
        ? (showAll ? [...discoverInitial, ...discoverRemaining] : discoverInitial)
        : filtered;

    return (
        <div className="min-h-screen bg-surface text-primary font-sans flex flex-col pt-16">
            {/* Category Tabs */}
            {!searching && (
                <div
                    className={`sticky top-16 z-30 bg-surface border-b border-outline-variant overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                        tabsVisible ? 'max-h-20' : 'max-h-0 border-b-0'
                    }`}
                >
                    <div className="overflow-x-auto hide-scrollbar">
                        <div className="max-w-[1440px] mx-auto px-4 md:px-margin-desktop flex gap-8 py-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap font-label-md text-label-md uppercase tracking-wide pb-1 border-b-2 transition-colors cursor-pointer ${
                                        activeTab === tab
                                            ? 'border-primary text-primary font-semibold'
                                            : 'border-transparent text-secondary hover:text-primary'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            {!search && isDiscover && (
                <section className="w-full relative h-[60vh] md:h-[70vh] bg-surface-container-lowest flex items-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Hero Image"
                            className="w-full h-full object-cover object-center grayscale"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzBoGjD4tCQqr1qJhyiGj_5xe7XBMaA6u5DNsxxbRfAxBhR3eFqd0kcxtriMqtLKOY1XLyC4tyuOVRaJ4ppZcqnYGw2yCJDDED_Do9wvwOhIDMrx-3LjeCe34bAYmoJ_SG926mguUTfPRMZIrujDB4LyDi90zOqAf6Twawty_MEIiVYx2491k4xUlkNcp24OlxncO00SJxuFNyjYeZY50bqakMGmAmkzwzdENVFSEv5bRHZVhU33YxtlUnc7Eaa8rtvWB368pAmbqe"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                    </div>
                    <div className="relative z-10 max-w-xl px-margin-mobile md:px-margin-desktop">
                        <h1 className="font-headline-lg text-display-lg leading-tight text-on-primary font-bold tracking-tight mb-4">
                            Discover our collection
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-primary/85 mb-8 max-w-md">
                            Premium products of exceptional quality. Discover our carefully curated selection.
                        </p>
                        <button
                            onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="bg-surface-container-lowest text-primary px-6 py-3 font-label-md text-label-md rounded-none hover:bg-surface-container transition-colors duration-300 cursor-pointer"
                        >
                            View all
                        </button>
                    </div>
                </section>
            )}

            {/* Products Section */}
            <section ref={productsRef} className="max-w-[1440px] w-full mx-auto px-4 md:px-margin-desktop py-section-gap flex-1">
                <div className="flex justify-between items-end pb-4 mb-8">
                    <h2 className="font-headline-lg text-headline-lg tracking-tight">
                        {searching ? 'Kairis AI Results' : isDiscover ? 'Featured Products' : activeTab}
                    </h2>
                    {searching && (
                        <button
                            onClick={() => setSearchParams({})}
                            className="font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline cursor-pointer"
                        >
                            Clear Search
                        </button>
                    )}
                </div>

                {searching && kairisIntent && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {kairisIntent.category && (
                            <span className="font-label-sm text-label-sm uppercase tracking-wide px-3 py-1.5 border border-outline-variant text-secondary">Category: {kairisIntent.category}</span>
                        )}
                        {kairisIntent.color && (
                            <span className="font-label-sm text-label-sm uppercase tracking-wide px-3 py-1.5 border border-outline-variant text-secondary">Color: {kairisIntent.color}</span>
                        )}
                        {kairisIntent.brand && (
                            <span className="font-label-sm text-label-sm uppercase tracking-wide px-3 py-1.5 border border-outline-variant text-secondary">Brand: {kairisIntent.brand}</span>
                        )}
                        {kairisIntent.maxPrice != null && (
                            <span className="font-label-sm text-label-sm uppercase tracking-wide px-3 py-1.5 border border-outline-variant text-secondary">Under ₹{kairisIntent.maxPrice.toLocaleString('en-IN')}</span>
                        )}
                        {kairisIntent.minPrice != null && (
                            <span className="font-label-sm text-label-sm uppercase tracking-wide px-3 py-1.5 border border-outline-variant text-secondary">Above ₹{kairisIntent.minPrice.toLocaleString('en-IN')}</span>
                        )}
                        {kairisIntent.referenceProduct && (
                            <span className="font-label-sm text-label-sm uppercase tracking-wide px-3 py-1.5 border border-outline-variant text-secondary">Pairs with: {kairisIntent.referenceProduct.title}</span>
                        )}
                        {!kairisIntent.category && !kairisIntent.color && !kairisIntent.brand && kairisIntent.maxPrice == null && kairisIntent.minPrice == null && !kairisIntent.referenceProduct && (
                            <span className="font-label-sm text-label-sm uppercase tracking-wide px-3 py-1.5 border border-outline-variant text-secondary">Couldn't detect specific filters — showing closest matches</span>
                        )}
                    </div>
                )}

                {searching && kairisError && (
                    <p className="font-body-md text-body-md text-error mb-8">{kairisError}</p>
                )}

                {searching ? (
                    kairisLoading || kairisResults === null ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : kairisResults.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                            {kairisResults.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    isWishlisted={wishlistIds.has(product._id)}
                                    onToggleWishlist={onToggleWishlist}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="font-headline-md text-headline-md uppercase text-primary mb-2">No matches for that yet</p>
                            <p className="font-body-md text-body-md text-secondary">Try describing it a little differently — category, color, budget, or an item to pair with all help.</p>
                        </div>
                    )
                ) : loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : visibleProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                            {visibleProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    isWishlisted={wishlistIds.has(product._id)}
                                    onToggleWishlist={onToggleWishlist}
                                />
                            ))}
                        </div>
                        {isDiscover && !showAll && discoverRemaining.length > 0 && (
                            <div className="flex justify-center mt-14">
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="bg-primary text-on-primary px-10 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-inverse-surface transition-colors duration-300 rounded-none cursor-pointer"
                                >
                                    Show More
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="font-headline-md text-headline-md uppercase text-primary mb-2">
                            {searching ? 'No products found' : `No products in ${activeTab} yet`}
                        </p>
                        <p className="font-body-md text-body-md text-secondary">
                            {searching ? 'Try adjusting your search criteria.' : 'Check back soon — new listings are added regularly.'}
                        </p>
                        {searching && (
                            <button
                                onClick={() => setSearchParams({})}
                                className="mt-8 bg-primary text-on-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-inverse-surface transition-colors duration-300 rounded-none border border-primary cursor-pointer"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="bg-surface w-full py-12 border-t border-outline-variant mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-margin-desktop gap-8 max-w-[1440px] mx-auto">
                    <div className="font-headline-md text-headline-md font-black text-primary">
                        SOLACE STUDIO
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                        <a className="font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors duration-300 underline-offset-4 hover:underline" href="#">Privacy Policy</a>
                        <a className="font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors duration-300 underline-offset-4 hover:underline" href="#">Terms of Service</a>
                        <a className="font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors duration-300 underline-offset-4 hover:underline" href="#">Shipping & Returns</a>
                    </div>
                    <div className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                        © 2026 SOLACE STUDIO.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

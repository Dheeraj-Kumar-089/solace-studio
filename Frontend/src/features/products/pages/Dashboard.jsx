import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useNavigate, Link } from 'react-router';

/* ── Currency symbol map ─────────────────────────────────────────────────── */
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const formatMoney = (amount, currency) =>
    `${CURRENCY_SYMBOLS[currency] ?? currency ?? ''}${(amount ?? 0).toLocaleString('en-IN')}`;

/* ── Product Card ────────────────────────────────────────────────────────── */
const ProductCard = ({ product, onDelete, isDeleting }) => {
    const [activeImg, setActiveImg] = useState(0);
    const images = product.images || [];
    const symbol = CURRENCY_SYMBOLS[product.price?.currency] ?? product.price?.currency;
    const date = new Date(product.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
    const navigate = useNavigate();

    return (
        <div onClick={() => { navigate(`/seller/product/${product._id}`) }} className={`bg-surface-container-lowest border border-border-low-contrast overflow-hidden rounded-none group flex flex-col hover:border-primary transition-colors duration-300 cursor-pointer relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="relative aspect-[4/3] bg-surface-container-low overflow-hidden border-b border-border-low-contrast">
                {images.length > 0 ? (
                    <>
                        <img
                            src={images[activeImg]?.url}
                            alt={product.title}
                            className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        {images.length > 1 && (
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                                        className={`w-1.5 h-1.5 rounded-none transition-all duration-200 ${i === activeImg ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/60'}`}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="absolute top-2 right-2 bg-surface-container-lowest/80 text-on-surface text-[9px] uppercase tracking-widest px-2 py-1 rounded-none shadow-sm font-bold">
                            {activeImg + 1} / {images.length}
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline-variant text-4xl">image</span>
                    </div>
                )}
                
                {/* Delete Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(product._id);
                    }}
                    title="Delete product"
                    className="absolute top-2 left-2 bg-surface-container-lowest/90 text-on-surface hover:bg-red-600 hover:text-white p-1.5 rounded-none shadow-sm transition-colors duration-200 flex items-center justify-center cursor-pointer z-10"
                >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-label-md text-label-md uppercase text-primary truncate">
                    {product.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                    {product.description}
                </p>
                <div className="mt-auto pt-3 flex items-end justify-between border-t border-border-low-contrast">
                    <span className="font-label-md text-label-md text-primary">
                        {symbol}{product.price?.amount?.toLocaleString('en-IN')}
                    </span>
                    <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                        {date}
                    </span>
                </div>
            </div>
        </div>
    );
};

/* ── Empty State ─────────────────────────────────────────────────────────── */
const EmptyState = ({ onAdd }) => (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center border border-border-low-contrast bg-surface-container-lowest">
        <div className="w-20 h-20 rounded-none bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">inventory_2</span>
        </div>
        <div>
            <p className="font-headline-md text-headline-md text-primary mb-2">No listings yet</p>
            <p className="font-body-md text-body-md text-on-surface-variant">Start by creating your first product.</p>
        </div>
        <button
            onClick={onAdd}
            className="mt-4 px-8 py-4 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 rounded-none cursor-pointer"
        >
            Create Listing
        </button>
    </div>
);

/* ── Dashboard ───────────────────────────────────────────────────────────── */
const Dashboard = () => {
    const { handleGetSellerProduct, handleDeleteProduct, handleGetSellerAnalytics } = useProduct();
    const sellerProducts = useSelector(state => state.product.sellerProducts);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                await handleGetSellerProduct();
            } finally {
                setLoading(false);
            }
        })();

        (async () => {
            try {
                const data = await handleGetSellerAnalytics();
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to load seller analytics', err);
            } finally {
                setAnalyticsLoading(false);
            }
        })();
    }, []);

    const handleDelete = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                setDeletingId(productId);
                await handleDeleteProduct(productId);
            } catch (err) {
                console.error("Failed to delete product:", err);
                alert(err?.response?.data?.message || "Failed to delete product");
            } finally {
                setDeletingId(null);
            }
        }
    };

    const products = Array.isArray(sellerProducts) ? sellerProducts : [];

    return (
        <div className="bg-background text-on-surface font-body-md antialiased overflow-x-hidden min-h-screen">
            {/* SideNavBar */}
            <aside className="fixed left-0 top-0 h-screen flex flex-col py-8 bg-surface-container-lowest w-64 border-r border-border-low-contrast z-50">
                <div className="px-8 mb-12 flex flex-col items-start cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="font-headline-md text-headline-md font-black tracking-tighter text-primary">SOLACE STUDIO</h1>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Seller Portal</span>
                </div>
                <nav className="flex-1 flex flex-col gap-y-2 px-4">
                    <a onClick={() => navigate('/seller/dashboard')} className="flex items-center py-3 text-primary font-bold border-l-4 border-primary pl-4 font-label-md text-label-md uppercase tracking-wider bg-surface-container-low cursor-pointer">
                        <span className="material-symbols-outlined mr-4">dashboard</span>
                        Dashboard
                    </a>
                    <a onClick={() => navigate('/seller/create-product')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                        <span className="material-symbols-outlined mr-4">inventory_2</span>
                        Products
                    </a>
                    <a onClick={() => navigate('/seller/orders')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                        <span className="material-symbols-outlined mr-4">shopping_bag</span>
                        Orders
                    </a>
                    <a onClick={() => navigate('/seller/settings')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 mt-auto cursor-pointer">
                        <span className="material-symbols-outlined mr-4">settings</span>
                        Settings
                    </a>
                </nav>
            </aside>

            {/* Main Content Wrapper */}
            <div className="ml-64 flex flex-col min-h-screen">
                {/* TopNavBar */}
                <header className="flex items-center justify-between px-8 md:px-margin-desktop sticky top-0 z-40 bg-surface-container-lowest w-full h-20 border-b border-border-low-contrast">
                    <div className="flex items-center w-1/3">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                            <input className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-border-low-contrast focus:border-primary focus:ring-0 font-body-md text-body-md transition-colors rounded-none placeholder-on-surface-variant focus:outline-none" placeholder="Search..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/seller/create-product')} className="bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase hover:opacity-90 transition-opacity rounded-none cursor-pointer flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            New Listing
                        </button>
                        <button className="text-secondary hover:text-primary transition-opacity scale-95 transition-transform duration-150 cursor-pointer">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                    </div>
                </header>

                {/* Canvas */}
                <main className="flex-1 px-8 md:px-margin-desktop py-12 pb-section-gap">
                    {/* Greeting */}
                    <section className="mb-12">
                        <h2 className="font-headline-lg text-headline-lg text-primary">Welcome back, Seller</h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Here is what's happening with your store today.</p>
                    </section>

                    {/* Metrics Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-16">
                        <div className="border border-border-low-contrast p-8 bg-surface-container-lowest flex flex-col">
                            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Total Sales</span>
                            <span className="font-display-lg text-primary text-headline-lg">
                                {analyticsLoading ? '...' : formatMoney(analytics?.totalRevenue, analytics?.currency)}
                            </span>
                            <div className="mt-4 flex items-center text-sm font-label-md text-label-md text-on-surface-variant">
                                <span className="material-symbols-outlined text-[16px] mr-1">payments</span>
                                <span>From paid orders</span>
                            </div>
                        </div>
                        <div className="border border-border-low-contrast p-8 bg-surface-container-lowest flex flex-col">
                            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Total Orders</span>
                            <span className="font-display-lg text-primary text-headline-lg">
                                {analyticsLoading ? '...' : (analytics?.totalOrders ?? 0)}
                            </span>
                            <div className="mt-4 flex items-center text-sm font-label-md text-label-md text-on-surface-variant">
                                <span className="material-symbols-outlined text-[16px] mr-1">shopping_bag</span>
                                <span>{analytics?.totalUnitsSold ?? 0} units sold</span>
                            </div>
                        </div>
                        <div className="border border-border-low-contrast p-8 bg-surface-container-lowest flex flex-col">
                            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Active Products</span>
                            <span className="font-display-lg text-primary text-headline-lg">{loading ? '...' : products.length}</span>
                            <div className="mt-4 flex items-center text-sm font-label-md text-label-md text-on-surface-variant">
                                <span className="">Currently live</span>
                            </div>
                        </div>
                        <div className="border border-border-low-contrast p-8 bg-surface-container-lowest flex flex-col">
                            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-2">Best Seller</span>
                            <span className="font-headline-md text-headline-md text-primary truncate">
                                {analyticsLoading ? '...' : (analytics?.bestSeller?.title || '—')}
                            </span>
                            <div className="mt-4 flex items-center text-sm font-label-md text-label-md text-on-surface-variant">
                                <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                                <span>{analytics?.bestSeller ? `${analytics.bestSeller.unitsSold} units` : 'No sales yet'}</span>
                            </div>
                        </div>
                    </section>

                    {/* My Listings Section */}
                    <section className="mb-16">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h3 className="font-headline-md text-headline-md text-primary">My Listings</h3>
                            </div>
                        </div>

                        {/* Loading skeleton */}
                        {loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-surface-container-lowest border border-border-low-contrast overflow-hidden rounded-none animate-pulse">
                                        <div className="aspect-[4/3] bg-surface-container-low" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-surface-container-low rounded-none w-3/4" />
                                            <div className="h-3 bg-surface-container-low rounded-none w-full" />
                                            <div className="pt-3 border-t border-border-low-contrast flex justify-between">
                                                <div className="h-4 bg-surface-container-low rounded-none w-1/3" />
                                                <div className="h-3 bg-surface-container-low rounded-none w-1/4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Product grid */}
                        {!loading && products.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
                                {products.map(product => (
                                    <ProductCard 
                                        key={product._id} 
                                        product={product} 
                                        onDelete={handleDelete}
                                        isDeleting={deletingId === product._id}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && products.length === 0 && (
                            <EmptyState onAdd={() => navigate('/seller/create-product')} />
                        )}
                    </section>
                    
                    {/* Recent Orders */}
                    <section className="border border-border-low-contrast bg-surface-container-lowest">
                        <div className="p-6 border-b border-border-low-contrast flex justify-between items-center">
                            <h3 className="font-headline-md text-headline-md text-primary">Recent Orders</h3>
                            <button className="bg-surface-container-lowest border border-primary text-primary px-8 py-4 font-label-md text-label-md uppercase hover:bg-surface-container-low transition-colors rounded-none cursor-pointer">View All</button>
                        </div>
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">shopping_bag</span>
                            <p className="font-headline-md text-headline-md text-primary mb-2">No recent orders</p>
                            <p className="font-body-md text-body-md text-on-surface-variant">When you receive new orders, they will appear here.</p>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

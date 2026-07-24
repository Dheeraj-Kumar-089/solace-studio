import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';

const SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const STATUS_STYLES = {
    paid: 'text-primary border-primary',
    pending: 'text-secondary border-outline-variant',
    failed: 'text-error border-error',
};

const SellerOrders = () => {
    const navigate = useNavigate();
    const { handleGetSellerOrders } = useProduct();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await handleGetSellerOrders();
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load seller orders', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="font-body-md text-on-surface antialiased bg-surface-container-lowest min-h-screen">
            {/* SideNavBar */}
            <aside className="fixed left-0 top-0 h-screen flex flex-col py-8 bg-surface-container-lowest w-64 border-r border-border-low-contrast z-50">
                <div className="px-8 mb-12 flex flex-col items-start cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="font-headline-md text-headline-md font-black tracking-tighter text-primary">SOLACE STUDIO</h1>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Seller Portal</span>
                </div>
                <nav className="flex-1 flex flex-col gap-y-2 px-4">
                    <a onClick={() => navigate('/seller/dashboard')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                        <span className="material-symbols-outlined mr-4">dashboard</span>
                        Dashboard
                    </a>
                    <a onClick={() => navigate('/seller/create-product')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                        <span className="material-symbols-outlined mr-4">inventory_2</span>
                        Products
                    </a>
                    <a onClick={() => navigate('/seller/orders')} className="flex items-center py-3 text-primary font-bold border-l-4 border-primary pl-4 font-label-md text-label-md uppercase tracking-wider bg-surface-container-low cursor-pointer">
                        <span className="material-symbols-outlined mr-4">shopping_bag</span>
                        Orders
                    </a>
                    <a onClick={() => navigate('/seller/settings')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 mt-auto cursor-pointer">
                        <span className="material-symbols-outlined mr-4">settings</span>
                        Settings
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-0 md:ml-64 pt-12 px-4 md:px-margin-desktop pb-section-gap min-h-screen bg-surface-container-lowest">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-10">
                        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Orders</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Orders containing your products.</p>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="border border-border-low-contrast rounded-none p-6 animate-pulse h-24" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center border border-border-low-contrast rounded-none bg-surface-container-lowest">
                            <p className="font-headline-md text-headline-md text-primary">No orders yet</p>
                            <p className="font-body-md text-body-md text-on-surface-variant">Orders for your listings will show up here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const sym = SYMBOL[order.currency] ?? order.currency;
                                const date = order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '—';
                                return (
                                    <div key={order._id} className="border border-border-low-contrast rounded-none bg-surface-container-lowest p-6">
                                        <div className="flex flex-wrap justify-between items-center gap-3 pb-4 mb-4 border-b border-border-low-contrast">
                                            <div>
                                                <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-1">
                                                    Order #{order._id.slice(-8).toUpperCase()}
                                                </p>
                                                <p className="font-body-md text-body-md text-on-surface-variant">{date}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`font-label-sm text-label-sm uppercase tracking-widest border px-3 py-1 rounded-none ${STATUS_STYLES[order.status] || 'text-secondary border-outline-variant'}`}>
                                                    {order.status}
                                                </span>
                                                <span className="font-headline-md text-headline-md text-primary">
                                                    {sym}{order.itemsTotal?.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-surface-container rounded-none flex-shrink-0 overflow-hidden">
                                                        {item.images?.[0]?.url && (
                                                            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-label-md text-label-md text-primary truncate">{item.title}</p>
                                                        <p className="font-body-md text-body-md text-on-surface-variant">Qty {item.quantity}</p>
                                                    </div>
                                                    <span className="font-body-md text-body-md text-primary flex-shrink-0">
                                                        {SYMBOL[item.price?.currency] ?? item.price?.currency}{item.price?.amount?.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SellerOrders;

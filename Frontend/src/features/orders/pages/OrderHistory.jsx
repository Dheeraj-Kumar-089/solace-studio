import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useOrder } from '../hooks/useOrder';

const SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const STATUS_STYLES = {
    paid: 'text-primary border-primary',
    pending: 'text-secondary border-outline-variant',
    failed: 'text-error border-error',
};

const OrderSkeleton = () => (
    <div className="border border-outline-variant p-6 animate-pulse space-y-4">
        <div className="h-4 bg-surface-container rounded-none w-1/3" />
        <div className="h-3 bg-surface-container rounded-none w-1/2" />
        <div className="h-16 bg-surface-container rounded-none w-full" />
    </div>
);

const OrderHistory = () => {
    const { handleGetMyOrders } = useOrder();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await handleGetMyOrders();
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load order history', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md pt-16">
            <main className="max-w-[1440px] mx-auto w-full px-4 md:px-margin-desktop py-16">
                <div className="flex justify-between items-end border-b border-border-low-contrast pb-4 mb-12">
                    <h1 className="font-headline-lg text-headline-lg tracking-tight">Order History</h1>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => <OrderSkeleton key={i} />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center border border-border-low-contrast">
                        <p className="font-headline-md text-headline-md text-primary">No orders yet</p>
                        <p className="font-body-md text-body-md text-secondary">Your past orders will show up here once you check out.</p>
                        <Link
                            to="/"
                            className="mt-4 bg-primary text-on-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-inverse-surface transition-colors duration-200 cursor-pointer"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const sym = SYMBOL[order.price?.currency] ?? order.price?.currency;
                            const date = order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '—';
                            return (
                                <div key={order._id} className="border border-outline-variant p-6">
                                    <div className="flex flex-wrap justify-between items-center gap-4 pb-4 mb-4 border-b border-outline-variant">
                                        <div>
                                            <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-1">
                                                Order #{order._id.slice(-8).toUpperCase()}
                                            </p>
                                            <p className="font-body-md text-body-md text-secondary">{date}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-label-sm text-label-sm uppercase tracking-widest border px-3 py-1 ${STATUS_STYLES[order.status] || 'text-secondary border-outline-variant'}`}>
                                                {order.status}
                                            </span>
                                            <span className="font-headline-md text-headline-md text-primary">
                                                {sym}{order.price?.amount?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {(order.orderItems || []).map((item, i) => (
                                            <Link
                                                key={i}
                                                to={`/product/${item.productId}`}
                                                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                                            >
                                                <div className="w-16 h-16 bg-surface-container flex-shrink-0 overflow-hidden rounded-none">
                                                    {item.images?.[0]?.url && (
                                                        <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <p className="font-label-md text-label-md text-primary truncate">{item.title}</p>
                                                    <p className="font-body-md text-body-md text-secondary">Qty {item.quantity}</p>
                                                </div>
                                                <span className="font-body-md text-body-md text-primary flex-shrink-0">
                                                    {SYMBOL[item.price?.currency] ?? item.price?.currency}{item.price?.amount?.toLocaleString('en-IN')}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderHistory;

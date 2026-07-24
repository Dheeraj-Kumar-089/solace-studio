import React from 'react'
import { useLocation, Link } from 'react-router'

const OrderSuccess = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const orderId = queryParams.get("order_id") || "SN-00000"

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md pt-16 overflow-x-hidden">
            <main className="px-4 md:px-margin-desktop py-14 max-w-[1200px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

                    {/* Left Column: Success Message & Summary */}
                    <div className="flex-grow w-full space-y-10">
                        <section className="space-y-3">
                            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                                Transaction Complete
                            </span>
                            <h1 className="font-display-lg text-display-lg tracking-tight text-primary">
                                Your order is confirmed
                            </h1>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                                    Order Reference
                                </span>
                                <span className="font-label-md text-label-md text-primary font-semibold">
                                    #{orderId}
                                </span>
                            </div>
                        </section>

                        <section className="bg-surface-container-lowest rounded-none p-6 md:p-8 border border-outline-variant space-y-6">
                            <h3 className="font-headline-md text-headline-md text-primary pb-4 border-b border-outline-variant">
                                Order Summary
                            </h3>

                            <div className="flex gap-5 items-center">
                                <div className="w-20 md:w-24 aspect-[0.85] flex-shrink-0 overflow-hidden rounded-none bg-surface-container-high border border-outline-variant">
                                    <img
                                        className="w-full h-full object-cover"
                                        alt="Order Item"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2RecxLWsxoaJynjbfvLhuprDTMGsixBfioU4mbbHAwGqbpMf6F_huInjecTUxna_Zu_L7Gi4m-t0JDR9fsydoDl1zu3a-c0YusFQtRSFCdag1T6MBqd8acu7PunJfNXzTc5uK4eBNrw1lh0lgL_9CbR2AZs24nUxgGwKlUYjOEqEof9FSZrlOpzDmxlNMsvGmGAEPWFT42HixJtHAGEYo2R4TR2b-IV0kxjCslE4okGTbl-Ikc7WyUMQtSnfcurwHAc1qshFN3Ho"
                                    />
                                </div>
                                <div className="flex-grow space-y-1">
                                    <h4 className="font-label-md text-label-md text-primary font-semibold">
                                        Architectural Wool Overcoat
                                    </h4>
                                    <p className="text-secondary font-label-sm text-label-sm uppercase tracking-wide">
                                        Camel / Large
                                    </p>
                                    <p className="font-body-md text-body-md text-primary font-semibold pt-1">$1,450.00</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-outline-variant">
                                <div className="flex justify-between items-center pt-3">
                                    <span className="font-body-md text-body-md text-secondary">Subtotal</span>
                                    <span className="font-body-md text-body-md text-secondary">$1,450.00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-body-md text-body-md text-secondary">Shipping</span>
                                    <span className="font-body-md text-body-md text-secondary">Complimentary</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 mt-1 border-t border-outline-variant">
                                    <span className="text-primary font-label-md text-label-md font-semibold uppercase tracking-wide">Total</span>
                                    <span className="text-primary font-headline-md text-headline-md">$1,450.00</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Delivery Details & Actions */}
                    <aside className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-28 space-y-8">
                        <div className="bg-surface-container-lowest rounded-none border border-outline-variant p-6 md:p-8 space-y-7">
                            <div className="space-y-2">
                                <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                                    Arrival Estimate
                                </h3>
                                <p className="font-body-md text-body-md text-primary leading-relaxed">
                                    Being prepared for transit. Expect arrival between <span className="font-semibold">October 24th – 26th</span>.
                                </p>
                            </div>

                            <div className="space-y-2 pt-5 border-t border-outline-variant">
                                <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                                    Shipping Address
                                </h3>
                                <p className="font-body-md text-body-md text-primary leading-relaxed">
                                    Julianne V. Sterling<br />
                                    742 Avenue Montaigne, Apt 4B<br />
                                    Paris, France 75008
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                to="/orders"
                                className="w-full bg-primary text-on-primary py-4 text-center rounded-none font-label-md text-label-md uppercase tracking-widest hover:bg-on-surface-variant transition-colors active:scale-[0.98] duration-150 cursor-pointer block"
                            >
                                View Order Status
                            </Link>
                            <Link
                                to="/"
                                className="w-full bg-transparent border border-outline-variant text-primary py-4 text-center rounded-none font-label-md text-label-md uppercase tracking-widest hover:border-primary transition-colors cursor-pointer block"
                            >
                                Continue Shopping
                            </Link>
                        </div>

                        <p className="text-center font-label-sm text-label-sm text-secondary leading-relaxed px-2">
                            A confirmation email has been dispatched. For alterations or inquiries, contact our concierge.
                        </p>
                    </aside>

                </div>
            </main>
        </div>
    )
}

export default OrderSuccess
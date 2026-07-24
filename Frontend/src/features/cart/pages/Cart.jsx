import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useCart } from '../hook/useCart'
import { Link, useNavigate } from 'react-router' 
import { useRazorpay } from 'react-razorpay'

const SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const tokens = {
    surface: '#fbf9f6',
    surfaceLow: '#f5f3f0',
    surfaceLowest: '#ffffff',
    surfaceHigh: '#eae8e5',
    surfaceHighest: '#e4e2df',
    onSurface: '#1b1c1a',
    onSurfaceVariant: '#4d463a',
    secondary: '#7A6E63',
    muted: '#B5ADA3',
    primary: '#C9A96E',
    primaryDark: '#745a27',
    outlineVariant: '#d0c5b5',
    outline: '#7f7668',
}

const Cart = () => {
  const { totalPrice, currency, items } = useSelector(state => state.cart || {})
  const { handleGetCart, handleIncrementCartItem, handleDecrementCartItem, handleRemoveCartItem,handleCreateCartOrder,handleVerifyCartOrder } = useCart()
  const navigate = useNavigate()
  const { error, isLoading, Razorpay } = useRazorpay();
    const user = useSelector(state => state.auth.user)


  useEffect(() => {
    handleGetCart()
  }, [])


  async function handleCheckout(){
    console.log("order")
    const order = await handleCreateCartOrder()
    

    const options = {
            key: "rzp_test_T76IBph93wvunA",
            amount: order.amount, // Amount in paise
            currency: order.currency,
            name: "Solace Studio",
            description: "Test Transaction",
            order_id: order.id, // Generate order_id on server
            handler: async (response) => {

                const isValid = await handleVerifyCartOrder(response)

                if (isValid) {
                    navigate(`/order-success?order_id=${response?.razorpay_order_id}`)
                }
            },
            prefill: {
                name: user?.fullname,
                email: user?.email,
                contact: user?.contact,
            },
            theme: {
                color: tokens.primary,
            },
        };

        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();

  }

  const sym = currency ? (SYMBOL[currency] ?? currency) : 'INR'

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md pt-16 overflow-x-clip">
      <main className="px-4 md:px-margin-desktop py-16 max-w-[1440px] mx-auto">
        
        {/* Title */}
        <header className="mb-16">
          <h1 className="font-display-lg text-display-lg tracking-tight uppercase">Your Bag</h1>
          {items && items.length > 0 && (
              <p className="text-secondary mt-2 font-label-md text-label-md tracking-wider">{items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'} IN YOUR CART</p>
          )}
        </header>

        {items && items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-gutter items-start">
            
            {/* Left: Cart Items */}
            <div className="flex-grow">
              <div className="w-full">
                
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 pb-6 border-b border-outline-variant text-secondary font-label-sm text-label-sm uppercase tracking-widest">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Size</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                </div>

                {items.map((item) => {
                  const product = item.product;
                  const variantId = item.variant;
                

                  // Safety check: if product was deleted but is still in cart
                  if (!product) {
                      return (
                          <div key={item._id} className="grid grid-cols-12 py-10 border-b border-outline-variant items-center group">
                              <div className="col-span-12 flex justify-between items-center text-error">
                                  <p>Product is no longer available.</p>
                                  <button onClick={() => handleRemoveCartItem({ productId: item.productId, variantId: item.variant })} className="font-label-sm text-label-sm uppercase tracking-widest hover:underline transition-all">Remove</button>
                              </div>
                          </div>
                      );
                  }

                  let image = product.images?.[0]?.url;
                  if (product.variants) {
                      if (Array.isArray(product.variants)) {
                          const variant = product.variants.find(v => v._id === variantId);
                          if (variant && variant.images && variant.images.length > 0) {
                              image = variant.images[0].url;
                          }
                      } else {
                          if (product.variants.images && product.variants.images.length > 0) {
                              image = product.variants.images[0].url;
                          }
                      }
                  }

                  let size = 'N/A';
                  if (product.variants) {
                      if (Array.isArray(product.variants)) {
                          const variant = product.variants.find(v => v._id === variantId);
                          if (variant && variant.attributes && variant.attributes.size) {
                              size = variant.attributes.size;
                          } else if (variant && variant.attributes && variant.attributes.Size) {
                              size = variant.attributes.Size;
                          }
                      } else {
                          if (product.variants.attributes && product.variants.attributes.size) {
                              size = product.variants.attributes.size;
                          } else if (product.variants.attributes && product.variants.attributes.Size) {
                              size = product.variants.attributes.Size;
                          }
                      }
                  }

                  const cartItemPrice = item.price;
                  // Use the variant's price to match the backend aggregation pipeline logic
                  const currentProductPrice = product.variants?.price || product.price;
                  const priceSym = SYMBOL[currentProductPrice?.currency] ?? currentProductPrice?.currency ?? 'INR';
                  const priceAmountStr = currentProductPrice?.amount?.toLocaleString('en-IN') ?? '0';

                  const formatCurrency = (amount, currency) => {
                      const sym = SYMBOL[currency] ?? currency ?? 'INR';
                      return `${sym} ${amount?.toLocaleString('en-IN')}`;
                  };

                  let remainingStock = 0;
                  if (product.variants) {
                      if (Array.isArray(product.variants)) {
                          const variant = product.variants.find(v => v._id === variantId);
                          if (variant && typeof variant.stock === 'number') {
                              remainingStock = variant.stock;
                          }
                      } else {
                          if (typeof product.variants.stock === 'number') {
                              remainingStock = product.variants.stock;
                          }
                      }
                  }

                  const stock = remainingStock;

                  return (
                    <div key={`${product._id}-${variantId}`} className="flex flex-col md:grid md:grid-cols-12 py-10 border-b border-outline-variant items-start md:items-center group gap-6 md:gap-0">
                      
                      <div className="col-span-6 flex gap-8 items-center w-full">
                        <div onClick={() => navigate(`/product/${product._id}`)} className="w-24 md:w-32 aspect-[0.73] overflow-hidden bg-surface-container-high border border-outline-variant flex-shrink-0 cursor-pointer">
                          {image ? (
                            <img src={image} alt={product.title} className="w-full h-full object-cover transition-all duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-label-sm text-secondary">No Image</div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 onClick={() => navigate(`/product/${product._id}`)} className="font-headline-md text-headline-md text-primary tracking-tight cursor-pointer hover:underline">{product.title}</h3>
                          <p className="text-secondary font-body-md text-body-md mt-1 mb-2 line-clamp-1">{product.description}</p>
                          
                          {cartItemPrice?.amount !== currentProductPrice?.amount && cartItemPrice?.amount && currentProductPrice?.amount && (
                              <div className="mt-1">
                                {console.log("cartItemPrice",cartItemPrice)}
                                {console.log("currentProductPrice",currentProductPrice)}
                                  {cartItemPrice.amount > currentProductPrice.amount
                                      ? <p className="text-[10px] uppercase tracking-[0.15em] mb-4 text-green-800 font-bold">You will get this at {formatCurrency(currentProductPrice.amount, currentProductPrice.currency)} save {formatCurrency(Math.abs(currentProductPrice.amount - cartItemPrice.amount), currentProductPrice.currency)}.</p>
                                      : <p className="text-[10px] uppercase tracking-[0.15em] mb-4 text-error font-bold">Warning this product will cost you {formatCurrency(Math.abs(currentProductPrice.amount - cartItemPrice.amount), currentProductPrice.currency)} more.</p>
                                  }
                              </div>
                          )}

                          {stock !== undefined && (
                              <p className="text-[10px] uppercase tracking-[0.15em] mb-4 text-secondary">
                                  {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                              </p>
                          )}

                          <button 
                            onClick={() => handleRemoveCartItem({ productId: product._id, variantId })} 
                            className="mt-2 text-error font-label-sm text-label-sm uppercase tracking-widest hover:underline transition-all cursor-pointer"
                          >
                            Remove
                          </button>
                          
                          {/* Mobile-only Size & Price */}
                          <div className="flex md:hidden items-center justify-between mt-6 border-t border-outline-variant pt-4">
                              <div>
                                  <span className="text-secondary font-label-sm text-label-sm uppercase">Size: </span>
                                  <span className="font-body-lg text-body-lg text-primary">{size}</span>
                              </div>
                              <div className="font-headline-md text-headline-md text-primary">{priceSym}{priceAmountStr}</div>
                          </div>
                          
                          {/* Mobile-only Quantity */}
                          <div className="flex md:hidden items-center mt-4">
                              <span className="text-secondary font-label-sm text-label-sm uppercase mr-4">Qty: </span>
                              <div className="flex items-center border border-primary px-3 py-1 gap-4">
                                <button onClick={() => handleDecrementCartItem({ productId: product._id, variantId })} className="hover:text-secondary transition-colors cursor-pointer">
                                  <span className="material-symbols-outlined text-[18px]">remove</span>
                                </button>
                                <span className="font-label-md text-label-md w-4 text-center">{item.quantity}</span>
                                <button 
                                  disabled={remainingStock <= 0}
                                  onClick={() => handleIncrementCartItem({ productId: product._id, variantId })} 
                                  className={`hover:text-secondary transition-colors cursor-pointer ${remainingStock <= 0 ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">add</span>
                                </button>
                              </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Size */}
                      <div className="hidden md:block col-span-2 text-center font-body-lg text-body-lg text-primary">{size}</div>
                      
                      {/* Desktop Quantity */}
                      <div className="hidden md:flex col-span-2 justify-center">
                        <div className="flex items-center border border-primary px-3 py-1 gap-4">
                          <button onClick={() => handleDecrementCartItem({ productId: product._id, variantId })} className="hover:text-secondary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>
                          <span className="font-label-md text-label-md w-4 text-center">{item.quantity}</span>
                          <button 
                            disabled={remainingStock <= 0}
                            onClick={() => handleIncrementCartItem({ productId: product._id, variantId })} 
                            className={`hover:text-secondary transition-colors cursor-pointer ${remainingStock <= 0 ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="hidden md:block col-span-2 text-right font-headline-md text-headline-md text-primary">{priceSym}{priceAmountStr}</div>
                    </div>
                  )
                })}
              </div>

              {/* Policy strip */}
              <div className="mt-12 pt-8 grid grid-cols-3 gap-4 border-t border-outline-variant">
                  <div>
                      <p className="font-label-md text-label-md uppercase tracking-widest text-primary mb-2">Shipping</p>
                      <p className="font-body-sm text-body-sm text-secondary">Complimentary over INR 15,000</p>
                  </div>
                  <div>
                      <p className="font-label-md text-label-md uppercase tracking-widest text-primary mb-2">Returns</p>
                      <p className="font-body-sm text-body-sm text-secondary">Within 14 days of delivery</p>
                  </div>
                  <div>
                      <p className="font-label-md text-label-md uppercase tracking-widest text-primary mb-2">Authenticity</p>
                      <p className="font-body-sm text-body-sm text-secondary">100% Guaranteed</p>
                  </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <aside className="w-full lg:w-[400px] flex-shrink-0 mt-12 lg:mt-0 sticky top-28 z-10 ml-10">
              <div className="bg-surface-container-lowest p-8 lg:p-10 border border-outline-variant">
                <h2 className="font-headline-md text-headline-md text-primary uppercase tracking-tighter mb-8 pb-4 border-b border-outline-variant">Order Summary</h2>
                
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-baseline">
                    <span className="text-secondary font-label-md text-label-md uppercase">Subtotal</span>
                    <span className="text-primary font-body-lg text-body-lg font-bold">{sym} {totalPrice?.toLocaleString('en-IN') ?? '0'}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-secondary font-label-md text-label-md uppercase">Shipping</span>
                    <span className={`font-label-md text-label-md ${totalPrice >= 15000 ? 'text-primary font-bold' : 'text-secondary'}`}>
                        {totalPrice >= 15000 ? 'Complimentary' : 'Complimentary over INR 15,000'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-secondary font-label-md text-label-md uppercase">Duties & Taxes</span>
                    <span className="text-secondary font-label-md text-label-md">Included</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-6 border-t border-outline-variant">
                    <span className="text-primary font-label-md text-label-md font-bold uppercase tracking-widest">Total</span>
                    <span className="text-primary font-headline-md text-headline-md">{sym} {totalPrice?.toLocaleString('en-IN') ?? '0'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-primary text-on-primary py-5 font-label-md text-label-md uppercase tracking-widest hover:bg-on-surface-variant transition-colors active:scale-[0.98] duration-150 cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full bg-transparent border border-outline-variant text-primary py-5 font-label-md text-label-md uppercase tracking-widest hover:border-primary transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                  <p className="pt-4 text-[10px] text-secondary-container text-center uppercase tracking-widest leading-relaxed">
                    Free returns within 14 days · Authenticity guaranteed
                  </p>
                </div>
              </div>
            </aside>

          </div>
        ) : (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-6">
            <p className="font-display-md text-display-md text-primary tracking-tight">Your selection is empty.</p>
            <p className="font-label-md text-label-md text-secondary uppercase tracking-widest">Curate your collection</p>
            <Link to="/" className="mt-4 font-label-md text-label-md uppercase tracking-widest border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all cursor-pointer">
              Explore the Archive
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}

export default Cart
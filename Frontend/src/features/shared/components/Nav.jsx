import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router'
import { useCart } from '../../cart/hook/useCart'
import { useWishlist } from '../../wishlist/hooks/useWishlist'
import { useAuth } from '../../auth/hooks/useAuth'
import { API_BASE_URL } from '../../../app/config'
import axios from 'axios'



const Nav = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const user = useSelector(state => state.auth.user)
    const { handleGetCart } = useCart()
    const { handleGetWishlist, handleToggleWishlistItem } = useWishlist()
    const { handleLogout } = useAuth()
    const cartItems = useSelector(state => state.cart?.items)
    const totalQuantity = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [suggestions, setSuggestions] = useState([])
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const searchRef = useRef(null)

    const [wishlistItems, setWishlistItems] = useState([])
    const [isWishlistOpen, setIsWishlistOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const wishlistRef = useRef(null)
    const userMenuRef = useRef(null)

    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '')
    }, [searchParams])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false)
            }
            if (wishlistRef.current && !wishlistRef.current.contains(event.target)) {
                setIsWishlistOpen(false)
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!user || user.role === 'seller') {
            setWishlistItems([])
            return
        }
        (async () => {
            try {
                const items = await handleGetWishlist()
                setWishlistItems(items || [])
            } catch (error) {
                console.error("Error fetching wishlist", error)
            }
        })()
    }, [user])

    useEffect(() => {
        if (!isWishlistOpen || !user || user.role === 'seller') return
        (async () => {
            try {
                const items = await handleGetWishlist()
                setWishlistItems(items || [])
            } catch (error) {
                console.error("Error fetching wishlist", error)
            }
        })()
    }, [isWishlistOpen])

    const handleRemoveFromWishlist = async (productId) => {
        setWishlistItems((prev) => prev.filter((p) => p._id !== productId))
        try {
            await handleToggleWishlistItem(productId)
        } catch (error) {
            console.error("Failed to remove from wishlist", error)
        }
    }

    const handleLogoutClick = async () => {
        setIsUserMenuOpen(false)
        try {
            await handleLogout()
        } finally {
            navigate('/')
        }
    }

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery.trim()) {
                setSuggestions([])
                return
            }
            
            setIsSearching(true)
            try {
                const response = await axios.get(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`, { withCredentials: true })
                if (response.data.success) {
                    setSuggestions(response.data.products)
                }
            } catch (error) {
                console.error("Error fetching suggestions", error)
                setSuggestions([])
            } finally {
                setIsSearching(false)
            }
        }

        const timerId = setTimeout(() => {
            fetchSuggestions()
        }, 300) 

        return () => clearTimeout(timerId)
    }, [searchQuery])

    useEffect(() => {
        if (user && user.role !== 'seller') {
            handleGetCart()
        }
    }, [user])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            navigate('/')
        }
    }

    return (
        <nav className="bg-surface text-primary fixed top-0 w-full z-50 border-b border-outline-variant">
            <div className="flex justify-between items-center h-16 px-4 md:px-margin-desktop max-w-[1440px] mx-auto">
                {/* Logo */}
                <Link to="/"
                    className="font-headline-md text-headline-md font-black tracking-tighter text-primary hover:opacity-80 transition-opacity flex-shrink-0"
                >
                    SOLACE STUDIO
                </Link>

            {/* Search Box */}
            <div ref={searchRef} className="flex relative w-full max-w-md mx-4 lg:mx-8">
                <form onSubmit={handleSearch} className="w-full relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                    </svg>
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        placeholder='AI Search… e.g. "black hoodie under ₹2000"'
                        className="w-full bg-surface-container-low border border-border-low-contrast rounded-none pl-10 pr-4 py-2.5
                            font-body-md text-body-md text-primary placeholder-secondary focus:outline-none focus:border-primary
                            transition-all duration-200"
                    />
                </form>

                {/* Autocomplete Dropdown */}
                {isSearchFocused && searchQuery.trim().length > 0 && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-surface-container-lowest border border-outline-variant shadow-lg max-h-96 overflow-y-auto z-50">
                        {isSearching ? (
                            <div className="p-4 text-sm text-secondary text-center">Searching...</div>
                        ) : suggestions.length > 0 ? (
                            <ul className="py-2">
                                {suggestions.map((product) => (
                                    <li key={product._id} className="border-b border-outline-variant last:border-0">
                                        <Link
                                            to={`/product/${product._id}`}
                                            onClick={() => {
                                                setIsSearchFocused(false)
                                            }}
                                            className="flex items-center px-4 py-3 hover:bg-surface-container-low transition-colors"
                                        >
                                            <div className="w-12 h-16 bg-surface-container flex-shrink-0 mr-4">
                                                <img src={product.images[0]?.url} alt={product.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm font-semibold text-primary line-clamp-1">{product.title}</p>
                                                <p className="text-xs text-secondary mt-1">{product.category}</p>
                                            </div>
                                            <div className="text-sm font-semibold text-primary ml-2 flex-shrink-0">
                                                {product.price.currency === 'INR' ? '₹' : '$'}{product.price.amount}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                                <li className="border-t border-outline-variant">
                                    <button 
                                        type="button"
                                        onClick={handleSearch}
                                        className="w-full px-4 py-3 text-sm font-semibold text-primary hover:bg-surface-container-low text-center uppercase tracking-widest transition-colors"
                                    >
                                        View All Results
                                    </button>
                                </li>
                            </ul>
                        ) : (
                            <div className="p-4 text-sm text-secondary text-center">No products found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Links / Auth */}
            <div className="flex gap-4 md:gap-8 items-center text-primary">
                {user ? (
                    <>
                        {user.role !== 'seller' && (
                            <div className="relative" ref={wishlistRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsWishlistOpen((v) => !v)}
                                    className="relative flex items-center hover:text-secondary transition-colors cursor-pointer"
                                    aria-label="Wishlist"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20.5s-7.5-4.6-10-9.3C0.3 7.9 1.8 4.5 5 3.4c2.3-0.8 4.7 0 6 2 1.3-2 3.7-2.8 6-2 3.2 1.1 4.7 4.5 3 7.8-2.5 4.7-10 9.3-10 9.3z" />
                                    </svg>
                                    {wishlistItems.length > 0 && (
                                        <span
                                            className="absolute -top-2 -right-2 flex items-center justify-center rounded-none bg-primary text-on-primary font-label-sm text-label-sm"
                                            style={{ width: '16px', height: '16px', fontSize: '9px' }}
                                        >
                                            {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                                        </span>
                                    )}
                                </button>

                                {isWishlistOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant shadow-lg max-h-96 overflow-y-auto z-50">
                                        <div className="px-4 py-3 border-b border-outline-variant font-label-md text-label-md uppercase tracking-wider text-primary">
                                            My Wishlist
                                        </div>
                                        {wishlistItems.length > 0 ? (
                                            <ul>
                                                {wishlistItems.map((product) => (
                                                    <li key={product._id} className="border-b border-outline-variant last:border-0 flex items-center px-4 py-3 hover:bg-surface-container-low transition-colors">
                                                        <Link
                                                            to={`/product/${product._id}`}
                                                            onClick={() => setIsWishlistOpen(false)}
                                                            className="flex items-center flex-grow min-w-0"
                                                        >
                                                            <div className="w-12 h-16 bg-surface-container flex-shrink-0 mr-4">
                                                                <img src={product.images?.[0]?.url} alt={product.title} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <p className="text-sm font-semibold text-primary line-clamp-1">{product.title}</p>
                                                                <p className="text-xs text-secondary mt-1">
                                                                    {product.price?.currency === 'INR' ? '₹' : '$'}{product.price?.amount}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFromWishlist(product._id)}
                                                            className="ml-2 flex-shrink-0 text-secondary hover:text-error transition-colors cursor-pointer"
                                                            aria-label="Remove from wishlist"
                                                        >
                                                            ✕
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-4 text-sm text-secondary text-center">Your wishlist is empty</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative hidden md:block" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => setIsUserMenuOpen((v) => !v)}
                                className="flex items-center gap-1.5 font-label-md text-label-md uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer"
                            >
                                {user.fullname}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-52 bg-surface-container-lowest border border-outline-variant shadow-lg z-50">
                                    {user.role === 'seller' ? (
                                        <Link
                                            to="/seller/dashboard"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="block px-4 py-3 font-label-md text-label-md uppercase tracking-wider text-primary hover:bg-surface-container-low transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/orders"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="block px-4 py-3 font-label-md text-label-md uppercase tracking-wider text-primary hover:bg-surface-container-low transition-colors"
                                        >
                                            Orders
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleLogoutClick}
                                        className="w-full text-left px-4 py-3 font-label-md text-label-md uppercase tracking-wider text-error hover:bg-surface-container-low transition-colors cursor-pointer border-t border-outline-variant"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        <Link
                            to="/cart"
                            className="relative flex items-center hover:text-secondary transition-colors cursor-pointer"
                            aria-label="Shopping cart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {totalQuantity > 0 && (
                                <span
                                    className="absolute -top-2 -right-2 flex items-center justify-center rounded-none bg-primary text-on-primary font-label-sm text-label-sm"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        fontSize: '9px',
                                    }}
                                >
                                    {totalQuantity > 99 ? '99+' : totalQuantity}
                                </span>
                            )}
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="font-label-md text-label-md uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer">Sign In</Link>
                        <Link to="/register" className="font-label-md text-label-md uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer">Sign Up</Link>
                    </>
                )}
            </div>
            </div>
        </nav>
    )
}

export default Nav
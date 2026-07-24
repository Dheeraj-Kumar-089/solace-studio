import React from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

const WishlistButton = ({ productId, isWishlisted, onToggle, className = '' }) => {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        onToggle(productId);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`h-8 w-8 flex items-center justify-center rounded-none bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer ${className}`}
        >
            <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill={isWishlisted ? '#ba1a1a' : 'none'}
                stroke={isWishlisted ? '#ba1a1a' : 'currentColor'}
                strokeWidth="1.75"
                className="text-primary transition-colors"
            >
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 20.5s-7.5-4.6-10-9.3C0.3 7.9 1.8 4.5 5 3.4c2.3-0.8 4.7 0 6 2 1.3-2 3.7-2.8 6-2 3.2 1.1 4.7 4.5 3 7.8-2.5 4.7-10 9.3-10 9.3z" />
            </svg>
        </button>
    );
};

export default WishlistButton;

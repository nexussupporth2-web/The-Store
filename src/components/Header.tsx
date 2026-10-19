import React from 'react';
import { Menu, ShoppingBag, Heart } from 'lucide-react';
import { StoreConfig } from '../types';

interface HeaderProps {
  config: StoreConfig;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenMenu: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenMenu,
}) => {
  const initial = (config.name.trim()[0] || 'S').toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 transition-colors duration-200 shadow-md"
      style={{
        backgroundColor: config.brand,
        color: 'var(--on-brand, #ffffff)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 py-5 sm:py-7 flex items-center justify-between gap-4">
        {/* Brand identity with Hamburger menu before logo */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-2 -ml-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {config.logo ? (
            <img
              src={config.logo}
              alt={config.name}
              className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0 border border-white/20 bg-white"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm border border-white/10 font-display select-none"
              style={{
                backgroundColor: config.accent,
                color: '#1a1a1a',
              }}
            >
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight font-display leading-tight line-clamp-2">
              {config.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            id="wishlistBtn"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors font-semibold text-sm sm:text-base relative"
            aria-label={`View wishlist with ${wishlistCount} items`}
          >
            <Heart className="w-5 h-5 text-rose-300 fill-rose-300/30" />
            {wishlistCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            id="cartBtn"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors font-semibold text-sm sm:text-base relative"
            aria-label={`View shopping cart with ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs font-black bg-white text-black shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

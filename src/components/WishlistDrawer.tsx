import React from 'react';
import { X, Trash2, ShoppingBag, Heart } from 'lucide-react';
import { StoreConfig, Product } from '../types';
import { formatMoney, getProductImage } from '../utils/helpers';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: Set<string | number>;
  config: StoreConfig;
  onRemoveWishlist: (id: string | number) => void;
  onAddToCart: (id: string | number) => void;
  onOpenProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  config,
  onRemoveWishlist,
  onAddToCart,
  onOpenProduct,
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = config.products.filter((p) => wishlistIds.has(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#16231f] shadow-2xl flex flex-col border-l border-gray-200 dark:border-[#263631]">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>My Wishlist ({wishlistedProducts.length})</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {wishlistedProducts.length > 0 ? (
              wishlistedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#101b17] border border-gray-200 dark:border-gray-800"
                >
                  <div
                    onClick={() => {
                      onOpenProduct(product);
                      onClose();
                    }}
                    className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    <img src={getProductImage(product, 0)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div
                    onClick={() => {
                      onOpenProduct(product);
                      onClose();
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {product.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      SKU: {product.sku}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-display block mt-1">
                      {formatMoney(product.price, config.currency)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(product.id);
                        onRemoveWishlist(product.id);
                      }}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95"
                      title="Move to Cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveWishlist(product.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Tap the heart icon on any product card while browsing to save items here for later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

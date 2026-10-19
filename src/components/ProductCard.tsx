import React from 'react';
import { Plus, Check, Heart } from 'lucide-react';
import { Product, StoreConfig } from '../types';
import { formatMoney, getProductImage } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  config: StoreConfig;
  cartQuantity: number;
  isWishlisted: boolean;
  onAddToCart: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  config,
  cartQuantity,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onOpenDetails,
}) => {
  const imgSrc = getProductImage(product, 0);
  const isOutOfStock = product.inStock === false;
  const hasDiscount = !isOutOfStock && product.mrp && product.mrp > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100)
    : 0;

  return (
    <article className="group bg-white dark:bg-[#16231f] border border-gray-200 dark:border-[#263631] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-[#364942] animate-card-entrance relative">
      {/* Wishlist Heart Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product.id);
        }}
        className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-white transition-transform active:scale-90 shadow-sm"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600 dark:text-gray-300'}`} />
      </button>

      {/* Clickable Image & Title Area */}
      <div
        onClick={() => onOpenDetails(product)}
        className="cursor-pointer flex-1 flex flex-col"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDetails(product);
          }
        }}
        aria-label={`View details for ${product.name}`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getProductImage({
                ...product,
                img: '',
                images: [],
              }, 0);
            }}
          />



          {/* Green dot (In stock) or Red dot (Out of stock) */}
          <div 
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/75 backdrop-blur-md flex items-center justify-center shadow-xs"
            title={isOutOfStock ? 'Out of stock' : 'In stock'}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOutOfStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
              }`}
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col flex-1">
          {product.cat && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
              {product.cat}
            </span>
          )}

          <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>

          {product.sku && (
            <span className="mt-0.5 text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400">
              SKU: {product.sku}
            </span>
          )}

          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {product.desc}
          </p>

          <div className="mt-auto pt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900 dark:text-white font-display">
              {formatMoney(product.price, config.currency)}
            </span>
            {/* Hide MRP if out of stock (red dot) */}
            {hasDiscount && (
              <s className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                {formatMoney(product.mrp, config.currency)}
              </s>
            )}
            {hasDiscount && (
              <span className="ml-auto text-[11px] font-bold text-amber-600 dark:text-amber-400">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add To Cart button bar */}
      <div className="p-3 pt-0">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) onAddToCart(product.id);
          }}
          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all duration-150 border active:scale-95 ${
            isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-300 text-gray-400' : ''
          }`}
          style={{
            borderColor: isOutOfStock ? undefined : config.brand,
            color: isOutOfStock ? undefined : config.brand,
            backgroundColor: cartQuantity > 0 && !isOutOfStock ? 'rgba(23, 63, 53, 0.08)' : undefined,
          }}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : cartQuantity > 0 ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>In Cart ({cartQuantity})</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add to cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};

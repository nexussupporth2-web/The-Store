import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Star, Share2, MessageSquare } from 'lucide-react';
import { Product, StoreConfig, ProductReview } from '../types';
import { formatMoney, getProductImage } from '../utils/helpers';

interface ProductModalProps {
  product: Product | null;
  config: StoreConfig;
  cartQuantity: number;
  onClose: () => void;
  onAddToCart: (id: string | number, quantity?: number) => void;
  onUpdateProduct: (productId: string | number, updates: Partial<Product>) => void;
  onToast: (msg: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  config,
  onClose,
  onAddToCart,
  onUpdateProduct,
  onToast,
}) => {
  const [selectedQty, setSelectedQty] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setSelectedQty(1);
    setActiveImgIndex(0);
    setReviewerName('');
    setRating(5);
    setComment('');
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const isOutOfStock = product.inStock === false;
  const hasDiscount = !isOutOfStock && product.mrp && product.mrp > product.price;
  const savings = hasDiscount ? product.mrp! - product.price : 0;
  const discountPercent = hasDiscount
    ? Math.round((savings / product.mrp!) * 100)
    : 0;

  const imagesList = product.images && product.images.filter(Boolean).length > 0
    ? product.images.filter(Boolean)
    : [product.img].filter(Boolean);

  const currentImgSrc = getProductImage(product, activeImgIndex);

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product.id, selectedQty);
    onClose();
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} - ${formatMoney(product.price, config.currency)} on ${config.name}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }
    navigator.clipboard.writeText(`${shareData.text} \n ${shareData.url}`);
    onToast('Product link copied to clipboard!');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      onToast('Please enter your name and comment');
      return;
    }
    const newReview: ProductReview = {
      id: Math.random().toString(36).substring(2, 9),
      name: reviewerName.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updatedReviews = [newReview, ...(product.reviews || [])];
    onUpdateProduct(product.id, { reviews: updatedReviews });
    setReviewerName('');
    setComment('');
    onToast('Review submitted successfully!');
  };

  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#16231f] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col border border-gray-200 dark:border-[#263631] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Main Image with close button & SKU at bottom */}
        <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <img
            src={currentImgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="absolute top-3.5 right-14 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            aria-label="Share product"
            title="Share product"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {product.cat && (
            <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
              {product.cat}
            </span>
          )}

          {/* SKU badge at the bottom of the image */}
          {product.sku && (
            <span className="absolute bottom-3.5 left-3.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-black/75 text-white backdrop-blur-md">
              SKU: {product.sku}
            </span>
          )}
        </div>

        {/* Thumbnail gallery if multiple images */}
        {imagesList.length > 1 && (
          <div className="flex gap-2 p-3 bg-gray-50 dark:bg-[#101b17] border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                  activeImgIndex === idx ? 'border-emerald-600 scale-105 shadow-sm' : 'border-transparent opacity-75'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Scrollable details */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2
                id="product-modal-title"
                className="text-xl md:text-2xl font-bold font-display text-gray-900 dark:text-gray-100"
              >
                {product.name}
              </h2>
              {/* Stock Dot Badge */}
              <div 
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"
                title={isOutOfStock ? 'Out of stock' : 'In stock'}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
              </div>
            </div>

            {/* Price section (MRP hidden if out of stock) */}
            <div className="mt-2 flex items-center gap-2.5 flex-wrap">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">
                {formatMoney(product.price, config.currency)}
              </span>
              {hasDiscount && (
                <>
                  <s className="text-sm text-gray-400 dark:text-gray-500">
                    {formatMoney(product.mrp, config.currency)}
                  </s>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    Save {formatMoney(savings, config.currency)} ({discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>

            {avgRating && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{avgRating} ({product.reviews?.length} reviews)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#0e1815] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
            {product.desc || 'Handcrafted with natural materials and timeless artisanal techniques.'}
          </div>

          {/* Quantity selector */}
          {!isOutOfStock && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Quantity
              </span>
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#16231f] flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-xs hover:bg-gray-50 disabled:opacity-40"
                  disabled={selectedQty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-gray-800 dark:text-gray-100">
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#16231f] flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-xs hover:bg-gray-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Customer Reviews & Ratings</span>
            </h3>

            {/* Review Form */}
            <form onSubmit={handleAddReview} className="space-y-2.5 bg-gray-50 dark:bg-[#0e1815] p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rate this product</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 focus:outline-hidden"
                    >
                      <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Your Name..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f]"
              />

              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a short review..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] resize-none"
              />

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
              >
                Post Review
              </button>
            </form>

            {/* Review List */}
            <div className="space-y-2">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-gray-50/75 dark:bg-[#101b17] border border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{r.name}</span>
                      <span className="text-[10px] text-gray-400">{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-600'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">No reviews yet. Be the first to write one!</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex flex-col gap-2 mt-auto">
            <button
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
                isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''
              }`}
              style={{
                backgroundColor: isOutOfStock ? undefined : config.brand,
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isOutOfStock ? 'Out of Stock' : `Add ${selectedQty} to cart • ${formatMoney(product.price * selectedQty, config.currency)}`}
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

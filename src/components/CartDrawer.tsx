import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Send, Copy, Check, Truck, ArrowRight } from 'lucide-react';
import { StoreConfig, CartState, OrderCustomerInfo } from '../types';
import { formatMoney, getProductImage } from '../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartState;
  config: StoreConfig;
  onUpdateQuantity: (productId: string | number, delta: number) => void;
  onRemoveItem: (productId: string | number) => void;
  onClearCart: () => void;
  customerInfo: OrderCustomerInfo;
  onUpdateCustomerInfo: (info: Partial<OrderCustomerInfo>) => void;
  onToast: (msg: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  config,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  customerInfo,
  onUpdateCustomerInfo,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute item details
  const items = Object.entries(cart)
    .map(([id, quantity]) => {
      const product = config.products.find((p) => String(p.id) === String(id));
      return { product, quantity, id };
    })
    .filter((item): item is { product: NonNullable<typeof item.product>; quantity: number; id: string } =>
      Boolean(item.product && item.quantity > 0)
    );

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal === 0 || subtotal >= config.freeAbove;
  const deliveryFee = isFreeDelivery ? 0 : config.shipFee;
  const grandTotal = subtotal + deliveryFee;

  const freeDeliveryProgress = Math.min(100, (subtotal / config.freeAbove) * 100);
  const amountNeededForFree = Math.max(0, config.freeAbove - subtotal);

  const formatOrderMessage = (): string => {
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const lines = items.map(
      (item) => `${item.quantity} x ${item.product.name} [SKU: ${item.product.sku || 'N/A'}] - ${formatMoney(item.product.price * item.quantity, config.currency)}`
    );
    return [
      `*New Order for ${config.name}*`,
      '--------------------------------',
      ...lines,
      '--------------------------------',
      `*Total Items Count:* ${totalItemsCount}`,
      `*Subtotal:* ${formatMoney(subtotal, config.currency)}`,
      `*Delivery:* ${deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee, config.currency)}`,
      `*Total to Pay:* ${formatMoney(grandTotal, config.currency)}`,
      '',
      `*Customer Delivery Details:*`,
      `Full Name: ${customerInfo.name.trim()}`,
      `Mobile Number: ${customerInfo.phone.trim()}`,
      `Delivery Address: ${customerInfo.address.trim()}`,
      '',
      `_Sent via ${config.name} Storefront_`
    ].join('\n');
  };

  const handleSendWhatsApp = () => {
    if (!customerInfo.name.trim()) {
      onToast('Please enter your full name');
      return;
    }
    if (!customerInfo.phone.trim()) {
      onToast('Please enter your mobile phone number');
      return;
    }
    if (!customerInfo.address.trim()) {
      onToast('Please enter your delivery address');
      return;
    }

    const cleanNumber = config.whatsapp.replace(/\D/g, '');
    const message = formatOrderMessage();
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onToast('Opening WhatsApp with your order...');
  };

  const handleCopyOrder = () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      onToast('Fill in your name, mobile, and address first');
      return;
    }
    const message = formatOrderMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    onToast('Order details copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-md bg-white dark:bg-[#16231f] shadow-2xl flex flex-col border-l border-gray-200 dark:border-[#263631] animate-in slide-in-from-right duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#263631]">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-gray-900 dark:text-gray-100">
                Your Cart
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100 dark:divide-gray-800">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                  Your cart is empty
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Browse our handcrafted collection and discover items you love.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm"
                  style={{ backgroundColor: config.brand }}
                >
                  <span>Start browsing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Free delivery tracker */}
                <div className="pb-4">
                  <div className="bg-emerald-50 dark:bg-[#0e1815] p-3 rounded-xl border border-emerald-100 dark:border-emerald-950/60">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1.5">
                      <span>
                        {isFreeDelivery
                          ? '🎉 You unlocked Free Delivery!'
                          : `Add ${formatMoney(amountNeededForFree, config.currency)} more for free delivery`}
                      </span>
                      <span>{Math.round(freeDeliveryProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-200/60 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                        style={{ width: `${freeDeliveryProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="py-3 space-y-3.5">
                  {items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-[#101b17] p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/80"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                          {product.name}
                        </h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatMoney(product.price, config.currency)} each
                        </div>
                        <button
                          onClick={() => onRemoveItem(product.id)}
                          className="mt-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 font-medium transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 bg-white dark:bg-[#16231f] border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center font-bold text-xs text-gray-900 dark:text-gray-100">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Delivery */}
                <div className="py-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatMoney(subtotal, config.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery</span>
                    <span className={`font-semibold ${deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>
                      {deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee, config.currency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                    <span>Total to pay</span>
                    <span className="font-display text-lg">
                      {formatMoney(grandTotal, config.currency)}
                    </span>
                  </div>
                </div>

                {/* Customer Checkout Details Form */}
                <div className="pt-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Delivery Details
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="cn"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Priya Sharma"
                      value={customerInfo.name}
                      onChange={(e) => onUpdateCustomerInfo({ name: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2"
                      style={{ outlineColor: config.accent }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <input
                      id="cp"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="e.g. 98765 43210"
                      value={customerInfo.phone}
                      onChange={(e) => onUpdateCustomerInfo({ phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2"
                      style={{ outlineColor: config.accent }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      id="ca"
                      rows={3}
                      autoComplete="street-address"
                      placeholder="House/Flat, Street, Landmark, City, Pincode"
                      value={customerInfo.address}
                      onChange={(e) => onUpdateCustomerInfo({ address: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 resize-none"
                      style={{ outlineColor: config.accent }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-200 dark:border-[#263631] bg-gray-50 dark:bg-[#121c18] space-y-2">
              <button
                type="button"
                id="order"
                onClick={handleSendWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                style={{ backgroundColor: config.brand }}
              >
                <Send className="w-4 h-4" />
                <span>Send order on WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyOrder}
                  className="flex-1 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy order text'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClearCart}
                  className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/40 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  Clear cart
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

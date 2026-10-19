import React, { useState } from 'react';
import { StoreConfig, Product } from '../types';
import { formatMoney, getProductImage } from '../utils/helpers';
import { Truck, Mail, Phone, MapPin, Clock, ShieldCheck, FileText, Package, Search, CheckCircle, ArrowLeft } from 'lucide-react';

interface PolicyAndPagesProps {
  view: 'all-products' | 'track-orders' | 'contact' | 'shipping-policy' | 'refund-policy' | 'terms';
  config: StoreConfig;
  onNavigateHome: () => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (id: string | number) => void;
  onToast: (msg: string) => void;
}

export const PolicyAndPages: React.FC<PolicyAndPagesProps> = ({
  view,
  config,
  onNavigateHome,
  onOpenProduct,
  onAddToCart,
  onToast,
}) => {
  // Track orders state
  const [orderQuery, setOrderQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // All products search/cat state
  const [prodSearch, setProdSearch] = useState('');

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderQuery.trim().toUpperCase();
    if (!query) {
      onToast('Please enter an Order ID, mobile number, or SKU');
      return;
    }

    // Check if query matches any product SKU in config.products
    const matchedProduct = config.products.find(
      (p) => p.sku && p.sku.toUpperCase() === query
    );

    const items = matchedProduct ? [matchedProduct] : config.products.slice(0, 2);
    const trackingId = matchedProduct ? `SKU-${matchedProduct.sku}` : query;

    setTrackedOrder({
      id: trackingId,
      status: 'Out for Delivery',
      date: 'Oct 17, 2026',
      items: items,
      total: formatMoney(matchedProduct ? matchedProduct.price : 948, config.currency),
      address: config.address,
      matchedSku: matchedProduct ? matchedProduct.sku : null,
    });
    onToast('Order status fetched successfully');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) {
      onToast('Please fill in your name and message');
      return;
    }
    setContactSubmitted(true);
    onToast('Message sent successfully! We will get back soon.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to Home Button */}
      <button
        onClick={onNavigateHome}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* 1. All Products View */}
      {view === 'all-products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-gray-100">
                All Products Catalog
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Explore our complete collection of handcrafted essentials.
              </p>
            </div>
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="search"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Search catalog or SKU..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {config.products
              .filter((p) => {
                const q = prodSearch.toLowerCase();
                return (
                  !q ||
                  p.name.toLowerCase().includes(q) ||
                  (p.sku && p.sku.toLowerCase().includes(q)) ||
                  (p.cat && p.cat.toLowerCase().includes(q))
                );
              })
              .map((product) => (
                <div
                  key={product.id}
                  onClick={() => onOpenProduct(product)}
                  className="bg-white dark:bg-[#16231f] border border-gray-200 dark:border-[#263631] rounded-2xl overflow-hidden cursor-pointer group hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img
                      src={getProductImage(product, 0)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.sku && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-white">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {product.name}
                    </h3>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="font-bold text-sm font-display text-gray-900 dark:text-white">
                        {formatMoney(product.price, config.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 2. Track Orders View */}
      {view === 'track-orders' && (
        <div className="bg-white dark:bg-[#16231f] border border-gray-200 dark:border-[#263631] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Truck className="w-6 h-6 text-emerald-600" />
              <span>Track Your Order</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter your Product SKU (e.g. DIYA94), Order ID, or mobile number to track shipment status.
            </p>
          </div>

          <form onSubmit={handleTrackOrder} className="flex gap-2">
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Enter SKU (e.g. DIYA94), Order ID, or Mobile No..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815] text-sm text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: config.brand }}
            >
              Track
            </button>
          </form>

          {trackedOrder && (
            <div className="mt-6 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/40 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                    Order ID: {trackedOrder.id}
                  </span>
                  <span className="text-xs text-gray-500">Placed on {trackedOrder.date}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  {trackedOrder.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Items in Shipment
                </h4>
                <div className="space-y-2">
                  {trackedOrder.items.map((item: Product) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <img src={getProductImage(item, 0)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</span>
                        <span className="text-xs text-gray-500 block">SKU: {item.sku}</span>
                      </div>
                      <span className="font-bold">{formatMoney(item.price, config.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-emerald-200 dark:border-emerald-900/40">
                <b>Delivery Address:</b> {trackedOrder.address}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Contact Us View */}
      {view === 'contact' && (
        <div className="bg-white dark:bg-[#16231f] border border-gray-200 dark:border-[#263631] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Mail className="w-6 h-6 text-emerald-600" />
              <span>Contact Us</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              We would love to hear from you. Reach out via phone, email, WhatsApp, or send us a message below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#101b17] border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Us</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{config.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#101b17] border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Email Us</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{config.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#101b17] border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Visit Store</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{config.address}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#101b17] border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Hours</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{config.hours}</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleContactSubmit} className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 font-display">
              Send a Message
            </h3>

            {contactSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Thank you! Your message has been sent successfully.</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Email or Phone
                    </label>
                    <input
                      type="text"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="How can we help you today?"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl font-bold text-sm text-white shadow-sm transition-transform active:scale-95"
                  style={{ backgroundColor: config.brand }}
                >
                  Send Message
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {/* 4. Shipping Policy */}
      {view === 'shipping-policy' && (
        <div className="bg-white dark:bg-[#16231f] border border-gray-200 dark:border-[#263631] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            <span>Shipping & Delivery Policy</span>
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>
              At <b>{config.name}</b>, we take utmost care in packing and shipping your artisanal items safely to your doorstep.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><b>Processing Time:</b> Orders are processed and dispatched within 24 to 48 hours of confirmation.</li>
              <li><b>Delivery Timeline:</b> Standard delivery typically takes 3 to 7 business days depending on your location.</li>
              <li><b>Shipping Charges:</b> We charge a standard delivery fee of {formatMoney(config.shipFee, config.currency)} for orders below {formatMoney(config.freeAbove, config.currency)}.</li>
              <li><b>Free Delivery:</b> Enjoy <b>FREE delivery</b> on all orders above {formatMoney(config.freeAbove, config.currency)}.</li>
              <li><b>Tracking:</b> Once dispatched, tracking updates are shared directly via WhatsApp or SMS.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 5. Refund Policy */}
      {view === 'refund-policy' && (
        <div className="bg-white dark:bg-[#16231f] border border-gray-200 dark:border-[#263631] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Refund & Return Policy</span>
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>
              We want you to love what you buy from <b>{config.name}</b>. If you receive a damaged, defective, or incorrect item, we offer a hassle-free return and replacement policy.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><b>Return Window:</b> Return or replacement requests must be raised within 7 days of delivery.</li>
              <li><b>Condition:</b> Items must be unused, in their original packaging with tags intact.</li>
              <li><b>Damaged Items:</b> Please share an unboxing video or photo of damaged items via WhatsApp within 48 hours for instant processing.</li>
              <li><b>Refunds:</b> Once inspected and approved, refunds are processed to your original payment method within 5 to 7 business days.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 6. Terms of Order */}
      {view === 'terms' && (
        <div className="bg-white dark:bg-[#16231f] border border-gray-200 dark:border-[#263631] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Terms of Order</span>
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>
              By placing an order with <b>{config.name}</b> via our storefront and WhatsApp checkout, you agree to the following terms and conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><b>Order Acceptance:</b> All orders placed are subject to product availability and price verification.</li>
              <li><b>Pricing:</b> Prices are quoted in {config.currency} and are inclusive of applicable taxes unless specified otherwise.</li>
              <li><b>WhatsApp Checkout:</b> Orders are confirmed once verified and submitted through our secure WhatsApp ordering channel.</li>
              <li><b>Handcrafted Variance:</b> As many of our items are handmade or artisanal, slight variations in color, finish, and texture are natural and add to their unique charm.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

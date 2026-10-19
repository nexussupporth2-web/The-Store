import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StoreConfig, CartState, Product, OrderCustomerInfo } from './types';
import { loadConfig, saveConfig } from './utils/helpers';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryChips } from './components/CategoryChips';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { RecentHistory } from './components/RecentHistory';
import { StoreDesigner } from './components/StoreDesigner';
import { LockModal } from './components/LockModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { NavigationDrawer } from './components/NavigationDrawer';
import { PolicyAndPages } from './components/PolicyAndPages';

type AppView = 'home' | 'all-products' | 'track-orders' | 'contact' | 'shipping-policy' | 'refund-policy' | 'terms';

export default function App() {
  const [config, setConfig] = useState<StoreConfig>(() => loadConfig());
  const [cart, setCart] = useState<CartState>({});
  
  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string | number>>(() => {
    try {
      const raw = localStorage.getItem('store_wishlist');
      if (raw) {
        return new Set(JSON.parse(raw));
      }
    } catch {}
    return new Set();
  });

  // Recent views state
  const [recentIds, setRecentIds] = useState<Array<string | number>>(() => {
    try {
      const raw = localStorage.getItem('store_recent');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  });

  const [customerInfo, setCustomerInfo] = useState<OrderCustomerInfo>({
    name: '',
    phone: '',
    address: '',
  });

  const [activeView, setActiveView] = useState<AppView>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers state
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('store_wishlist', JSON.stringify(Array.from(wishlist)));
    } catch {}
  }, [wishlist]);

  // Save recent views to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('store_recent', JSON.stringify(recentIds));
    } catch {}
  }, [recentIds]);

  // Block right-click globally
  useEffect(() => {
    const handleContext = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContext);
    return () => window.removeEventListener('contextmenu', handleContext);
  }, []);

  // Track product view for recent history
  const handleOpenProduct = (product: Product) => {
    setActiveProduct(product);
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => String(id) !== String(product.id));
      return [product.id, ...filtered].slice(0, 4);
    });
  };

  const toggleWishlist = useCallback((id: string | number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from wishlist');
      } else {
        next.add(id);
        showToast('Added to wishlist');
      }
      return next;
    });
  }, []);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Sync with Firestore real-time on mount
  useEffect(() => {
    const storeRef = doc(db, 'stores', 'main');

    const unsubscribe = onSnapshot(
      storeRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as Partial<StoreConfig>;
          if (remoteData && remoteData.name) {
            const heroTitle = remoteData.heroTitle === 'Beautiful finds for every occasion.' || !remoteData.heroTitle
              ? 'Beautiful inventory for every occasion.'
              : remoteData.heroTitle;

            setConfig((prev) => {
              const merged = {
                ...prev,
                ...remoteData,
                heroTitle,
                products: Array.isArray(remoteData.products) && remoteData.products.length > 0
                  ? remoteData.products
                  : prev.products,
              };
              saveConfig(merged);
              return merged;
            });
          }
        } else {
          setDoc(storeRef, config).catch((err) =>
            console.warn('Could not initialize store doc in Firestore:', err)
          );
        }
      },
      (error) => {
        console.warn('Firestore snapshot error (using local storage fallback):', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync document title and CSS variables with config
  useEffect(() => {
    document.title = config.name;
    const root = document.documentElement;
    root.style.setProperty('--brand', config.brand);
    root.style.setProperty('--accent', config.accent);
  }, [config.brand, config.accent, config.name]);

  // Save config changes to localStorage AND push to Firestore cloud database
  const handleUpdateConfig = useCallback((newConfig: StoreConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);

    const storeRef = doc(db, 'stores', 'main');
    setDoc(storeRef, newConfig).catch((err) => {
      console.error('Failed to sync config to Firestore:', err);
      showToast('Saved locally (Cloud sync pending)');
    });
  }, [showToast]);

  const handleUpdateProduct = useCallback((productId: string | number, updates: Partial<Product>) => {
    const updatedProducts = config.products.map((p) => (p.id === productId ? { ...p, ...updates } : p));
    const nextConfig = { ...config, products: updatedProducts };
    handleUpdateConfig(nextConfig);
    if (activeProduct && activeProduct.id === productId) {
      setActiveProduct({ ...activeProduct, ...updates });
    }
  }, [config, handleUpdateConfig, activeProduct]);

  // Clean invalid products from cart if removed
  useEffect(() => {
    const validIds = new Set(config.products.map((p) => String(p.id)));
    setCart((prev) => {
      let changed = false;
      const next: CartState = {};
      Object.entries(prev).forEach(([id, qty]) => {
        if (validIds.has(id)) {
          next[id] = qty;
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [config.products]);

  // Cart operations
  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, q) => sum + q, 0);
  }, [cart]);

  const handleAddToCart = useCallback((id: string | number, quantity: number = 1) => {
    const key = String(id);
    setCart((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + quantity,
    }));
    showToast('Added to cart');
  }, [showToast]);

  const handleUpdateQuantity = useCallback((id: string | number, delta: number) => {
    const key = String(id);
    setCart((prev) => {
      const current = prev[key] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: next };
    });
  }, []);

  const handleRemoveFromCart = useCallback((id: string | number) => {
    const key = String(id);
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    showToast('Removed from cart');
  }, [showToast]);

  const handleClearCart = useCallback(() => {
    setCart({});
    showToast('Cart cleared');
  }, [showToast]);

  // Designer access logic
  const handleOpenDesigner = () => {
    if (isUnlocked) {
      setIsDesignerOpen(true);
    } else {
      setIsLockModalOpen(true);
    }
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    setIsDesignerOpen(true);
    showToast('Designer unlocked');
  };

  // Filtered products for home view
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return config.products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.cat === selectedCategory;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        String(p.id).toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.cat && p.cat.toLowerCase().includes(q)) ||
        (p.desc && p.desc.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [config.products, selectedCategory, searchQuery]);

  const recentProducts = useMemo(() => {
    return recentIds
      .map((id) => config.products.find((p) => String(p.id) === String(id)))
      .filter(Boolean) as Product[];
  }, [recentIds, config.products]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      {/* Sticky Header */}
      <Header
        config={config}
        cartCount={cartCount}
        wishlistCount={wishlist.size}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Render based on activeView */}
      {activeView === 'home' ? (
        <>
          <Hero
            config={config}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultCount={filteredProducts.length}
          />

          <main className="flex-1 max-w-6xl w-full mx-auto px-4">
            <CategoryChips
              config={config}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 py-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    config={config}
                    cartQuantity={cart[String(product.id)] || 0}
                    isWishlisted={wishlist.has(product.id)}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={toggleWishlist}
                    onOpenDetails={handleOpenProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <span className="text-2xl font-bold font-display">∅</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No products match "${searchQuery}". Try a different keyword or reset filters.`
                    : 'No products in this category yet.'}
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
                    >
                      Clear search
                    </button>
                  )}
                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                      style={{ backgroundColor: config.brand }}
                    >
                      View all products
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Recent Item History Section */}
            <RecentHistory
              recentProducts={recentProducts}
              config={config}
              onOpenProduct={handleOpenProduct}
              onAddToCart={handleAddToCart}
            />
          </main>
        </>
      ) : (
        <main className="flex-1">
          <PolicyAndPages
            view={activeView as any}
            config={config}
            onNavigateHome={() => setActiveView('home')}
            onOpenProduct={handleOpenProduct}
            onAddToCart={handleAddToCart}
            onToast={showToast}
          />
        </main>
      )}

      {/* Footer */}
      <Footer
        config={config}
        onSecretHold={() => setIsLockModalOpen(true)}
        onOpenDesigner={handleOpenDesigner}
        isUnlocked={isUnlocked}
      />

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        config={config}
        onNavigate={(view) => setActiveView(view)}
        activeView={activeView}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={activeProduct}
        config={config}
        cartQuantity={activeProduct ? cart[String(activeProduct.id)] || 0 : 0}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
        onUpdateProduct={handleUpdateProduct}
        onToast={showToast}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        config={config}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        customerInfo={customerInfo}
        onUpdateCustomerInfo={(updates) => setCustomerInfo((prev) => ({ ...prev, ...updates }))}
        onToast={showToast}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        config={config}
        onRemoveWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onOpenProduct={handleOpenProduct}
      />

      {/* Store Designer Slide-Over */}
      <StoreDesigner
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onToast={showToast}
      />

      {/* Lock Password Modal */}
      <LockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        config={config}
        onUnlockSuccess={handleUnlockSuccess}
      />

      {/* Toast notifications */}
      <Toast message={toastMessage} />
    </div>
  );
}

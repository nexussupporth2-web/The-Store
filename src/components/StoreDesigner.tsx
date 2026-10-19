import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Palette,
  Shield,
  FileJson,
  Package,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  Download,
} from 'lucide-react';
import { StoreConfig, Product } from '../types';
import { formatMoney, resizeImage, computeSha256, generateSku, WEEKLY_THEMES, getWeeklyTheme } from '../utils/helpers';
import { DEFAULT_CONFIG } from '../utils/defaults';

interface StoreDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onUpdateConfig: (newConfig: StoreConfig) => void;
  onToast: (msg: string) => void;
}

export const StoreDesigner: React.FC<StoreDesignerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onToast,
}) => {
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string | number>>(new Set());
  const [expandedProductId, setExpandedProductId] = useState<string | number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);
  const [bulkDeleteArmed, setBulkDeleteArmed] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Backup / Export state
  const [showJsonIo, setShowJsonIo] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [showTsCode, setShowTsCode] = useState(false);
  const [tsCodeText, setTsCodeText] = useState('');

  // Export Defaults TS for GitHub/Vercel
  const handleExportDefaultsTs = () => {
    const code = `import { StoreConfig } from '../types';

export const DEFAULT_CONFIG: StoreConfig = ${JSON.stringify(config, null, 2)};
`;
    setTsCodeText(code);
    setShowTsCode(true);
    onToast('TypeScript code generated for src/utils/defaults.ts');
  };

  // Download complete project zip
  const handleDownloadZip = async () => {
    onToast('Preparing complete project ZIP...');
    try {
      const zip = new JSZip();
      const filesToFetch = [
        'index.html',
        'package.json',
        'vite.config.ts',
        'tsconfig.json',
        '.gitignore',
        'firebase-applet-config.json',
        'firestore.rules',
        'src/App.tsx',
        'src/main.tsx',
        'src/types.ts',
        'src/index.css',
        'src/components/CartDrawer.tsx',
        'src/components/CategoryChips.tsx',
        'src/components/Footer.tsx',
        'src/components/Header.tsx',
        'src/components/Hero.tsx',
        'src/components/LockModal.tsx',
        'src/components/NavigationDrawer.tsx',
        'src/components/PolicyAndPages.tsx',
        'src/components/ProductCard.tsx',
        'src/components/ProductModal.tsx',
        'src/components/RecentHistory.tsx',
        'src/components/StoreDesigner.tsx',
        'src/components/Toast.tsx',
        'src/components/WishlistDrawer.tsx',
        'src/utils/defaults.ts',
        'src/utils/firebase.ts',
        'src/utils/helpers.ts',
      ];

      for (const path of filesToFetch) {
        try {
          const res = await fetch('/' + path);
          if (res.ok) {
            const text = await res.text();
            zip.file(path, text);
          }
        } catch (e) {
          console.warn('Could not fetch', path, e);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-store-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast('Project ZIP downloaded successfully!');
    } catch (err) {
      console.error(err);
      onToast('Failed to generate ZIP');
    }
  };

  // Password generator state
  const [newPassword, setNewPassword] = useState('');
  const [generatedPwHash, setGeneratedPwHash] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filtered products for editor search by SKU or name
  const filteredProducts = config.products.filter((p) => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.cat && p.cat.toLowerCase().includes(q))
    );
  });

  // Bulk selection handlers
  const handleToggleSelect = (id: string | number) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedProductIds(next);
    setBulkDeleteArmed(false);
  };

  const handleSelectAll = () => {
    if (selectedProductIds.size === config.products.length && config.products.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(config.products.map((p) => p.id)));
    }
    setBulkDeleteArmed(false);
  };

  const handleBulkDelete = () => {
    if (!bulkDeleteArmed) {
      setBulkDeleteArmed(true);
      setTimeout(() => setBulkDeleteArmed(false), 4000);
      return;
    }
    const count = selectedProductIds.size;
    const remaining = config.products.filter((p) => !selectedProductIds.has(p.id));
    onUpdateConfig({ ...config, products: remaining });
    setSelectedProductIds(new Set());
    setBulkDeleteArmed(false);
    onToast(`${count} products removed`);
  };

  // Single product remove
  const handleRemoveProduct = (id: string | number) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3500);
      return;
    }
    const updated = config.products.filter((p) => p.id !== id);
    onUpdateConfig({ ...config, products: updated });
    setDeleteConfirmId(null);
    onToast('Product removed');
  };

  // Add Product with auto-generated 6-digit alphanumeric SKU
  const handleAddProduct = () => {
    const newId = Date.now();
    const newSku = generateSku();
    const newProduct: Product = {
      id: newId,
      sku: newSku,
      name: 'New Handcrafted Item',
      price: 299,
      mrp: 399,
      cat: 'Décor',
      desc: 'Crafted with premium materials and thoughtful details.',
      img: '',
      images: [''],
    };
    onUpdateConfig({
      ...config,
      products: [newProduct, ...config.products],
    });
    setExpandedProductId(newId);
    onToast(`New item added with SKU: ${newSku}`);
  };

  // Single product field change
  const handleUpdateProduct = (id: string | number, updates: Partial<Product>) => {
    const updated = config.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    onUpdateConfig({ ...config, products: updated });
  };

  // Logo file upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file, 160, 'image/png', 0.85);
      onUpdateConfig({ ...config, logo: resized });
      onToast('Logo updated');
    } catch {
      onToast('Failed to load logo image');
    }
  };

  // Export Settings JSON
  const handleExportJson = () => {
    const exported = JSON.stringify(
      config,
      (k, v) => (k === 'img' || k === 'logo' ? (v && v.startsWith('data:') ? '(uploaded-image)' : v) : v),
      2
    );
    setJsonText(exported);
    setShowJsonIo(true);
    onToast('Settings JSON generated');
  };

  // Import Settings
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');
      const merged: StoreConfig = {
        ...config,
        ...parsed,
        products: (parsed.products || config.products).map((p: Product) => ({
          ...p,
          sku: p.sku || generateSku(),
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.img || ''],
          img: p.img === '(uploaded-image)' ? '' : p.img,
        })),
        logo: parsed.logo === '(uploaded-image)' ? '' : (parsed.logo || config.logo),
      };
      onUpdateConfig(merged);
      onToast('Settings imported successfully!');
    } catch (err) {
      onToast('Could not read settings JSON. Check formatting.');
    }
  };

  // Password Generation
  const handleCreatePwHash = async () => {
    if (newPassword.length < 6) {
      onToast('Use at least 6 characters for the password');
      return;
    }
    const hash = await computeSha256(newPassword);
    setGeneratedPwHash(hash);
    onUpdateConfig({ ...config, pwHash: hash });
    onToast('New password hash saved!');
  };

  // Reset to default
  const handleResetStore = () => {
    if (!resetArmed) {
      setResetArmed(true);
      setTimeout(() => setResetArmed(false), 3500);
      return;
    }
    const def = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    def.products = def.products.map((p: any) => ({
      ...p,
      sku: p.sku || generateSku(),
      images: p.images || [p.img],
    }));
    onUpdateConfig(def);
    setResetArmed(false);
    onToast('Store reset to defaults');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-16">
        <aside
          className="w-screen max-w-xl bg-white dark:bg-[#16231f] shadow-2xl flex flex-col border-l border-gray-200 dark:border-[#263631] animate-in slide-in-from-right duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Store Designer"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#263631]">
            <div>
              <h2 className="text-xl font-bold font-display text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                <span>Store Designer & Catalog</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Changes sync instantly online and save in browser
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Designer Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Section 1: Brand Identity */}
            <div className="space-y-3.5 bg-gray-50 dark:bg-[#101b17] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Brand Identity</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => onUpdateConfig({ ...config, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Menu Drawer Subtitle
                </label>
                <input
                  type="text"
                  value={config.storeSubtitle || 'Artisanal Storefront'}
                  onChange={(e) => onUpdateConfig({ ...config, storeSubtitle: e.target.value })}
                  placeholder="e.g. Artisanal Storefront"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={config.heroTitle}
                  onChange={(e) => onUpdateConfig({ ...config, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Subheading & Tagline
                </label>
                <textarea
                  rows={2}
                  value={config.tagline}
                  onChange={(e) => onUpdateConfig({ ...config, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  NGO Description (Footer empowerment summary)
                </label>
                <textarea
                  rows={3}
                  value={config.ngoDescription || ''}
                  onChange={(e) => onUpdateConfig({ ...config, ngoDescription: e.target.value })}
                  placeholder="Empowering housewives and women artisans..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              {/* Logo management */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Store Logo
                </label>
                <div className="flex items-center gap-3">
                  {config.logo ? (
                    <img
                      src={config.logo}
                      alt="Logo preview"
                      className="w-12 h-12 rounded-xl object-cover border border-gray-300 dark:border-gray-700 bg-white"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg font-display"
                      style={{ backgroundColor: config.accent, color: '#1a1a1a' }}
                    >
                      {(config.name.trim()[0] || 'S').toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 flex gap-2">
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload image</span>
                    </button>
                    {config.logo && (
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ ...config, logo: '' })}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.brand}
                      onChange={(e) => onUpdateConfig({ ...config, brand: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent"
                    />
                    <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                      {config.brand}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.accent}
                      onChange={(e) => onUpdateConfig({ ...config, accent: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent"
                    />
                    <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                      {config.accent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Rotating Color Themes */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    4 Weekly Rotating Themes
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoWeeklyTheme !== false}
                      onChange={(e) => {
                        const val = e.target.checked;
                        const weekly = getWeeklyTheme();
                        onUpdateConfig({
                          ...config,
                          autoWeeklyTheme: val,
                          brand: val ? weekly.brand : config.brand,
                          accent: val ? weekly.accent : config.accent,
                        });
                        onToast(val ? 'Automatic weekly theme rotation enabled' : 'Custom colors enabled');
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Auto-rotate weekly</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEEKLY_THEMES.map((t, idx) => {
                    const currentWeekly = getWeeklyTheme();
                    const isCurrentWeek = currentWeekly.name === t.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onUpdateConfig({
                            ...config,
                            autoWeeklyTheme: false,
                            brand: t.brand,
                            accent: t.accent,
                          });
                          onToast(`Applied theme: ${t.name}`);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          config.brand === t.brand && config.accent === t.accent
                            ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 bg-white dark:bg-[#16231f]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: t.brand }} />
                          <div className="w-4 h-4 rounded-full shadow-xs -ml-2" style={{ backgroundColor: t.accent }} />
                          {isCurrentWeek && (
                            <span className="ml-auto text-[9px] font-bold px-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                          {t.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Store Info */}
            <div className="space-y-3.5 bg-gray-50 dark:bg-[#101b17] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Contact & Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={config.whatsapp}
                    onChange={(e) => onUpdateConfig({ ...config, whatsapp: e.target.value })}
                    placeholder="919999999999"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-[10px] text-gray-400">Include country code, no + sign</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Call Number
                  </label>
                  <input
                    type="tel"
                    value={config.phone}
                    onChange={(e) => onUpdateConfig({ ...config, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => onUpdateConfig({ ...config, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => onUpdateConfig({ ...config, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={config.hours}
                    onChange={(e) => onUpdateConfig({ ...config, hours: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Footer Credit Text
                  </label>
                  <input
                    type="text"
                    value={config.poweredBy}
                    onChange={(e) => onUpdateConfig({ ...config, poweredBy: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Delivery */}
            <div className="space-y-3.5 bg-gray-50 dark:bg-[#101b17] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Pricing & Delivery
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={config.currency}
                    onChange={(e) => onUpdateConfig({ ...config, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Free Above
                  </label>
                  <input
                    type="number"
                    value={config.freeAbove}
                    onChange={(e) => onUpdateConfig({ ...config, freeAbove: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Fee
                  </label>
                  <input
                    type="number"
                    value={config.shipFee}
                    onChange={(e) => onUpdateConfig({ ...config, shipFee: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Products Management & SKU Search */}
            <div className="space-y-3.5 bg-gray-50 dark:bg-[#101b17] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Products ({config.products.length})</span>
                </h3>

                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                  style={{ backgroundColor: config.brand }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* SKU / Item Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search item by SKU ID or name..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Bulk actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {selectedProductIds.size > 0 && selectedProductIds.size === config.products.length
                    ? 'Clear selection'
                    : 'Select all'}
                </button>

                <button
                  type="button"
                  disabled={selectedProductIds.size === 0}
                  onClick={handleBulkDelete}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    bulkDeleteArmed
                      ? 'bg-red-600 text-white font-bold animate-pulse'
                      : 'border border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40'
                  }`}
                >
                  {bulkDeleteArmed
                    ? `Tap again to remove ${selectedProductIds.size}`
                    : `Remove selected (${selectedProductIds.size})`}
                </button>
              </div>

              {/* Product Accordion List */}
              <div className="space-y-2 pt-2">
                {filteredProducts.map((product) => {
                  const isExpanded = expandedProductId === product.id;
                  const isSelected = selectedProductIds.has(product.id);
                  const isArmedForDelete = deleteConfirmId === product.id;
                  const currentImages = product.images && product.images.length > 0 ? product.images : [product.img || ''];

                  return (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-[#16231f] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-shadow"
                    >
                      {/* Accordion header */}
                      <div className="p-3 flex items-center gap-2.5 hover:bg-gray-50/75 dark:hover:bg-gray-800/40">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(product.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                        />

                        <div
                          onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                          className="flex-1 min-w-0 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate block">
                                {product.name || 'Untitled Product'}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                                SKU: {product.sku || '------'}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-display ml-2">
                            {formatMoney(product.price, config.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Accordion content */}
                      {isExpanded && (
                        <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 space-y-3.5 bg-gray-50/50 dark:bg-black/10">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              SKU ID (Editable - enter your predefined SKU or generate new)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={product.sku || ''}
                                onChange={(e) => handleUpdateProduct(product.id, { sku: e.target.value.toUpperCase() })}
                                placeholder="e.g. A3F9K2"
                                maxLength={10}
                                className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newSku = generateSku();
                                  handleUpdateProduct(product.id, { sku: newSku });
                                  onToast(`Generated SKU: ${newSku}`);
                                }}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-200"
                              >
                                Regenerate
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => handleUpdateProduct(product.id, { name: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Price ({config.currency})
                              </label>
                              <input
                                type="number"
                                value={product.price}
                                onChange={(e) =>
                                  handleUpdateProduct(product.id, { price: Number(e.target.value) || 0 })
                                }
                                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Old Price / MRP (optional)
                              </label>
                              <input
                                type="number"
                                value={product.mrp || ''}
                                onChange={(e) =>
                                  handleUpdateProduct(product.id, { mrp: Number(e.target.value) || 0 })
                                }
                                placeholder="e.g. 499"
                                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f]"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Category
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newCat = prompt('Enter new category name:');
                                  if (newCat && newCat.trim()) {
                                    handleUpdateProduct(product.id, { cat: newCat.trim() });
                                    onToast(`Category "${newCat.trim()}" created`);
                                  }
                                }}
                                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Create new category</span>
                              </button>
                            </div>
                            <select
                              value={product.cat}
                              onChange={(e) => handleUpdateProduct(product.id, { cat: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] text-gray-900 dark:text-gray-100"
                            >
                              {Array.from(new Set([...config.products.map(p => p.cat).filter(Boolean), 'Spiritual', 'Décor', 'Gifts'])).map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div className="pt-2">
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={product.inStock !== false}
                                  onChange={(e) => handleUpdateProduct(product.id, { inStock: e.target.checked })}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span>In Stock (Green Dot) &bull; Unchecked = Out of Stock (Red Dot & Hide MRP)</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={product.desc}
                              onChange={(e) => handleUpdateProduct(product.id, { desc: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f] resize-none"
                            />
                          </div>

                          {/* 1 to 4 Images management */}
                          <div className="space-y-2 pt-1 border-t border-gray-200 dark:border-gray-800">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                              Product Images (Min 1 to Max 4) via Google Drive link or Bulk Upload
                            </label>
                            {[0, 1, 2, 3].map((imgIdx) => {
                              const url = currentImages[imgIdx] || '';
                              return (
                                <div key={imgIdx} className="flex items-center gap-2 bg-white dark:bg-[#16231f] p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <span className="text-[11px] font-bold text-gray-400 w-12 flex-shrink-0">
                                    Img #{imgIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={url && !url.startsWith('data:') ? url : ''}
                                    onChange={(e) => {
                                      const next = [...currentImages];
                                      next[imgIdx] = e.target.value;
                                      handleUpdateProduct(product.id, {
                                        images: next,
                                        img: imgIdx === 0 ? e.target.value : product.img,
                                      });
                                    }}
                                    placeholder="Paste Google Drive link or image URL"
                                    className="flex-1 px-2.5 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815]"
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-2 flex items-center justify-between gap-2">
                            {/* Single upload button for 1 to 4 images in one shot */}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              id={`bulk-upload-${product.id}`}
                              className="hidden"
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || []).slice(0, 4);
                                if (files.length === 0) return;
                                try {
                                  const resizedPromises = files.map(f => resizeImage(f, 600, 'image/jpeg', 0.82));
                                  const resizedResults = await Promise.all(resizedPromises);
                                  const nextImages = [...currentImages];
                                  resizedResults.forEach((resImg, idx) => {
                                    if (idx < 4) {
                                      nextImages[idx] = resImg;
                                    }
                                  });
                                  handleUpdateProduct(product.id, {
                                    images: nextImages,
                                    img: nextImages[0] || product.img,
                                  });
                                  onToast(`Successfully uploaded ${resizedResults.length} image(s)!`);
                                } catch (err) {
                                  onToast('Failed to load uploaded images');
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById(`bulk-upload-${product.id}`)?.click()}
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload 1 to 4 Images</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(product.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                                isArmedForDelete
                                  ? 'bg-red-600 text-white font-bold animate-pulse'
                                  : 'border border-red-300 text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isArmedForDelete ? 'Confirm removal' : 'Remove product'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>



            {/* Section 6: Editor Password */}
            <div className="space-y-3 bg-gray-50 dark:bg-[#101b17] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Editor Password</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Type a new password to generate a SHA-256 hash code and protect your store settings.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Admin Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16231f]"
                  />
                  <button
                    type="button"
                    onClick={handleCreatePwHash}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap"
                  >
                    Save Code
                  </button>
                </div>
              </div>

              {generatedPwHash && (
                <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-black/20 text-xs font-mono break-all text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">SHA-256 Hash:</span>
                  {generatedPwHash}
                </div>
              )}
            </div>

            {/* Section 7: Save Edits & Reset */}
            <div className="pt-4 space-y-3 pb-6">
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig(config);
                  onToast('Store edits saved successfully to online store!');
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Save Edits & Close</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZip}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-center flex items-center justify-center gap-2 transition-colors text-gray-800 dark:text-gray-200"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Download Complete Project ZIP</span>
              </button>

              <button
                type="button"
                onClick={handleResetStore}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  resetArmed
                    ? 'bg-red-600 text-white font-extrabold animate-pulse'
                    : 'border border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                }`}
              >
                {resetArmed ? 'Tap again to confirm reset to sample store' : 'Reset to sample store'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

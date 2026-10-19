import React from 'react';
import { X, Home, Package, Truck, Mail, ShieldCheck, FileText, BookOpen, ChevronRight } from 'lucide-react';
import { StoreConfig } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onNavigate: (view: 'home' | 'all-products' | 'track-orders' | 'contact' | 'shipping-policy' | 'refund-policy' | 'terms') => void;
  activeView: string;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onNavigate,
  activeView,
}) => {
  if (!isOpen) return null;

  const links = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'all-products', label: 'All Products', icon: Package },
    { id: 'track-orders', label: 'Track Orders', icon: Truck },
    { id: 'contact', label: 'Contact Us', icon: Mail },
    { id: 'shipping-policy', label: 'Shipping Policy', icon: Truck },
    { id: 'refund-policy', label: 'Refund Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Order', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <aside
          className="w-screen max-w-xs bg-white dark:bg-[#16231f] shadow-2xl flex flex-col border-r border-gray-200 dark:border-[#263631] animate-in slide-in-from-left duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          {/* Header */}
          <div
            className="p-5 flex items-center justify-between"
            style={{ backgroundColor: config.brand, color: 'var(--on-brand, #ffffff)' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {config.logo ? (
                <img src={config.logo} alt="" className="w-8 h-8 rounded-lg object-cover bg-white" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold font-display text-sm"
                  style={{ backgroundColor: config.accent, color: '#1a1a1a' }}
                >
                  {(config.name[0] || 'S').toUpperCase()}
                </div>
              )}
              <h3 className="font-bold font-display text-base truncate">{config.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as any);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 text-center">
            {config.name} &bull; {config.storeSubtitle || 'Artisanal Storefront'}
          </div>
        </aside>
      </div>
    </div>
  );
};

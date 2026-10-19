import React from 'react';
import { Search, X } from 'lucide-react';
import { StoreConfig } from '../types';

interface HeroProps {
  config: StoreConfig;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  config,
  searchQuery,
  onSearchChange,
  resultCount,
}) => {
  return (
    <section
      className="pt-8 pb-10 px-4 transition-colors duration-200"
      style={{
        backgroundColor: config.brand,
        color: 'var(--on-brand, #ffffff)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight max-w-2xl font-display leading-[1.1] mb-2.5">
          {config.heroTitle}
        </h2>
        <p className="text-white/85 text-base sm:text-lg max-w-xl font-normal leading-relaxed mb-6">
          {config.tagline}
        </p>

        {/* Search input with live clear & icon */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="q"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products or categories..."
            aria-label="Search products"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm md:text-base font-medium shadow-sm focus:outline-none focus:ring-2 border-0"
            style={{
              outlineColor: config.accent,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchQuery && (
          <p className="mt-2 text-xs text-white/75 font-medium">
            Found {resultCount} {resultCount === 1 ? 'product' : 'products'} matching &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>
    </section>
  );
};

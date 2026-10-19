import React from 'react';
import { History } from 'lucide-react';
import { Product, StoreConfig } from '../types';
import { formatMoney, getProductImage } from '../utils/helpers';

interface RecentHistoryProps {
  recentProducts: Product[];
  config: StoreConfig;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (id: string | number) => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({
  recentProducts,
  config,
  onOpenProduct,
  onAddToCart,
}) => {
  if (!recentProducts || recentProducts.length === 0) return null;

  return (
    <section className="my-10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-display text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <span>Recently Viewed Items</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {recentProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onOpenProduct(product)}
            className="bg-white dark:bg-[#16231f] border border-gray-200 dark:border-[#263631] rounded-2xl p-3 flex flex-col cursor-pointer group hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mb-2.5">
              <img
                src={getProductImage(product, 0)}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h4 className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
              {product.name}
            </h4>
            <div className="mt-auto pt-2 flex items-center justify-between">
              <span className="font-bold text-xs font-display text-gray-900 dark:text-white">
                {formatMoney(product.price, config.currency)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product.id);
                }}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

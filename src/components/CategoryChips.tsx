import React from 'react';
import { StoreConfig } from '../types';

interface CategoryChipsProps {
  config: StoreConfig;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  config,
  selectedCategory,
  onSelectCategory,
}) => {
  // Extract unique categories preserving appearance order
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    config.products.forEach((p) => {
      if (p.cat && p.cat.trim()) {
        set.add(p.cat.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [config.products]);

  // Compute count for each category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: config.products.length };
    config.products.forEach((p) => {
      const c = p.cat?.trim();
      if (c) {
        counts[c] = (counts[c] || 0) + 1;
      }
    });
    return counts;
  }, [config.products]);

  return (
    <div className="overflow-x-auto no-scrollbar py-4 -mx-4 px-4 flex items-center gap-2">
      {categories.map((cat) => {
        const isSelected = cat === selectedCategory;
        const count = categoryCounts[cat] || 0;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            aria-pressed={isSelected}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 border ${
              isSelected
                ? 'shadow-sm text-white border-transparent'
                : 'bg-white dark:bg-[#16231f] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
            style={{
              backgroundColor: isSelected ? config.brand : undefined,
              borderColor: isSelected ? config.brand : undefined,
            }}
          >
            <span>{cat}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

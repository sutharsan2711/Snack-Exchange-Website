import React from 'react';
import type { Category } from '../data/categories';


interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center group cursor-pointer focus:outline-none"
    >
      <div
        className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full text-4xl shadow-sm transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-md ${
          isSelected
            ? 'bg-primary/10 border-2 border-primary scale-105 ring-4 ring-primary/5'
            : 'bg-white border border-slate-100 hover:border-slate-200'
        }`}
      >
        <span className="transform group-hover:rotate-6 transition-transform duration-300">
          {category.icon}
        </span>
      </div>
      <span
        className={`mt-3 text-sm md:text-base font-semibold transition-colors duration-200 ${
          isSelected ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'
        }`}
      >
        {category.name}
      </span>
    </button>
  );
};

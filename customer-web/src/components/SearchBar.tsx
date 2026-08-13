import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  initialValue?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search for restaurant or food...',
  onSearch,
  initialValue = '',
  className = '',
}) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center w-full bg-white rounded-full border border-slate-200 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all ${className}`}
    >
      <div className="pl-5 text-slate-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full py-3 px-3 text-slate-800 placeholder-slate-400 bg-transparent rounded-full focus:outline-none text-base"
      />
      <button
        type="submit"
        className="mr-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};

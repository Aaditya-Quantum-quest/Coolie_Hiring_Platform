import React, { useState, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

const SearchBar = ({
  placeholder = "Search...",
  value = "",
  onChange,
  onClear,
  onFilter,
  filters = [],
  selectedFilter = "",
  className = "",
  showFilters = false,
  autoFocus = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  const handleFilterSelect = (filter) => {
    onFilter?.(filter);
    setShowFilterDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400">
          <Search size={18} />
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`
            w-full pl-10 pr-20 py-3 rounded-xl
            bg-slate-800/50 border border-slate-700/50
            text-slate-100 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
            transition-all duration-200
            ${isFocused ? 'bg-slate-800/70 border-indigo-500/50' : ''}
          `}
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Filter Button */}
        {showFilters && filters.length > 0 && (
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Filter size={16} />
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      {showFilterDropdown && (
        <div className="filter-dropdown absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50">
          <div className="p-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterSelect(filter.value)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm
                  flex items-center justify-between
                  transition-colors duration-150
                  ${selectedFilter === filter.value
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50'
                  }
                `}
              >
                <span>{filter.label}</span>
                {selectedFilter === filter.value && <ChevronDown size={14} className="rotate-180" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon
          icon="ic:outline-search"
          className="w-[18px] h-[18px] text-slate-500 group-focus-within:text-amber-400 transition-colors"
        />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search tasks..."
        disabled={isLoading}
        className="pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50 focus:bg-slate-800/80 w-full md:w-40 md:focus:w-64 transition-all duration-300 placeholder:text-slate-600"
      />
    </div>
  );
}

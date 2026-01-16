'use client';

import React, { useState } from 'react';

interface FilterControlsProps {
  onFilterChange: (filters: {
    priority?: string;
    is_completed?: boolean;
  }) => void;
  isLoading?: boolean;
}

export default function FilterControls({
  onFilterChange,
  isLoading = false,
}: FilterControlsProps) {
  const [priority, setPriority] = useState<string | undefined>();

  const handlePriorityClick = (p: string) => {
    const newPriority = priority === p ? undefined : p;
    setPriority(newPriority);
    onFilterChange({ priority: newPriority });
  };

  const handleShowAll = () => {
    setPriority(undefined);
    onFilterChange({});
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {/* Reset Filter */}
      <button
        onClick={handleShowAll}
        disabled={isLoading}
        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
          !priority
            ? 'bg-white/10 text-white border-white/10 shadow-lg shadow-white/5'
            : 'bg-transparent text-slate-400 hover:text-white border-transparent hover:bg-white/5'
        }`}
      >
        All Tasks
      </button>

      {/* Priority Filters */}
      {['high', 'medium', 'low'].map((p) => (
        <button
          key={p}
          onClick={() => handlePriorityClick(p)}
          disabled={isLoading}
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all capitalize whitespace-nowrap ${
            priority === p
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-transparent text-slate-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          {p === 'high' ? '🔥' : p === 'medium' ? '⚡' : '☕'} {p}
        </button>
      ))}
    </div>
  );
}

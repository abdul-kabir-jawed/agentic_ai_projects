'use client';

import React, { useState } from 'react';

interface SortControlsProps {
  onSortChange: (sort: {
    sort_by: 'created_at' | 'due_date' | 'priority';
    sort_order: 'asc' | 'desc';
  }) => void;
  isLoading?: boolean;
}

export default function SortControls({
  onSortChange,
  isLoading = false,
}: SortControlsProps) {
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSortChange = (newSortBy: 'created_at' | 'due_date' | 'priority') => {
    const newOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    onSortChange({ sort_by: newSortBy, sort_order: newOrder });
  };

  const getArrow = (field: 'created_at' | 'due_date' | 'priority') => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  const getLabel = (field: string) => {
    switch (field) {
      case 'created_at':
        return 'Created';
      case 'due_date':
        return 'Due Date';
      case 'priority':
        return 'Priority';
      default:
        return field;
    }
  };

  return (
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-xs text-slate-400 font-medium">Sort by:</span>
      {(['created_at', 'due_date', 'priority'] as const).map((field) => (
        <button
          key={field}
          onClick={() => handleSortChange(field)}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
            sortBy === field
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-transparent text-slate-400 hover:text-white border-transparent hover:bg-white/5'
          } disabled:opacity-50`}
        >
          {getLabel(field)} {getArrow(field)}
        </button>
      ))}
    </div>
  );
}

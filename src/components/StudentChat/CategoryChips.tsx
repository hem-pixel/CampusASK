import React from 'react';
import { CategoryId } from '../../types';

interface CategoryOption {
  id: CategoryId;
  label: string;
}

const categories: CategoryOption[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'examinations', label: 'Exams' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'departments', label: 'Departments' },
  { id: 'events', label: 'Events' },
  { id: 'academic_processes', label: 'Academic' },
];

interface CategoryChipsProps {
  selected: CategoryId;
  onSelect: (id: CategoryId) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ selected, onSelect }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Filter answers by topic"
      className="flex gap-2 overflow-x-auto pb-2.5 px-4 sm:px-6 no-scrollbar"
    >
      {categories.map((cat) => {
        const isChecked = selected === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={isChecked}
            onClick={() => onSelect(cat.id)}
            className={`
              whitespace-nowrap px-3.5 py-1.5 rounded-[4px] text-[13px] font-[500] font-sans
              transition-all duration-150 cursor-pointer
              ${
                isChecked
                  ? 'bg-[var(--marine-wash)] text-[var(--marine)] border-2 border-[var(--marine)] font-semibold shadow-xs'
                  : 'bg-[var(--surface)] text-[var(--ink-soft)] border border-[var(--rule)] hover:bg-[var(--marine-wash)] hover:text-[var(--marine)]'
              }
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--marine)]
            `}
          >
            {isChecked && <span className="mr-1 text-[var(--marine)]">✓</span>}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

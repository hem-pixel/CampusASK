import React from 'react';

export const LoadingMessage: React.FC = () => {
  return (
    <div className="flex gap-3 mb-6 animate-fade-in-answer" role="status" aria-live="polite">
      {/* Marine rail */}
      <div
        className="w-[3px] bg-[var(--marine)] rounded-[2px] shrink-0 self-stretch"
        role="presentation"
        aria-hidden="true"
      />

      {/* Answer skeleton */}
      <div className="flex-1 bg-[var(--surface)] border border-[var(--rule)] rounded-[10px] p-5 shadow-xs">
        <div className="space-y-3">
          <div className="h-4 bg-[var(--rule)] rounded-[2px] w-full skeleton-shimmer" />
          <div className="h-4 bg-[var(--rule)] rounded-[2px] w-5/6 skeleton-shimmer" />
          <div className="h-4 bg-[var(--rule)] rounded-[2px] w-3/4 skeleton-shimmer" />
        </div>
        <p className="text-[12px] text-[var(--ink-soft)] font-sans mt-4 italic flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--marine)] animate-ping" />
          Searching verified college documents & regulations...
        </p>

        {/* Screen reader only announcement */}
        <span className="sr-only">
          Finding an answer to your question from college documents...
        </span>
      </div>
    </div>
  );
};

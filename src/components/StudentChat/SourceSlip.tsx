import React, { useState } from 'react';
import { Citation } from '../../types';
import { ChevronRight, ChevronDown, FileText, ExternalLink } from 'lucide-react';

interface SourceSlipProps {
  citation: Citation;
}

export const SourceSlip: React.FC<SourceSlipProps> = ({ citation }) => {
  const [expanded, setExpanded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`Source citation: ${citation.document_title}, page ${citation.page}`}
      onClick={() => setExpanded(!expanded)}
      onKeyDown={handleKeyDown}
      className="border border-[var(--rule)] rounded-[4px] overflow-hidden transition-all bg-[var(--surface)] hover:border-[var(--marine)] cursor-pointer text-left my-1.5 focus-visible:outline-2 focus-visible:outline-[var(--marine)] focus-visible:outline-offset-1"
    >
      {/* Collapsed Bar */}
      <div className="flex items-center justify-between p-3 bg-[var(--surface)] hover:bg-[var(--paper)] transition-colors">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <FileText className="w-4 h-4 text-[var(--marine)] shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[13px] font-[500] font-sans text-[var(--ink)] truncate">
              {citation.document_title}
            </p>
            <p className="text-[11px] text-[var(--ink-soft)] font-sans">
              Page {citation.page} • {citation.section}
            </p>
          </div>
        </div>
        <div className="text-[var(--marine)] ml-2 shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="p-4 bg-[var(--paper)] border-t border-[var(--rule)] source-slip-expanded">
          {/* Highlighted passage */}
          <div className="font-serif text-[15px] leading-[24px] text-[var(--ink)] mb-3 bg-white p-3 rounded-[4px] border border-[var(--rule)]">
            {citation.snippet_before && <span>{citation.snippet_before} </span>}
            <mark className="citation-highlight font-[500]">
              {citation.supporting_sentence}
            </mark>
            {citation.snippet_after && <span> {citation.snippet_after}</span>}
          </div>

          {/* Metadata */}
          <p className="text-[12px] text-[var(--ink-soft)] font-sans mb-2.5">
            {citation.document_title} • Page {citation.page} • Updated {citation.last_updated || 'Fall 2026'}
          </p>

          {/* Action button */}
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1.5 text-[var(--marine)] text-[13px] font-[500] hover:underline">
              <span>Verified Knowledge Base Record</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="text-[11px] text-[var(--moss)] bg-green-50 px-2 py-0.5 rounded border border-green-200 font-[500]">
              ✓ Official Source
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Citation } from '../../types';
import { SourceSlip } from './SourceSlip';
import { Check, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';

interface AssistantMessageProps {
  answer: string;
  citations?: Citation[];
  queryId?: string;
  feedback?: 'helpful' | 'unhelpful';
  onFeedback?: (queryId: string, feedback: 'helpful' | 'unhelpful') => void;
  timestamp?: string;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  answer,
  citations = [],
  queryId,
  feedback: initialFeedback,
  onFeedback,
  timestamp,
}) => {
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(initialFeedback || null);
  const [showAllSources, setShowAllSources] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedback(type);
    if (queryId && onFeedback) {
      onFeedback(queryId, type);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visibleCitations = showAllSources ? citations : citations.slice(0, 3);
  const hiddenCount = citations.length - 3;

  return (
    <div className="flex gap-3 mb-6 animate-fade-in-answer">
      {/* Marine rail (3px wide) */}
      <div
        className="w-[3px] bg-[var(--marine)] rounded-[2px] shrink-0 self-stretch animate-draw-rail"
        role="presentation"
        aria-hidden="true"
      />

      {/* Answer bubble */}
      <div className="flex-1 bg-[var(--surface)] border border-[var(--rule)] rounded-[10px] p-4.5 sm:p-5 shadow-xs">
        {/* Answer text */}
        <p className="font-serif text-[17px] text-[var(--ink)] leading-[27px] mb-4 selection:bg-[var(--marine-wash)]">
          {answer}
        </p>

        {/* Source slips list */}
        {citations.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-[var(--rule)] pt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium font-sans text-[var(--ink-soft)] uppercase tracking-wide">
                Grounded Citations ({citations.length})
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[12px] text-[var(--marine)] hover:text-[var(--marine-deep)] flex items-center gap-1 font-sans cursor-pointer"
                title="Copy answer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--moss)]" />
                    <span className="text-[var(--moss)]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {visibleCitations.map((citation, index) => (
              <SourceSlip key={index} citation={citation} />
            ))}

            {hiddenCount > 0 && !showAllSources && (
              <button
                type="button"
                onClick={() => setShowAllSources(true)}
                className="mt-2 text-[var(--marine)] hover:text-[var(--marine-deep)] text-[13px] font-[500] font-sans hover:underline cursor-pointer block"
              >
                Show {hiddenCount} more {hiddenCount === 1 ? 'source' : 'sources'}
              </button>
            )}
          </div>
        )}

        {/* Footer actions: Feedback and metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3.5 border-t border-[var(--rule)]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[var(--ink-soft)] font-sans mr-1">Was this accurate?</span>
            <button
              type="button"
              onClick={() => handleFeedback('helpful')}
              disabled={feedback !== null}
              aria-label="Mark answer as helpful"
              className={`text-[13px] font-sans px-3 py-1.5 rounded-[4px] inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                feedback === 'helpful'
                  ? 'bg-green-100 text-[var(--moss)] font-semibold border border-green-300 feedback-confirmed'
                  : 'text-[var(--marine)] hover:bg-[var(--marine-wash)] border border-transparent'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{feedback === 'helpful' ? 'Marked Helpful' : 'Helpful'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleFeedback('unhelpful')}
              disabled={feedback !== null}
              aria-label="Mark answer as not helpful"
              className={`text-[13px] font-sans px-3 py-1.5 rounded-[4px] inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                feedback === 'unhelpful'
                  ? 'bg-red-100 text-[var(--brick)] font-semibold border border-red-300 feedback-confirmed'
                  : 'text-[var(--ink-soft)] hover:bg-[var(--rule)] border border-transparent'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{feedback === 'unhelpful' ? 'Reported' : 'Not helpful'}</span>
            </button>
          </div>

          {timestamp && (
            <span className="text-[11px] text-[var(--ink-soft)] font-sans">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

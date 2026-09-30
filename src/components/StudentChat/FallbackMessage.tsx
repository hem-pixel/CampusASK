import React from 'react';
import { AlertCircle, Mail, Clock } from 'lucide-react';

interface FallbackMessageProps {
  suggestedContact?: string;
  contactEmail?: string;
  onOpenAskStaff?: () => void;
  timestamp?: string;
}

export const FallbackMessage: React.FC<FallbackMessageProps> = ({
  suggestedContact,
  contactEmail,
  onOpenAskStaff,
  timestamp,
}) => {
  return (
    <div className="flex gap-3 mb-6 animate-fade-in-answer">
      {/* Brick red rail */}
      <div
        className="w-[3px] bg-[var(--brick)] rounded-[2px] shrink-0 self-stretch"
        role="presentation"
        aria-hidden="true"
      />

      <div className="flex-1 bg-[var(--surface)] border border-[var(--rule)] rounded-[10px] p-4.5 sm:p-5 shadow-xs">
        <div className="flex items-start gap-2.5 mb-3">
          <AlertCircle className="w-5 h-5 text-[var(--brick)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-[17px] text-[var(--ink)] leading-[27px] font-serif">
              This information is not currently in the college documents I have access to.
            </p>
            <p className="text-[13px] text-[var(--ink-soft)] font-sans mt-1">
              To prevent misinformation, CampusAsk strictly answers only from verified university publications.
            </p>
          </div>
        </div>

        {suggestedContact ? (
          <div className="bg-[var(--marine-wash)] rounded-[6px] p-3.5 border border-sky-200 my-3">
            <p className="text-[14px] text-[var(--ink)] font-sans">
              <strong>Official Office Referral:</strong> {suggestedContact}
            </p>
            {contactEmail && (
              <p className="text-[13px] text-[var(--marine-deep)] font-sans mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <a href={`mailto:${contactEmail}`} className="underline hover:text-[var(--marine)]">
                  {contactEmail}
                </a>
              </p>
            )}
          </div>
        ) : (
          <p className="text-[14px] text-[var(--ink-soft)] font-sans my-2">
            Please ask the relevant dean, department head, or campus registrar.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[var(--rule)]">
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--ink-soft)] font-sans">
            <Clock className="w-3.5 h-3.5 text-[var(--amber-ink)]" />
            <span>Logged to the Staff Unanswered Queue for review.</span>
          </div>

          {onOpenAskStaff && (
            <button
              type="button"
              onClick={onOpenAskStaff}
              className="text-[13px] font-[500] font-sans text-[var(--marine)] hover:text-[var(--marine-deep)] hover:underline cursor-pointer"
            >
              Send note to staff &rarr;
            </button>
          )}
        </div>

        {timestamp && (
          <p className="text-[11px] text-[var(--ink-soft)] text-right mt-2 font-sans">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

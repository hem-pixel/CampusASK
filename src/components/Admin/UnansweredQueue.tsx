import React, { useState } from 'react';
import { UnansweredQuestion } from '../../types';
import { AlertCircle, CheckCircle2, BookOpen, Send, X } from 'lucide-react';

interface UnansweredQueueProps {
  unanswered: UnansweredQuestion[];
  onResolve: (
    id: string,
    params: {
      staffNotes: string;
      addToKnowledgeBase: boolean;
      answerContent?: string;
      category?: string;
    }
  ) => Promise<void>;
}

export const UnansweredQueue: React.FC<UnansweredQueueProps> = ({ unanswered, onResolve }) => {
  const [selectedItem, setSelectedItem] = useState<UnansweredQuestion | null>(null);
  const [staffAnswer, setStaffAnswer] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [addToKnowledgeBase, setAddToKnowledgeBase] = useState(true);
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingList = unanswered.filter((u) => u.status === 'pending');
  const resolvedList = unanswered.filter((u) => u.status === 'resolved');

  const handleOpenResolve = (item: UnansweredQuestion) => {
    setSelectedItem(item);
    setCategory(item.category || 'general');
    setStaffAnswer('');
    setStaffNotes('');
    setAddToKnowledgeBase(true);
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await onResolve(selectedItem.id, {
        staffNotes,
        addToKnowledgeBase,
        answerContent: staffAnswer,
        category,
      });
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-[600] font-serif text-[var(--ink)]">
            Unanswered Questions Queue
          </h2>
          <p className="text-[14px] text-[var(--ink-soft)] font-sans">
            Inquiries where documents lacked sufficient grounded information. Staff can answer and close knowledge gaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 text-[var(--amber-ink)] border border-amber-200 rounded-[4px] text-[13px] font-medium font-sans">
            {pendingList.length} Pending Gaps
          </span>
          <span className="px-3 py-1 bg-green-50 text-[var(--moss)] border border-green-200 rounded-[4px] text-[13px] font-medium font-sans">
            {resolvedList.length} Resolved
          </span>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="space-y-3">
        {pendingList.length === 0 ? (
          <div className="bg-[var(--surface)] p-8 rounded-[8px] border border-[var(--rule)] text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[var(--moss)] mx-auto" />
            <h3 className="font-serif text-[18px] font-semibold text-[var(--ink)]">
              All Knowledge Gaps Closed!
            </h3>
            <p className="text-[14px] text-[var(--ink-soft)] font-sans max-w-md mx-auto">
              There are currently no unanswered queries awaiting staff action. The knowledge base is up to date.
            </p>
          </div>
        ) : (
          pendingList.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--surface)] p-4 sm:p-5 rounded-[8px] border border-[var(--rule)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--marine)] transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="capitalize text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] border border-[var(--rule)]">
                    {item.category.replace('_', ' ')}
                  </span>
                  <span className="text-[12px] text-[var(--ink-soft)] font-mono">
                    {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="font-serif text-[16px] font-semibold text-[var(--ink)]">
                  "{item.question}"
                </h4>

                <p className="text-[13px] text-[var(--ink-soft)] font-sans">
                  <strong>Referred to:</strong> {item.suggestedContact}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenResolve(item)}
                className="px-4 py-2 bg-[var(--marine)] text-white text-[13px] font-medium rounded-[4px] hover:bg-[var(--marine-deep)] transition-colors cursor-pointer self-start md:self-auto shrink-0 inline-flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Answer & Close Gap</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Resolved Archive Section */}
      {resolvedList.length > 0 && (
        <div className="pt-6 border-t border-[var(--rule)]">
          <h3 className="text-[18px] font-serif font-semibold text-[var(--ink)] mb-3">
            Resolved Knowledge Gaps Archive ({resolvedList.length})
          </h3>
          <div className="space-y-2">
            {resolvedList.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="bg-[var(--paper)] p-3.5 rounded-[6px] border border-[var(--rule)] flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-[14px] font-medium text-[var(--ink)] font-serif">
                    {item.question}
                  </p>
                  <p className="text-[12px] text-[var(--moss)] font-sans mt-0.5">
                    ✓ Closed: {item.staffNotes || 'Answer integrated into knowledge base'}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--ink-soft)] font-mono">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolve Dialog */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[var(--surface)] w-full max-w-lg rounded-[10px] shadow-2xl border border-[var(--rule)] p-6 modal-dialog">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)] mb-4">
              <div>
                <h3 className="font-serif text-[18px] font-semibold text-[var(--ink)]">
                  Resolve & Integrate Knowledge
                </h3>
                <p className="text-[12px] text-[var(--ink-soft)] font-sans">
                  Provide verified college answers to permanently close this gap.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4">
              <div className="p-3 bg-[var(--paper)] rounded-[6px] border border-[var(--rule)]">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--marine)] font-sans mb-1">
                  Student Question
                </p>
                <p className="font-serif text-[15px] font-medium text-[var(--ink)]">
                  "{selectedItem.question}"
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                  Verified Official Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={staffAnswer}
                  onChange={(e) => setStaffAnswer(e.target.value)}
                  placeholder="State the official university regulation, deadline, or procedure precisely..."
                  className="w-full px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marine)] resize-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                  Internal Staff Notes
                </label>
                <input
                  type="text"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="e.g., Confirmed with Dean of Academics on Sept 29"
                  className="w-full px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
                />
              </div>

              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-[6px] flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="add-to-kb-check"
                  checked={addToKnowledgeBase}
                  onChange={(e) => setAddToKnowledgeBase(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[var(--marine)] rounded border-[var(--rule)] cursor-pointer"
                />
                <label htmlFor="add-to-kb-check" className="text-[13px] text-[var(--ink)] font-sans cursor-pointer">
                  <strong>Automatically integrate into Knowledge Base & FAQs</strong>
                  <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
                    CampusAsk will immediately index this verified response so future students asking this or similar questions receive a grounded citation!
                  </p>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 px-4 py-2 border border-[var(--rule)] text-[var(--ink-soft)] rounded-[4px] text-[13px] font-medium hover:bg-[var(--paper)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !staffAnswer.trim()}
                  className="flex-1 px-4 py-2 bg-[var(--marine)] text-white rounded-[4px] text-[13px] font-medium hover:bg-[var(--marine-deep)] disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Resolve & Update Knowledge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { FAQItem, CategoryId } from '../../types';
import { Plus, Trash2, HelpCircle, FileText, X } from 'lucide-react';

interface FaqManagerProps {
  faqs: FAQItem[];
  onAddFaq: (faq: { question: string; answer: string; category: string; documentTitle: string; page: number }) => Promise<void>;
  onDeleteFaq: (id: string) => Promise<void>;
}

export const FaqManager: React.FC<FaqManagerProps> = ({ faqs, onAddFaq, onDeleteFaq }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<CategoryId>('examinations');
  const [documentTitle, setDocumentTitle] = useState('Official Student Handbook 2026');
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) return;

    setIsSubmitting(true);
    try {
      await onAddFaq({
        question,
        answer,
        category,
        documentTitle,
        page,
      });
      setIsAddOpen(false);
      setQuestion('');
      setAnswer('');
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
            Frequently Asked Questions Directory
          </h2>
          <p className="text-[14px] text-[var(--ink-soft)] font-sans">
            Curated answers featured across the student portal and used for instant grounding.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--marine)] text-white rounded-[4px] font-sans font-[500] text-[14px] hover:bg-[var(--marine-deep)] transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* FAQs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-[var(--surface)] p-5 rounded-[8px] border border-[var(--rule)] shadow-xs flex flex-col justify-between hover:border-[var(--marine)] transition-colors"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="capitalize text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] border border-[var(--rule)]">
                  {faq.category.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteFaq(faq.id)}
                  className="text-[var(--ink-soft)] hover:text-[var(--brick)] p-1 rounded cursor-pointer"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-serif text-[16px] font-semibold text-[var(--ink)] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--marine)] shrink-0 mt-1" />
                <span>{faq.question}</span>
              </h4>

              <p className="font-sans text-[14px] text-[var(--ink-soft)] leading-[22px]">
                {faq.answer}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-[12px] text-[var(--ink-soft)]">
              <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                <FileText className="w-3.5 h-3.5 text-[var(--marine)]" />
                <span className="truncate">{faq.documentTitle}</span>
              </span>
              <span>Page {faq.page}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add FAQ Dialog */}
      {isAddOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[var(--surface)] w-full max-w-lg rounded-[10px] shadow-2xl border border-[var(--rule)] p-6 modal-dialog">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)] mb-4">
              <h3 className="font-serif text-[18px] font-semibold text-[var(--ink)]">
                Create Verified FAQ
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is the minimum attendance required for exam admit card?"
                  className="w-full px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                  Verified Answer *
                </label>
                <textarea
                  rows={3}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="State the official answer..."
                  className="w-full px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marine)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                    className="w-full px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
                  >
                    <option value="examinations">Examinations</option>
                    <option value="admissions">Admissions</option>
                    <option value="departments">Departments</option>
                    <option value="events">Events</option>
                    <option value="academic_processes">Academic Processes</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                    Page Citation Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={page}
                    onChange={(e) => setPage(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                  Source Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 px-4 py-2 border border-[var(--rule)] text-[var(--ink-soft)] rounded-[4px] text-[13px] font-medium hover:bg-[var(--paper)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !question.trim() || !answer.trim()}
                  className="flex-1 px-4 py-2 bg-[var(--marine)] text-white rounded-[4px] text-[13px] font-medium hover:bg-[var(--marine-deep)] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

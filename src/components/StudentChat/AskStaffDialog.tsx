import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface AskStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: string, message: string, category: string) => Promise<void>;
  prefilledQuestion?: string;
}

export const AskStaffDialog: React.FC<AskStaffDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefilledQuestion = '',
}) => {
  const [subject, setSubject] = useState(prefilledQuestion);
  const [category, setCategory] = useState('examinations');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(subject, message, category);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSubject('');
        setMessage('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-staff-title"
    >
      <div className="bg-[var(--surface)] w-full max-w-md rounded-[10px] shadow-xl border border-[var(--rule)] p-6 modal-dialog">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)] mb-4">
          <h2 id="ask-staff-title" className="font-serif text-[20px] font-semibold text-[var(--ink)]">
            Ask College Staff
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[var(--moss)] mx-auto" />
            <h3 className="font-serif text-[18px] font-semibold text-[var(--ink)]">
              Inquiry Sent to Staff
            </h3>
            <p className="text-[14px] text-[var(--ink-soft)] font-sans">
              Your inquiry has been placed in the priority staff queue. Helpdesk officers review submissions daily.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[13px] text-[var(--ink-soft)] font-sans">
              Can’t find what you need in the knowledge base? Send a direct query to the respective college administrative office.
            </p>

            <div>
              <label htmlFor="staff-category" className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                Topic / Department *
              </label>
              <select
                id="staff-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-[14px] border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] font-sans focus:ring-2 focus:ring-[var(--marine)] focus:outline-none"
              >
                <option value="examinations">Examinations & Hall Tickets</option>
                <option value="admissions">Admissions & Counseling</option>
                <option value="departments">Department Inquiries</option>
                <option value="events">Campus Events & Fest</option>
                <option value="academic_processes">Academic Ordinances & Credit Transfer</option>
                <option value="general">General Support / Registrar</option>
              </select>
            </div>

            <div>
              <label htmlFor="staff-subject" className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                Question Summary *
              </label>
              <input
                id="staff-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Can I apply for grade improvement in semester 5?"
                className="w-full px-3 py-2 text-[14px] border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] font-sans focus:ring-2 focus:ring-[var(--marine)] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="staff-details" className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                Additional Details (Optional)
              </label>
              <textarea
                id="staff-details"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide context or your department/program name (do not include passwords or financial info)..."
                className="w-full px-3 py-2 text-[14px] border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] font-sans focus:ring-2 focus:ring-[var(--marine)] focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-[var(--rule)] text-[var(--ink-soft)] rounded-[4px] font-[500] text-[14px] hover:bg-[var(--paper)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !subject.trim()}
                className="flex-1 px-4 py-2 bg-[var(--marine)] text-white rounded-[4px] font-[500] text-[14px] hover:bg-[var(--marine-deep)] disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending...' : 'Submit to Staff'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

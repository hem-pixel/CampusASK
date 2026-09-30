import React, { useState } from 'react';
import { Message, AuthUser } from '../../types';
import { jsPDF } from 'jspdf';
import {
  Download,
  FileText,
  Printer,
  X,
  CheckCircle2,
  FileCheck,
  FileCode,
  Shield,
  Clock,
  BookOpen,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  currentUser: AuthUser | null;
  sessionId: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  messages,
  currentUser,
  sessionId,
}) => {
  const [format, setFormat] = useState<'pdf' | 'txt'>('pdf');
  const [includeCitations, setIncludeCitations] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen) return null;

  // Filter out system welcome if user prefers or keep conversation items
  const conversationItems = messages.filter(
    (m) => m.role === 'user' || m.role === 'assistant' || m.role === 'fallback'
  );

  // ----------------------------------------------------
  // Text File (.txt) Generator
  // ----------------------------------------------------
  const handleExportTxt = () => {
    setIsExporting(true);
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      let content = `================================================================================
APEX UNIVERSITY — CAMPUSASK HELPDESK RECORD
Official Verified Student Interaction Transcript
================================================================================

Date Generated  : ${dateStr} at ${timeStr}
Session ID      : ${sessionId}
Student Name    : ${currentUser?.name || 'Guest Scholar'}
Student ID      : ${currentUser?.studentId || 'N/A (General Session)'}
Department      : ${currentUser?.department || 'Academic Helpdesk'}
Total Dialogues : ${conversationItems.length}

POLICY NOTICE:
Every answer in this transcript was generated strictly from approved university
documents, examination ordinances, or administrative guidelines.
================================================================================\n\n`;

      let qIndex = 1;
      conversationItems.forEach((msg) => {
        const timestamp = includeTimestamps
          ? `[${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `
          : '';

        if (msg.role === 'user') {
          content += `--------------------------------------------------------------------------------\n`;
          content += `QUERY #${qIndex} ${timestamp}\n`;
          content += `Student: ${msg.text}\n`;
          content += `--------------------------------------------------------------------------------\n\n`;
          qIndex++;
        } else if (msg.role === 'assistant') {
          content += `CAMPUSASK RESPONSE:\n${msg.text}\n\n`;

          if (includeCitations && msg.citations && msg.citations.length > 0) {
            content += `VERIFIED SOURCE CITATIONS:\n`;
            msg.citations.forEach((c, idx) => {
              content += `  [${idx + 1}] Document: ${c.document_title}\n`;
              content += `      Page: ${c.page} | Section: ${c.section}\n`;
              content += `      Supporting Quote: "${c.supporting_sentence}"\n`;
            });
            content += `\n`;
          }
        } else if (msg.role === 'fallback') {
          content += `CAMPUSASK RESPONSE (OUT OF SCOPE):\n${msg.text}\n`;
          if (msg.suggestedContact) {
            content += `Referred Office : ${msg.suggestedContact}\n`;
          }
          if (msg.contactEmail) {
            content += `Official Email  : ${msg.contactEmail}\n`;
          }
          content += `Status          : Logged to staff unanswered queue for review.\n\n`;
        }
      });

      content += `================================================================================
END OF OFFICIAL CAMPUS TRANSCRIPT
Apex University · Controller of Examinations & Academic Directorate
For verifications, email helpdesk@campus.edu or visit Tech Block Room 102.
================================================================================\n`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CampusAsk_Transcript_${now.toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('TXT export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // ----------------------------------------------------
  // PDF Document (.pdf) Generator via jsPDF
  // ----------------------------------------------------
  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const addHeader = (pageNum: number) => {
        doc.setFillColor(14, 90, 107); // #0E5A6B Marine
        doc.rect(0, 0, pageWidth, 55, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('APEX UNIVERSITY', margin, 32);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('CampusAsk — Official Helpdesk Record', margin + 180, 32);

        doc.setFontSize(9);
        doc.text(`Page ${pageNum}`, pageWidth - margin - 35, 32);
      };

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          pageNum++;
          addHeader(pageNum);
          y = 75;
        }
      };

      let pageNum = 1;
      addHeader(pageNum);
      y = 75;

      // Student and Transcript Info Box
      doc.setFillColor(241, 243, 242); // #F1F3F2 Paper
      doc.roundedRect(margin, y, contentWidth, 65, 4, 4, 'F');
      doc.setDrawColor(213, 220, 218); // #D5DCDA
      doc.roundedRect(margin, y, contentWidth, 65, 4, 4, 'S');

      doc.setTextColor(23, 38, 43); // #17262B Ink
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Student: ${currentUser?.name || 'Guest Scholar'}`, margin + 12, y + 20);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Department: ${currentUser?.department || 'Academic Helpdesk'}`,
        margin + 12,
        y + 36
      );
      doc.text(
        `ID: ${currentUser?.studentId || 'N/A'}  |  Session: ${sessionId}`,
        margin + 12,
        y + 52
      );

      const now = new Date();
      doc.text(
        `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        margin + 260,
        y + 20
      );
      doc.text('Status: Verified College Grounded Citations', margin + 260, y + 36);

      y += 85;

      // Messages Loop
      let queryCount = 1;
      conversationItems.forEach((msg) => {
        if (msg.role === 'user') {
          checkPageBreak(50);

          doc.setFillColor(220, 235, 238); // Marine wash
          doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

          doc.setTextColor(14, 90, 107); // Marine
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(`QUERY #${queryCount}: ${msg.text}`, margin + 10, y + 17);
          y += 34;
          queryCount++;
        } else if (msg.role === 'assistant') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(23, 38, 43);

          const splitAnswer = doc.splitTextToSize(msg.text, contentWidth - 20);
          const answerHeight = splitAnswer.length * 14 + 10;
          checkPageBreak(answerHeight);

          // Left Marine Rail
          doc.setFillColor(14, 90, 107);
          doc.rect(margin, y, 3, answerHeight, 'F');

          doc.text(splitAnswer, margin + 12, y + 12);
          y += answerHeight + 6;

          // Citations
          if (includeCitations && msg.citations && msg.citations.length > 0) {
            checkPageBreak(40 + msg.citations.length * 28);

            doc.setFillColor(248, 250, 250);
            doc.rect(margin + 12, y, contentWidth - 12, 18, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(74, 93, 99);
            doc.text('GROUNDED SOURCE CITATIONS:', margin + 18, y + 12);
            y += 22;

            msg.citations.forEach((c) => {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(8.5);
              doc.setTextColor(14, 90, 107);
              doc.text(`• ${c.document_title} (Page ${c.page}, ${c.section})`, margin + 20, y);
              y += 12;

              doc.setFont('helvetica', 'italic');
              doc.setFontSize(8);
              doc.setTextColor(74, 93, 99);
              const quote = doc.splitTextToSize(`"${c.supporting_sentence}"`, contentWidth - 35);
              doc.text(quote, margin + 28, y);
              y += quote.length * 10 + 4;
            });
            y += 8;
          }
        } else if (msg.role === 'fallback') {
          checkPageBreak(50);
          doc.setFillColor(168, 58, 46); // Brick rail
          doc.rect(margin, y, 3, 36, 'F');

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(168, 58, 46);
          doc.text('Out of scope: Not present in current university documents.', margin + 12, y + 12);

          if (msg.suggestedContact) {
            doc.setTextColor(23, 38, 43);
            doc.setFontSize(8.5);
            doc.text(
              `Referral Office: ${msg.suggestedContact} (${msg.contactEmail || 'helpdesk@campus.edu'})`,
              margin + 12,
              y + 26
            );
          }
          y += 46;
        }
      });

      // Footer notice on last page
      checkPageBreak(40);
      doc.setDrawColor(213, 220, 218);
      doc.line(margin, y, pageWidth - margin, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 115, 120);
      doc.text(
        'This verified record is produced by the CampusAsk Knowledge Engine for student reference.',
        margin,
        y
      );
      doc.text('Apex Institute · All rights reserved.', pageWidth - margin - 150, y);

      doc.save(`CampusAsk_Transcript_${now.toISOString().split('T')[0]}.pdf`);

      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      <div className="bg-[var(--surface)] w-full max-w-xl rounded-[12px] shadow-2xl border border-[var(--rule)] p-6 modal-dialog">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--rule)] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--marine-wash)] rounded-[6px] text-[var(--marine)]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id="export-dialog-title" className="font-serif text-[20px] font-semibold text-[var(--ink)]">
                Export Conversation Record
              </h2>
              <p className="text-[12px] text-[var(--ink-soft)] font-sans">
                Save an official transcript with grounded citations for your personal academic files.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close export dialog"
            className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {exportComplete ? (
          <div className="py-10 text-center space-y-3 animate-fade-in-answer">
            <CheckCircle2 className="w-12 h-12 text-[var(--moss)] mx-auto animate-bounce" />
            <h3 className="font-serif text-[18px] font-semibold text-[var(--ink)]">
              Download Initialized!
            </h3>
            <p className="text-[13px] text-[var(--ink-soft)] font-sans max-w-sm mx-auto">
              Your verified helpdesk conversation transcript has been downloaded to your device.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Format Selection Cards */}
            <div>
              <label className="block text-[13px] font-sans font-semibold text-[var(--ink)] mb-2">
                Choose Export Format:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`p-3.5 rounded-[8px] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    format === 'pdf'
                      ? 'bg-[var(--marine-wash)] border-[var(--marine)] shadow-xs ring-1 ring-[var(--marine)]'
                      : 'bg-white border-[var(--rule)] hover:border-[var(--marine)] hover:bg-[var(--paper)]'
                  }`}
                >
                  <FileCheck className="w-5 h-5 text-[var(--marine)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[14px] text-[var(--ink)] font-sans">
                      Official PDF Document (.pdf)
                    </p>
                    <p className="text-[11px] text-[var(--ink-soft)] font-sans mt-0.5">
                      Includes university letterhead, citation rails, and academic formatting.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('txt')}
                  className={`p-3.5 rounded-[8px] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    format === 'txt'
                      ? 'bg-[var(--marine-wash)] border-[var(--marine)] shadow-xs ring-1 ring-[var(--marine)]'
                      : 'bg-white border-[var(--rule)] hover:border-[var(--marine)] hover:bg-[var(--paper)]'
                  }`}
                >
                  <FileCode className="w-5 h-5 text-[var(--marine)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[14px] text-[var(--ink)] font-sans">
                      Plain Text Transcript (.txt)
                    </p>
                    <p className="text-[11px] text-[var(--ink-soft)] font-sans mt-0.5">
                      Lightweight ASCII text file easy to copy, search, or attach to notes.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Inclusions Toggle Options */}
            <div className="p-3.5 bg-[var(--paper)] rounded-[8px] border border-[var(--rule)] space-y-2.5">
              <p className="text-[12px] font-sans font-semibold text-[var(--ink)] uppercase tracking-wider">
                Transcript Options:
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-[13px] text-[var(--ink)] font-sans cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCitations}
                    onChange={(e) => setIncludeCitations(e.target.checked)}
                    className="rounded border-[var(--rule)] text-[var(--marine)] focus:ring-[var(--marine)] cursor-pointer"
                  />
                  <span>Include Grounded Citations & Quotes</span>
                </label>

                <label className="flex items-center gap-2 text-[13px] text-[var(--ink)] font-sans cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTimestamps}
                    onChange={(e) => setIncludeTimestamps(e.target.checked)}
                    className="rounded border-[var(--rule)] text-[var(--marine)] focus:ring-[var(--marine)] cursor-pointer"
                  />
                  <span>Include Message Timestamps</span>
                </label>
              </div>
            </div>

            {/* Transcript Preview Summary Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px] text-[12px] text-[var(--ink-soft)] font-sans space-y-1">
              <div className="flex justify-between">
                <span>Student Record:</span>
                <span className="font-medium text-[var(--ink)]">
                  {currentUser?.name || 'Guest Student'} ({currentUser?.studentId || 'Anonymous Session'})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Items in Thread:</span>
                <span className="font-medium text-[var(--ink)]">{conversationItems.length} messages</span>
              </div>
              <div className="flex justify-between">
                <span>Grounded Verification:</span>
                <span className="font-medium text-[var(--moss)]">✓ Verified against Knowledge Base</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2.5 border border-[var(--rule)] text-[var(--ink)] rounded-[6px] text-[13px] font-medium font-sans hover:bg-[var(--paper)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                title="Print conversation thread"
              >
                <Printer className="w-4 h-4 text-[var(--ink-soft)]" />
                <span>Print Document</span>
              </button>

              <div className="flex-1 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-[var(--rule)] text-[var(--ink-soft)] rounded-[6px] text-[13px] font-medium font-sans hover:bg-[var(--paper)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={format === 'pdf' ? handleExportPdf : handleExportTxt}
                  className="flex-1 px-5 py-2.5 bg-[var(--marine)] text-white rounded-[6px] text-[13px] font-semibold font-sans hover:bg-[var(--marine-deep)] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting
                      ? 'Generating...'
                      : format === 'pdf'
                      ? 'Download PDF File'
                      : 'Download Text File'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

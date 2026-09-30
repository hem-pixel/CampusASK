import React, { useState } from 'react';
import { DocumentItem, DocumentChunk } from '../../types';
import { Plus, RefreshCw, Trash2, Eye, FileText, CheckCircle2, X } from 'lucide-react';

interface DocumentListProps {
  documents: DocumentItem[];
  onOpenUpload: () => void;
  onDeleteDocument: (id: string) => void;
  onReprocessDocument: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onOpenUpload,
  onDeleteDocument,
  onReprocessDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = filterCategory === 'all' || doc.category === filterCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.department && doc.department.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-[600] font-serif text-[var(--ink)]">
            Manage Knowledge Base
          </h2>
          <p className="text-[14px] text-[var(--ink-soft)] font-sans">
            Grounded college documents used to generate student helpdesk answers with citations.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--marine)] text-white rounded-[4px] font-sans font-[500] text-[14px] hover:bg-[var(--marine-deep)] transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[var(--surface)] p-3 rounded-[6px] border border-[var(--rule)]">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by title, department, or keyword…"
          className="flex-1 px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
        >
          <option value="all">All Categories</option>
          <option value="examinations">Examinations</option>
          <option value="admissions">Admissions</option>
          <option value="departments">Departments</option>
          <option value="events">Events</option>
          <option value="academic_processes">Academic Processes</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] rounded-[8px] border border-[var(--rule)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--paper)] border-b border-[var(--rule)] text-[12px] font-medium font-sans text-[var(--ink-soft)] uppercase tracking-wider">
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Indexed Chunks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)] text-[14px] font-sans">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--ink-soft)]">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[var(--marine-wash)]/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[var(--ink)]">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[var(--marine)] shrink-0" />
                        <div>
                          <p className="font-medium text-[var(--ink)]">{doc.title}</p>
                          <p className="text-[12px] text-[var(--ink-soft)]">
                            {doc.department || 'Campus Wide'} {doc.academicYear && `• ${doc.academicYear}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2.5 py-0.5 rounded-[4px] text-[12px] font-medium bg-[var(--paper)] text-[var(--ink)] border border-[var(--rule)]">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[13px] text-[var(--ink-soft)]">
                      {doc.chunksCount} chunks ({doc.fileSize})
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--moss)] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[13px] text-[var(--ink-soft)]">
                      {new Date(doc.uploadedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 text-[var(--marine)] hover:bg-[var(--marine-wash)] rounded-[4px] cursor-pointer"
                          title="Inspect chunks"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReprocessDocument(doc.id)}
                          className="p-1.5 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper)] rounded-[4px] cursor-pointer"
                          title="Reprocess chunks"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 text-[var(--brick)] hover:bg-red-50 rounded-[4px] cursor-pointer"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chunks Inspector Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[var(--surface)] w-full max-w-2xl max-h-[85vh] rounded-[10px] shadow-2xl border border-[var(--rule)] flex flex-col modal-dialog">
            <div className="flex items-center justify-between p-5 border-b border-[var(--rule)]">
              <div>
                <h3 className="font-serif text-[18px] font-semibold text-[var(--ink)]">
                  {selectedDoc.title}
                </h3>
                <p className="text-[12px] text-[var(--ink-soft)] font-sans">
                  {selectedDoc.chunksCount} Indexed Search Chunks • Category: {selectedDoc.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {selectedDoc.chunks.map((chunk: DocumentChunk, i: number) => (
                <div key={chunk.id} className="p-4 bg-[var(--paper)] rounded-[6px] border border-[var(--rule)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold font-mono text-[var(--marine)]">
                      [Chunk {i + 1}] Page {chunk.pageNumber}
                    </span>
                    <span className="text-[12px] font-semibold text-[var(--ink)]">
                      {chunk.sectionHeading}
                    </span>
                  </div>
                  <p className="text-[14px] text-[var(--ink)] leading-[22px] font-serif">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[var(--rule)] text-right bg-[var(--paper)] rounded-b-[10px]">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-[var(--marine)] text-white text-[13px] font-medium rounded-[4px] hover:bg-[var(--marine-deep)] cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { CategoryId } from '../../types';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('examinations');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'extracting' | 'embedding'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    if (f.size > 20 * 1024 * 1024) {
      setError('File exceeds the 20 MB size limit.');
      return;
    }
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Please provide a file and document title.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setStatus('uploading');
      setProgress(30);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('academicYear', academicYear);
      formData.append('department', department);

      setTimeout(() => {
        setStatus('extracting');
        setProgress(65);
      }, 400);

      setTimeout(() => {
        setStatus('embedding');
        setProgress(90);
      }, 800);

      const token = sessionStorage.getItem('admin_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      setProgress(100);
      setTimeout(() => {
        onUploadSuccess();
        onClose();
        resetForm();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setStatus('idle');
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setCategory('examinations');
    setAcademicYear('2026-2027');
    setDepartment('');
    setStatus('idle');
    setProgress(0);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title"
    >
      <div className="bg-[var(--surface)] rounded-[10px] shadow-2xl border border-[var(--rule)] max-w-lg w-full p-6 modal-dialog">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)] mb-4">
          <h2 id="upload-dialog-title" className="text-[20px] font-[600] font-serif text-[var(--ink)]">
            Upload Approved Knowledge Document
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[var(--brick)] rounded-[4px] text-[13px] font-sans flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File drop area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`
              border-2 border-dashed rounded-[6px] p-6 text-center cursor-pointer transition-colors
              ${
                file
                  ? 'border-[var(--moss)] bg-green-50/50'
                  : 'border-[var(--rule)] hover:border-[var(--marine)] hover:bg-[var(--marine-wash)]'
              }
            `}
          >
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => e.target.files && e.target.files[0] && validateAndSetFile(e.target.files[0])}
              className="hidden"
              id="admin-file-upload-input"
            />
            {file ? (
              <label htmlFor="admin-file-upload-input" className="cursor-pointer space-y-1">
                <CheckCircle2 className="w-8 h-8 text-[var(--moss)] mx-auto" />
                <p className="text-[14px] font-[600] text-[var(--moss)] font-sans">{file.name}</p>
                <p className="text-[12px] text-[var(--ink-soft)] font-sans">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                </p>
              </label>
            ) : (
              <label htmlFor="admin-file-upload-input" className="cursor-pointer space-y-2">
                <UploadCloud className="w-8 h-8 text-[var(--marine)] mx-auto" />
                <p className="text-[14px] font-[600] text-[var(--ink)] font-sans">
                  Drag & drop file here or click to browse
                </p>
                <p className="text-[12px] text-[var(--ink-soft)] font-sans">
                  Accepted: PDF, DOCX, or TXT (Strict Max: 20 MB)
                </p>
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., End-Semester Examination Regulations 2026"
              className="w-full px-3 py-2 border border-[var(--rule)] rounded-[4px] text-[14px] font-sans focus:outline-none focus:ring-2 focus:ring-[var(--marine)] bg-white"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                Topic Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full px-3 py-2 border border-[var(--rule)] rounded-[4px] text-[14px] font-sans focus:outline-none focus:ring-2 focus:ring-[var(--marine)] bg-white"
              >
                <option value="examinations">Examinations</option>
                <option value="admissions">Admissions</option>
                <option value="departments">Departments</option>
                <option value="events">Events & Fest</option>
                <option value="academic_processes">Academic Processes</option>
                <option value="general">General Support</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026-2027"
                className="w-full px-3 py-2 border border-[var(--rule)] rounded-[4px] text-[14px] font-sans focus:outline-none focus:ring-2 focus:ring-[var(--marine)] bg-white"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
              Publishing Department / Authority
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Controller of Examinations, Computer Science"
              className="w-full px-3 py-2 border border-[var(--rule)] rounded-[4px] text-[14px] font-sans focus:outline-none focus:ring-2 focus:ring-[var(--marine)] bg-white"
            />
          </div>

          {/* Progress bar */}
          {isLoading && (
            <div className="space-y-2 pt-2">
              <div className="h-1.5 bg-[var(--rule)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--marine)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[12px] text-[var(--ink-soft)] text-center capitalize font-sans">
                {status === 'uploading' && 'Uploading document to secure storage…'}
                {status === 'extracting' && 'Extracting text & sanitizing payload…'}
                {status === 'embedding' && 'Generating indexed chunks for grounded citations…'}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-[var(--rule)] text-[var(--ink-soft)] rounded-[4px] font-[500] text-[14px] hover:bg-[var(--paper)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !file || !title}
              className="flex-1 px-4 py-2 bg-[var(--marine)] text-white rounded-[4px] font-[500] text-[14px] hover:bg-[var(--marine-deep)] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isLoading ? 'Processing...' : 'Upload & Index'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

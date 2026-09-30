export type CategoryId = 
  | 'all'
  | 'examinations'
  | 'admissions'
  | 'departments'
  | 'events'
  | 'academic_processes'
  | 'general';

export interface Citation {
  document_id: string;
  document_title: string;
  page: number;
  section: string;
  supporting_sentence: string;
  snippet_before?: string;
  snippet_after?: string;
  last_updated?: string;
  public_url?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'fallback';
  text: string;
  timestamp: string;
  citations?: Citation[];
  suggestedContact?: string;
  contactEmail?: string;
  feedback?: 'helpful' | 'unhelpful';
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  sectionHeading: string;
  content: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: CategoryId;
  academicYear?: string;
  department?: string;
  status: 'ready' | 'processing' | 'error';
  uploadedAt: string;
  fileSize: string;
  fileName: string;
  chunksCount: number;
  chunks: DocumentChunk[];
}

export interface QueryRecord {
  id: string;
  sessionId: string;
  question: string;
  category: string;
  answerable: boolean;
  timestamp: string;
  sourcesCount: number;
  feedback?: 'helpful' | 'unhelpful';
  responseLatencyMs: number;
}

export interface UnansweredQuestion {
  id: string;
  sessionId: string;
  question: string;
  category: string;
  timestamp: string;
  status: 'pending' | 'resolved';
  suggestedContact: string;
  staffNotes?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: CategoryId;
  documentTitle: string;
  page: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  event: string;
  ip: string;
  userId?: string;
  details: Record<string, any>;
  level: 'info' | 'warning' | 'critical';
}

export interface AuthUser {
  email: string;
  name: string;
  role: 'student' | 'admin';
  studentId?: string;
  department?: string;
}


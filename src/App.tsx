import React, { useState, useEffect, useRef } from 'react';
import { api, ChatResponse } from './services/api';
import { Message, CategoryId, DocumentItem, QueryRecord, UnansweredQuestion, FAQItem, SecurityEvent, AuthUser } from './types';
import { StudentMessage } from './components/StudentChat/StudentMessage';
import { AssistantMessage } from './components/StudentChat/AssistantMessage';
import { FallbackMessage } from './components/StudentChat/FallbackMessage';
import { LoadingMessage } from './components/StudentChat/LoadingMessage';
import { CategoryChips } from './components/StudentChat/CategoryChips';
import { ChatInput } from './components/StudentChat/ChatInput';
import { AskStaffDialog } from './components/StudentChat/AskStaffDialog';
import { ExportModal } from './components/StudentChat/ExportModal';
import { AuthPage } from './components/Auth/AuthPage';
import { AdminNav, AdminTab } from './components/Admin/AdminNav';
import { DocumentList } from './components/Admin/DocumentList';
import { DocumentUploadDialog } from './components/Admin/DocumentUploadDialog';
import { QueryHistory } from './components/Admin/QueryHistory';
import { UnansweredQueue } from './components/Admin/UnansweredQueue';
import { FaqManager } from './components/Admin/FaqManager';
import { SecurityLogs } from './components/Admin/SecurityLogs';
import { Toast, ToastData } from './components/Toast';
import { GraduationCap, Shield, MessageSquare, Sparkles, BookOpen, LogIn, LogOut, User, Download } from 'lucide-react';

const SUGGESTED_QUESTIONS: Record<CategoryId, string[]> = {
  all: [
    'When does course registration close for exams?',
    'What is the attendance requirement for hall tickets?',
    'Where is the Computer Science HOD office located?',
    'What is the scholarship policy for high scores in admissions?',
  ],
  examinations: [
    'When does course registration close for exams?',
    'What is the attendance requirement for hall tickets?',
    'How do I apply for exam re-evaluation and what is the fee?',
  ],
  admissions: [
    'What scholarship is awarded for scores of 90% or above?',
    'When does the admissions application portal close?',
    'What original documents are required during counseling verification?',
  ],
  departments: [
    'Who is the HOD of Computer Science and what are office hours?',
    'What are the prerequisites for Advanced Algorithms CS301?',
    'What are the guidelines for senior capstone projects?',
  ],
  events: [
    'When is the Innovate 2026 fest and how much are guest passes?',
    'What is the prize pool for the national hackathon?',
  ],
  academic_processes: [
    'How many online MOOC credits can I transfer towards my degree?',
    'What is the time limit for submitting a medical leave petition?',
    'How long does standard official transcript processing take?',
  ],
  general: [
    'Where is the 24/7 campus health center located?',
    'Can I bring a pet into university laboratory buildings?',
  ],
};

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'student' | 'admin'>('student');
  const [adminTab, setAdminTab] = useState<AdminTab>('documents');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<'student' | 'staff'>('student');
  const [showAskStaff, setShowAskStaff] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Student Chat State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: 'Welcome to CampusAsk. I am your verified college helpdesk assistant. I answer questions regarding examinations, admissions, department faculty, campus events, and academic regulations strictly using approved college documents with citations.',
      timestamp: new Date().toISOString(),
      citations: [
        {
          document_id: 'doc-handbook',
          document_title: 'Official Campus Handbook & Academic Regulations 2026',
          page: 1,
          section: 'Helpdesk Charter & Grounding Standard',
          supporting_sentence: 'Every answer is grounded strictly in approved university policies.',
          last_updated: 'September 2026',
        },
      ],
    },
  ]);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [sessionId] = useState(() => 'sess-' + Math.random().toString(36).substring(2, 9));

  // Admin Data State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);

  // Toast
  const [toast, setToast] = useState<ToastData | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Initial Data Load
  useEffect(() => {
    checkAuthStatus();
    loadPublicData();
  }, []);

  const checkAuthStatus = async () => {
    const user = await api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setViewMode('admin');
        loadAdminData();
      } else {
        setViewMode('student');
      }
    }
  };

  const loadPublicData = async () => {
    const fList = await api.getFaqs();
    setFaqs(fList);
  };

  const loadAdminData = async () => {
    try {
      const [docs, qList, unanList, logList] = await Promise.all([
        api.getAdminDocuments(),
        api.getAdminQueries(),
        api.getAdminUnanswered(),
        api.getSecurityLogs(),
      ]);
      setDocuments(docs);
      setQueries(qList);
      setUnanswered(unanList);
      setSecurityLogs(logList);
    } catch (e) {
      console.warn('Failed to load admin data', e);
    }
  };

  useEffect(() => {
    if (viewMode === 'student') {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingAnswer, viewMode]);

  // Handle Send Question
  const handleSendMessage = async (questionText: string) => {
    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: questionText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoadingAnswer(true);

    try {
      const resp: ChatResponse = await api.askQuestion(questionText, selectedCategory, sessionId);

      if (resp.answerable) {
        const assistantMsg: Message = {
          id: 'msg-' + Date.now() + 1,
          role: 'assistant',
          text: resp.answer,
          timestamp: new Date().toISOString(),
          citations: resp.citations,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const fallbackMsg: Message = {
          id: 'msg-' + Date.now() + 1,
          role: 'fallback',
          text: resp.answer || 'This information is not in the college documents I have access to.',
          timestamp: new Date().toISOString(),
          suggestedContact: resp.suggestedContact,
          contactEmail: resp.contactEmail,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch {
      showToast('Could not reach college helpdesk server. Please try again.', 'error');
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  const handleFeedback = async (queryId: string, feedback: 'helpful' | 'unhelpful') => {
    await api.submitFeedback(queryId, feedback);
    showToast(
      feedback === 'helpful' ? 'Thank you! Your feedback helps calibrate accuracy.' : 'Feedback recorded. Helpdesk staff will review citation accuracy.',
      'info'
    );
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setShowAuthPage(false);

    if (user.role === 'admin') {
      setViewMode('admin');
      loadAdminData();
      showToast(`Welcome, ${user.name}. Administrator privileges verified.`, 'success');
    } else {
      setViewMode('student');
      showToast(`Welcome back, ${user.name}! Connected to student helpdesk.`, 'success');
    }
  };

  const handleLogout = async () => {
    await api.logoutAdmin();
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('student_token');
    sessionStorage.removeItem('admin_token');
    setCurrentUser(null);
    setViewMode('student');
    showToast('Signed out of campus account successfully.', 'info');
  };

  // Staff Inquiry Submission
  const handleAskStaffSubmit = async (subject: string, message: string, category: string) => {
    showToast('Inquiry forwarded to staff helpdesk queue', 'success');
    if (currentUser?.role === 'admin') {
      const unan = await api.getAdminUnanswered();
      setUnanswered(unan);
    }
  };

  // Document Operations
  const handleDeleteDoc = async (id: string) => {
    if (confirm('Are you sure you want to remove this document from the active knowledge base?')) {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showToast('Document removed from active knowledge base', 'info');
    }
  };

  const handleReprocessDoc = async (id: string) => {
    await api.reprocessDocument(id);
    showToast('Document chunks re-indexed successfully', 'success');
    loadAdminData();
  };

  // Resolve Unanswered
  const handleResolveUnanswered = async (
    id: string,
    params: {
      staffNotes: string;
      addToKnowledgeBase: boolean;
      answerContent?: string;
      category?: string;
    }
  ) => {
    await api.resolveUnanswered(id, params);
    showToast('Question marked resolved and integrated into knowledge base!', 'success');
    loadAdminData();
    loadPublicData();
  };

  // FAQ Operations
  const handleAddFaq = async (faq: any) => {
    const created = await api.addFaq(faq);
    setFaqs((prev) => [...prev, created]);
    showToast('FAQ added to public directory', 'success');
  };

  const handleDeleteFaq = async (id: string) => {
    await api.deleteFaq(id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    showToast('FAQ removed', 'info');
  };

  const currentSuggested = SUGGESTED_QUESTIONS[selectedCategory] || SUGGESTED_QUESTIONS.all;

  // Gatekeeper: Show login page first if user is not logged in
  if (!currentUser) {
    return (
      <AuthPage
        initialRole={authInitialRole}
        onClose={() => {}}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] font-sans antialiased">
      {/* Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Top Header (56px) */}
      <header className="h-[56px] bg-[var(--surface)] border-b border-[var(--rule)] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-[var(--marine)] text-white flex items-center justify-center font-serif font-bold text-lg shadow-xs">
            A
          </div>
          <div>
            <span className="font-serif text-[19px] font-semibold text-[var(--ink)] tracking-tight">
              CampusAsk
            </span>
            <span className="hidden sm:inline text-[11px] text-[var(--ink-soft)] ml-2 border-l border-[var(--rule)] pl-2 font-sans">
              Apex University Helpdesk
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'student' ? (
            <>
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                title="Export conversation transcript as PDF or Text file"
                className="px-3 py-1.5 text-[13px] font-medium font-sans bg-white text-[var(--marine)] hover:bg-[var(--marine-wash)] rounded-[4px] border border-[var(--rule)] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[var(--marine)]" />
                <span className="hidden sm:inline">Export Record</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAskStaff(true)}
                className="px-3 py-1.5 text-[13px] font-medium font-sans text-[var(--marine)] hover:bg-[var(--marine-wash)] rounded-[4px] border border-[var(--marine)]/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask Staff</span>
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  {currentUser.role === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('admin');
                        loadAdminData();
                      }}
                      className="px-3 py-1.5 text-[13px] font-medium font-sans bg-[var(--marine)] text-white rounded-[4px] hover:bg-[var(--marine-deep)] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Console</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-[var(--marine-wash)] text-[var(--marine-deep)] rounded-[4px] border border-[var(--marine)]/20 text-[12px] font-medium font-sans">
                      <GraduationCap className="w-4 h-4 text-[var(--marine)]" />
                      <span className="max-w-[120px] truncate">{currentUser.name}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-[var(--ink-soft)] hover:text-[var(--brick)] hover:bg-red-50 rounded-[4px] cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthInitialRole('student');
                    setShowAuthPage(true);
                  }}
                  className="px-3.5 py-1.5 text-[13px] font-semibold font-sans bg-[var(--marine)] text-white hover:bg-[var(--marine-deep)] rounded-[4px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('student')}
                className="px-3 py-1.5 text-[13px] font-medium font-sans bg-[var(--marine-wash)] text-[var(--marine)] border border-[var(--marine)] rounded-[4px] hover:bg-[var(--marine)] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Switch to Student View</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-[var(--ink-soft)] hover:text-[var(--brick)] hover:bg-red-50 rounded-[4px] cursor-pointer transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === 'student' ? (
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto pb-4">
          {/* Category Chips Bar & Quick Export Tool */}
          <div className="pt-3.5 pb-1 bg-[var(--paper)] sticky top-[56px] z-20 flex items-center justify-between px-4 sm:px-6">
            <div className="flex-1 overflow-hidden">
              <CategoryChips
                selected={selectedCategory}
                onSelect={(cat) => setSelectedCategory(cat)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              title="Export conversation transcript as PDF or Text file"
              className="ml-2 mb-2 px-2.5 py-1.5 bg-white text-[var(--marine)] border border-[var(--rule)] hover:border-[var(--marine)] rounded-[4px] text-[12px] font-medium font-sans hover:bg-[var(--marine-wash)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export (PDF/TXT)</span>
            </button>
          </div>

          {/* Conversation Thread */}
          <main id="main-content" className="flex-1 px-4 sm:px-6 py-4 space-y-2">
            {messages.map((msg) => {
              if (msg.role === 'user') {
                return <StudentMessage key={msg.id} text={msg.text} timestamp={msg.timestamp} />;
              }
              if (msg.role === 'fallback') {
                return (
                  <FallbackMessage
                    key={msg.id}
                    suggestedContact={msg.suggestedContact}
                    contactEmail={msg.contactEmail}
                    timestamp={msg.timestamp}
                    onOpenAskStaff={() => setShowAskStaff(true)}
                  />
                );
              }
              return (
                <AssistantMessage
                  key={msg.id}
                  answer={msg.text}
                  citations={msg.citations}
                  timestamp={msg.timestamp}
                  feedback={msg.feedback}
                  onFeedback={(qid, f) => handleFeedback(qid, f)}
                />
              );
            })}

            {isLoadingAnswer && <LoadingMessage />}

            {/* Quick Prompt Suggestions when conversation is light */}
            {messages.length <= 3 && !isLoadingAnswer && (
              <div className="pt-4 pb-2">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ink-soft)] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--marine)]" />
                    <span>Frequently Consulted Questions</span>
                  </div>

                  {!currentUser && (
                    <button
                      type="button"
                      onClick={() => setShowAuthPage(true)}
                      className="text-[12px] font-medium text-[var(--marine)] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Sign In to Student/Staff Portal</span> &rarr;
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentSuggested.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="p-3 bg-[var(--surface)] hover:bg-[var(--marine-wash)] border border-[var(--rule)] hover:border-[var(--marine)] rounded-[6px] text-left text-[13px] text-[var(--ink)] font-sans transition-all cursor-pointer shadow-2xs group flex items-start gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-[var(--marine)] shrink-0 mt-0.5 group-hover:scale-105 transition-transform" />
                      <span className="line-clamp-2">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={threadEndRef} />
          </main>

          {/* Bottom Chat Input */}
          <ChatInput onSend={handleSendMessage} disabled={isLoadingAnswer} />
        </div>
      ) : (
        /* Admin Dashboard View */
        <div className="flex-1 flex flex-col md:flex-row">
          <AdminNav
            currentTab={adminTab}
            onSelectTab={(tab) => setAdminTab(tab)}
            onBackToChat={() => setViewMode('student')}
            onLogout={handleLogout}
            unansweredCount={unanswered.filter((u) => u.status === 'pending').length}
          />

          <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-6xl w-full mx-auto">
            {adminTab === 'documents' && (
              <DocumentList
                documents={documents}
                onOpenUpload={() => setShowUploadModal(true)}
                onDeleteDocument={handleDeleteDoc}
                onReprocessDocument={handleReprocessDoc}
              />
            )}

            {adminTab === 'queries' && <QueryHistory queries={queries} />}

            {adminTab === 'unanswered' && (
              <UnansweredQueue
                unanswered={unanswered}
                onResolve={handleResolveUnanswered}
              />
            )}

            {adminTab === 'faqs' && (
              <FaqManager
                faqs={faqs}
                onAddFaq={handleAddFaq}
                onDeleteFaq={handleDeleteFaq}
              />
            )}

            {adminTab === 'logs' && (
              <SecurityLogs logs={securityLogs} onRefresh={loadAdminData} />
            )}
          </main>
        </div>
      )}

      {/* Direct Staff Inquiry Modal */}
      <AskStaffDialog
        isOpen={showAskStaff}
        onClose={() => setShowAskStaff(false)}
        onSubmit={handleAskStaffSubmit}
      />

      {/* Document Upload Modal */}
      <DocumentUploadDialog
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={() => {
          showToast('Document uploaded, validated, and indexed into knowledge base!', 'success');
          loadAdminData();
        }}
      />

      {/* Export Conversation Record Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        messages={messages}
        currentUser={currentUser}
        sessionId={sessionId}
      />
    </div>
  );
}

import React from 'react';
import { FileText, HelpCircle, AlertTriangle, Star, ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export type AdminTab = 'documents' | 'queries' | 'unanswered' | 'faqs' | 'logs';

interface AdminNavProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onBackToChat: () => void;
  onLogout: () => void;
  unansweredCount: number;
}

export const AdminNav: React.FC<AdminNavProps> = ({
  currentTab,
  onSelectTab,
  onBackToChat,
  onLogout,
  unansweredCount,
}) => {
  const navItems: { tab: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { tab: 'queries', label: 'Query History', icon: <HelpCircle className="w-4 h-4" /> },
    {
      tab: 'unanswered',
      label: 'Unanswered Queue',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: unansweredCount > 0 ? unansweredCount : undefined,
    },
    { tab: 'faqs', label: 'FAQ Directory', icon: <Star className="w-4 h-4" /> },
    { tab: 'logs', label: 'Security & Audit', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--rule)] p-4 sm:p-5 flex flex-col shrink-0 min-h-screen">
      {/* Brand & Back Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBackToChat}
          className="text-[13px] text-[var(--marine)] hover:text-[var(--marine-deep)] font-medium font-sans flex items-center gap-1.5 mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </button>
        <h1 className="text-[22px] font-[600] font-serif text-[var(--ink)] tracking-tight">
          CampusAsk Admin
        </h1>
        <p className="text-[12px] text-[var(--ink-soft)] font-sans mt-0.5">
          Knowledge Base & Audit Console
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onSelectTab(item.tab)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-[4px] text-[14px] font-sans font-medium transition-colors text-left cursor-pointer
                ${
                  isActive
                    ? 'bg-[var(--marine)] text-white shadow-xs'
                    : 'text-[var(--ink)] hover:bg-[var(--marine-wash)] hover:text-[var(--marine-deep)]'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[var(--marine)]' : 'bg-red-100 text-[var(--brick)]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer & Logout */}
      <div className="pt-4 border-t border-[var(--rule)] space-y-2">
        <div className="px-3 py-2 bg-[var(--paper)] rounded-[4px]">
          <p className="text-[11px] text-[var(--ink-soft)] font-sans">Role</p>
          <p className="text-[13px] font-medium text-[var(--ink)] font-sans">Super Administrator</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full text-center px-3 py-2 text-[14px] text-[var(--brick)] hover:bg-red-50 rounded-[4px] font-medium font-sans flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

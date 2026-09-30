import React, { useState } from 'react';
import { SecurityEvent } from '../../types';
import { ShieldCheck, AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react';

interface SecurityLogsProps {
  logs: SecurityEvent[];
  onRefresh: () => void;
}

export const SecurityLogs: React.FC<SecurityLogsProps> = ({ logs, onRefresh }) => {
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filteredLogs = logs.filter((l) => {
    if (levelFilter === 'all') return true;
    return l.level === levelFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-[600] font-serif text-[var(--ink)]">
            Security & Audit Event Log
          </h2>
          <p className="text-[14px] text-[var(--ink-soft)] font-sans">
            Real-time audit records for rate limiting, injection defenses, PII detection, and admin authentication.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
          >
            <option value="all">All Severity Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 border border-[var(--rule)] rounded-[4px] hover:bg-[var(--paper)] text-[var(--marine)] cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Principles Banner */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-[8px] p-4 text-[13px] text-[var(--ink)] font-sans space-y-1">
        <p className="font-semibold text-[var(--marine)] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          Active Security Defenses
        </p>
        <p className="text-[var(--ink-soft)]">
          • Strict Prompt Delimiting: All candidate chunks are isolated inside unexecutable boundaries.
          <br />• Data Protection Policy: Queries with sensitive keywords are scrubbed and forbidden fields redacted.
          <br />• API Throttling: Student chat is capped at 25 req/min per IP to prevent scraping and abuse.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-[var(--surface)] rounded-[8px] border border-[var(--rule)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-[var(--paper)] border-b border-[var(--rule)] text-[12px] font-medium text-[var(--ink-soft)] uppercase tracking-wider">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)] text-[13px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--ink-soft)]">
                    No security events logged under this filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--marine-wash)]/30 font-mono">
                    <td className="py-3 px-4">
                      {log.level === 'critical' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brick)] bg-red-100 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3.5 h-3.5" /> CRITICAL
                        </span>
                      ) : log.level === 'warning' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--amber-ink)] bg-amber-100 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3.5 h-3.5" /> WARNING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--marine)] bg-sky-100 px-2 py-0.5 rounded">
                          <Info className="w-3.5 h-3.5" /> INFO
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-[var(--ink)]">
                      {log.event}
                    </td>

                    <td className="py-3 px-4 text-[var(--ink-soft)]">
                      {log.ip}
                    </td>

                    <td className="py-3 px-4 text-[var(--ink-soft)] max-w-sm truncate" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </td>

                    <td className="py-3 px-4 text-right text-[12px] text-[var(--ink-soft)]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

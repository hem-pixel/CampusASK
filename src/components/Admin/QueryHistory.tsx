import React, { useState } from 'react';
import { QueryRecord } from '../../types';
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Clock, Search } from 'lucide-react';

interface QueryHistoryProps {
  queries: QueryRecord[];
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({ queries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnswerable, setFilterAnswerable] = useState<string>('all');

  const filtered = queries.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAnswerable =
      filterAnswerable === 'all'
        ? true
        : filterAnswerable === 'answered'
        ? q.answerable
        : !q.answerable;
    return matchesSearch && matchesAnswerable;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-[600] font-serif text-[var(--ink)]">
          Student Query Audit Trail
        </h2>
        <p className="text-[14px] text-[var(--ink-soft)] font-sans">
          Logs of student questions, citation counts, response latency, and helpfulness metrics.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[var(--surface)] p-3 rounded-[6px] border border-[var(--rule)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search query text…"
            className="w-full pl-9 pr-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
          />
        </div>

        <select
          value={filterAnswerable}
          onChange={(e) => setFilterAnswerable(e.target.value)}
          className="px-3 py-2 text-[14px] font-sans border border-[var(--rule)] rounded-[4px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--marine)]"
        >
          <option value="all">All Outcomes</option>
          <option value="answered">Answered with Citations</option>
          <option value="unanswered">Sent to Unanswered Queue</option>
        </select>
      </div>

      {/* Query Table */}
      <div className="bg-[var(--surface)] rounded-[8px] border border-[var(--rule)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--paper)] border-b border-[var(--rule)] text-[12px] font-medium font-sans text-[var(--ink-soft)] uppercase tracking-wider">
                <th className="py-3 px-4">Student Question</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Citations</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Student Feedback</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)] text-[14px] font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--ink-soft)]">
                    No query records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--marine-wash)]/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[var(--ink)] max-w-xs break-words">
                      {item.question}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[12px] px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] border border-[var(--rule)]">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.answerable ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--moss)] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Grounded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--brick)] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Out of Scope</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[13px] text-[var(--ink-soft)] font-mono">
                      {item.sourcesCount} {item.sourcesCount === 1 ? 'slip' : 'slips'}
                    </td>

                    <td className="py-3.5 px-4 text-[13px] text-[var(--ink-soft)]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--marine)]" />
                        <span>{item.responseLatencyMs}ms</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.feedback === 'helpful' ? (
                        <span className="inline-flex items-center gap-1 text-[12px] text-[var(--moss)] font-semibold">
                          <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                        </span>
                      ) : item.feedback === 'unhelpful' ? (
                        <span className="inline-flex items-center gap-1 text-[12px] text-[var(--brick)] font-semibold">
                          <ThumbsDown className="w-3.5 h-3.5" /> Not helpful
                        </span>
                      ) : (
                        <span className="text-[12px] text-[var(--ink-soft)]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[12px] text-[var(--ink-soft)] font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

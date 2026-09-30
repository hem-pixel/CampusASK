import React from 'react';

interface StudentMessageProps {
  text: string;
  timestamp?: string;
}

export const StudentMessage: React.FC<StudentMessageProps> = ({ text, timestamp }) => {
  return (
    <div className="flex justify-end mb-5">
      <div className="max-w-[85%] sm:max-w-[75%] rounded-[10px] bg-[var(--marine-wash)] px-4 py-3 shadow-xs">
        <p className="text-[15px] font-sans text-[var(--ink)] leading-[22px] break-words">
          {text}
        </p>
        {timestamp && (
          <p className="text-[11px] text-[var(--ink-soft)] text-right mt-1">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

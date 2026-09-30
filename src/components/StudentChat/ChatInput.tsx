import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, AlertCircle, Sparkles, X, Volume2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const SAMPLE_VOICE_QUERIES = [
  'When does course registration close for exams?',
  'What is the attendance requirement for hall tickets?',
  'What scholarship is awarded for 90% or above in admissions?',
  'Where is the Computer Science HOD office located?',
];

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const simulationTimerRef = useRef<any>(null);

  // Auto-dismiss permission banner after 8 seconds
  useEffect(() => {
    if (permissionNotice) {
      const timer = setTimeout(() => {
        setPermissionNotice(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [permissionNotice]);

  // Initialize Web Speech API recognition instance safely
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionNotice(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setText(transcript);
        adjustTextareaHeight();
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionNotice(
            'Microphone access is restricted by your browser or preview sandbox. You can enable microphone permissions in your site settings, or use the simulated voice dictation below.'
          );
        } else if (event.error === 'no-speech') {
          // Normal pause, silence
        } else {
          setPermissionNotice(`Voice capture note: ${event.error}. You can also type or use simulated voice input.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, []);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${Math.max(newHeight, 44)}px`;
    }
  };

  // Simulate realistic voice dictation streaming when hardware mic is sandboxed
  const runVoiceSimulation = (queryToSimulate?: string) => {
    const chosenQuery =
      queryToSimulate ||
      SAMPLE_VOICE_QUERIES[Math.floor(Math.random() * SAMPLE_VOICE_QUERIES.length)];

    setPermissionNotice(null);
    setIsSimulating(true);
    setIsListening(true);
    setText('');

    let charIndex = 0;
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }

    simulationTimerRef.current = setInterval(() => {
      charIndex += Math.floor(Math.random() * 3) + 1;
      if (charIndex >= chosenQuery.length) {
        setText(chosenQuery);
        adjustTextareaHeight();
        clearInterval(simulationTimerRef.current);
        setIsSimulating(false);
        setIsListening(false);
      } else {
        setText(chosenQuery.slice(0, charIndex));
        adjustTextareaHeight();
      }
    }, 45);
  };

  // Primary toggle handler for microphone button
  const toggleListening = async () => {
    if (isListening || isSimulating) {
      // Stop ongoing voice capture or simulation
      if (isSimulating) {
        clearInterval(simulationTimerRef.current);
        setIsSimulating(false);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      setIsListening(false);
      return;
    }

    // If Web Speech API is not supported in the browser
    if (!speechSupported) {
      runVoiceSimulation();
      return;
    }

    // Try requesting user media permission first to properly prompt in browser
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release hardware stream since SpeechRecognition handles recognition
        stream.getTracks().forEach((track) => track.stop());
      } catch (mediaErr: any) {
        console.warn('getUserMedia check:', mediaErr);
        if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'SecurityError') {
          setPermissionNotice(
            'Microphone access is restricted by your browser or preview sandbox. You can enable microphone permissions in your site settings, or click below to simulate voice dictation.'
          );
          return;
        }
      }
    }

    // Start native Web Speech recognition
    try {
      setPermissionNotice(null);
      recognitionRef.current?.start();
    } catch (startErr: any) {
      console.warn('SpeechRecognition start failed:', startErr);
      // If native recognition fails due to sandboxing or busy state, fall back to simulation
      setPermissionNotice(
        'Microphone is unavailable in this environment. Use simulated voice dictation or type your inquiry.'
      );
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    setText(value);
    adjustTextareaHeight();
    if (permissionNotice) {
      setPermissionNotice(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isListening || isSimulating) {
      if (isSimulating) {
        clearInterval(simulationTimerRef.current);
        setIsSimulating(false);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      setIsListening(false);
    }

    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--rule)] p-3 sm:p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] z-20">
      <div className="max-w-3xl mx-auto">
        {/* Active Listening / Voice Dictation Indicator */}
        {isListening && (
          <div className="mb-2.5 px-3.5 py-2 bg-red-50/90 border border-red-200 rounded-[8px] flex items-center justify-between text-[12px] font-sans text-[var(--brick)] shadow-xs animate-fade-in-answer">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="font-semibold text-[13px]">
                {isSimulating ? 'Simulating voice dictation…' : 'Listening to microphone input…'}
              </span>
              <span className="hidden sm:inline text-slate-500">
                {isSimulating ? 'Transcribing spoken query…' : 'Speak clearly into your microphone'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="inline-block w-1 h-3.5 bg-red-500 rounded-full animate-pulse" />
                <span className="inline-block w-1 h-5 bg-red-600 rounded-full animate-pulse delay-75" />
                <span className="inline-block w-1 h-2.5 bg-red-400 rounded-full animate-pulse delay-150" />
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="ml-2 px-2.5 py-1 bg-white text-[var(--brick)] border border-red-200 hover:bg-red-100 rounded-[4px] font-medium transition-colors cursor-pointer text-[11px]"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {/* Intelligent Permission / Fallback Notice Banner */}
        {permissionNotice && (
          <div className="mb-2.5 p-3 bg-amber-50/95 border border-amber-200 rounded-[8px] text-[12px] font-sans text-amber-900 shadow-xs animate-fade-in-answer">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="leading-snug">{permissionNotice}</p>
              </div>
              <button
                type="button"
                onClick={() => setPermissionNotice(null)}
                className="text-amber-700 hover:text-amber-900 p-0.5 rounded cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Pills: Instant Voice Simulation */}
            <div className="mt-2.5 pt-2 border-t border-amber-200/70 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                Quick Test Voice:
              </span>
              <button
                type="button"
                onClick={() => runVoiceSimulation()}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-[4px] font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>⚡ Simulate Voice Dictation</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  runVoiceSimulation('When does course registration close for exams?')
                }
                className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-[4px] text-[11px] transition-colors cursor-pointer truncate max-w-[200px]"
              >
                "When is exam registration?"
              </button>

              <button
                type="button"
                onClick={() =>
                  runVoiceSimulation('What is the attendance requirement for hall tickets?')
                }
                className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-[4px] text-[11px] transition-colors cursor-pointer truncate max-w-[200px]"
              >
                "Attendance requirement?"
              </button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Main Input Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={
                isListening
                  ? isSimulating
                    ? 'Transcribing voice input…'
                    : 'Listening… speak your inquiry into the microphone'
                  : 'Ask about exams, admissions, departments, events, policies…'
              }
              rows={1}
              aria-label="Student question input"
              style={{ fontSize: '16px' }}
              className={`w-full resize-none px-4 py-3 text-[16px] font-sans rounded-[4px] border text-[var(--ink)] placeholder-[var(--ink-soft)] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marine)] focus-visible:border-[var(--marine)] transition-all min-h-[44px] ${
                isListening ? 'border-red-400 ring-1 ring-red-300' : 'border-[var(--rule)]'
              }`}
            />
          </div>

          {/* Microphone Capture Button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            aria-label={isListening ? 'Stop audio recording' : 'Capture question via microphone voice input'}
            title={
              isListening
                ? 'Stop recording'
                : 'Click to speak question via microphone (or simulate voice dictation)'
            }
            className={`h-[44px] w-[44px] shrink-0 rounded-[4px] flex items-center justify-center transition-all cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isListening
                ? 'bg-red-600 text-white animate-mic-ripple focus-visible:outline-red-600'
                : 'bg-white hover:bg-[var(--marine-wash)] text-[var(--marine)] border border-[var(--rule)] hover:border-[var(--marine)] focus-visible:outline-[var(--marine)]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 animate-pulse" aria-hidden="true" />
            ) : (
              <Mic className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="h-[44px] w-[44px] shrink-0 bg-[var(--marine)] text-white rounded-[4px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--marine-deep)] active:scale-95 transition-all cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--marine)]"
            aria-label="Send question to helpdesk"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};

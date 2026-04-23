'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME: Message = {
  id: '0',
  role: 'assistant',
  content: "Hi! I'm Jesica, your MedCare Health assistant. How can I help you today? 😊",
  timestamp: new Date(),
};

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() },
    ]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('https://jesica-chatbot.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error('api-error');
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: data.response, timestamp: new Date() },
      ]);
    } catch {
      clearTimeout(timer);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm temporarily unavailable. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style>{`
        @keyframes jesica-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .jesica-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #718096; display: inline-block;
          animation: jesica-bounce 1.2s ease-in-out infinite;
        }
        .jesica-dot:nth-child(2) { animation-delay: 0.2s; }
        .jesica-dot:nth-child(3) { animation-delay: 0.4s; }
        .jesica-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,184,148,0.5) !important; }
        .jesica-send:hover:not(:disabled) { background: #00a381 !important; }
      `}</style>

      {/* Floating action button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="jesica-fab"
        aria-label={isOpen ? 'Close chat' : 'Open chat with Jesica'}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: '#00b894', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,184,148,0.4)',
          zIndex: 1001, transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15c0 .53-.21 1.04-.59 1.41-.37.38-.88.59-1.41.59H7l-4 4V5c0-.53.21-1.04.59-1.41C3.96 3.21 4.47 3 5 3h14c.53 0 1.04.21 1.41.59.38.37.59.88.59 1.41v10z"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', bottom: 92, right: 24,
            width: 380, height: 520,
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column',
            background: '#fff', zIndex: 1000,
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              👩‍⚕️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Jesica</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>MedCare AI Assistant</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%',
                background: '#55efc4', boxShadow: '0 0 0 2px rgba(255,255,255,0.4)',
              }}/>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>Online</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 12,
            background: '#f8fafc',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', fontSize: 14, lineHeight: 1.5,
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#1a365d' : '#e2e8f0',
                  color: msg.role === 'user' ? '#fff' : '#2d3748',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
                <span style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                  background: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 13, color: '#718096' }}>Jesica is typing</span>
                  <span style={{ display: 'flex', gap: 4, marginLeft: 2 }}>
                    <span className="jesica-dot"/>
                    <span className="jesica-dot"/>
                    <span className="jesica-dot"/>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input area */}
          <div style={{
            padding: '10px 14px', borderTop: '1px solid #e2e8f0',
            background: '#fff', display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask Jesica anything..."
              style={{
                flex: 1, border: '1px solid #e2e8f0', borderRadius: 24,
                padding: '9px 16px', fontSize: 14, outline: 'none',
                background: isLoading ? '#f7fafc' : '#fff',
                color: '#2d3748', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#00b894')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="jesica-send"
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: isLoading || !input.trim() ? '#cbd5e0' : '#00b894',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.2s',
              }}
              aria-label="Send message"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

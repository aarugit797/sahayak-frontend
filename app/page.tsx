'use client';

import { useState, useRef, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  cached?: boolean;
  status?: string[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessages(prev => [...prev, { role: 'assistant', content: '', status: [] }]);

    try {
      const response = await fetch(`${API_URL}/api/query/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, language })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));

            if (data.type === 'status') {
              setMessages(prev => {
                const updated = [...prev];
                const last = { ...updated[updated.length - 1] };
                last.status = [...(last.status || []), data.content];
                updated[updated.length - 1] = last;
                return updated;
              });
            } else if (data.type === 'token') {
              setMessages(prev => {
                const updated = [...prev];
                const last = { ...updated[updated.length - 1] };
                last.content += data.content;
                updated[updated.length - 1] = last;
                return updated;
              });
            } else if (data.type === 'done') {
              setMessages(prev => {
                const updated = [...prev];
                const last = { ...updated[updated.length - 1] };
                last.cached = data.cached;
                updated[updated.length - 1] = last;
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please try again.'
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sahayak</h1>
          <p className="text-xs text-gray-500">AI assistant for Mumbai gig workers</p>
        </div>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 bg-white text-gray-700"
        >
          <option value="auto">Auto detect</option>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="mr">मराठी</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
            <div className="text-5xl">🤝</div>
            <p className="text-lg font-medium text-gray-600">Namaste! How can I help you?</p>
            <p className="text-sm">Ask about wages, rights, jobs, or government schemes</p>
            <div className="grid grid-cols-1 gap-2 mt-4 w-full max-w-sm">
              {[
                'What is the minimum wage in Mumbai?',
                'What schemes exist for delivery workers?',
                'Are there gig jobs available in Mumbai?',
                'What are my rights as a gig worker?'
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left text-sm bg-white border rounded-xl px-4 py-3 text-gray-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              {msg.role === 'user' ? (
                <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-white border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  {msg.status && msg.status.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {msg.status.map((s, j) => (
                        <div key={j} className="text-xs text-gray-400 flex items-center gap-1">
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.content ? (
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  ) : (
                    loading && i === messages.length - 1 && (
                      <div className="flex gap-1 py-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )
                  )}
                  {msg.cached !== undefined && (
                    <div className={`mt-1 text-xs ${msg.cached ? 'text-green-500' : 'text-gray-400'}`}>
                      {msg.cached ? '⚡ cached' : '🤖 generated'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t px-4 py-3">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your rights, wages, jobs..."
            rows={1}
            className="flex-1 resize-none border rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-5 py-3 rounded-2xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Sahayak — AI assistant for Mumbai gig workers
        </p>
      </div>
    </div>
  );
}
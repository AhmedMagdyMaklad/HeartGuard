import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { brandAssets } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count?: number;
}

const suggestedPrompts = [
  'What foods are good for my heart?',
  'How much exercise do I need weekly?',
  'What are early signs of heart disease?',
  'How does stress affect the heart?',
  'Is high blood pressure dangerous?',
  'Can I reverse heart disease with diet?',
];

function formatTime(iso?: string): string {
  if (!iso) return 'Just now';
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatSessionDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ChatbotPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitialising, setIsInitialising] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : user?.email?.split('@')[0] ?? 'User';
  const initial = user?.full_name
    ? user.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/sessions', { credentials: 'include' });
      const data = await res.json();
      setSessions(data.sessions || []);
      return data.sessions as ChatSession[];
    } catch {
      return [] as ChatSession[];
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages?session_id=${sessionId}`, { credentials: 'include' });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const createNewSession = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      return data.session?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  // On mount: load sessions + create a fresh new session
  useEffect(() => {
    const init = async () => {
      await loadSessions();
      const newId = await createNewSession();
      if (newId) {
        setCurrentSessionId(newId);
        setMessages([]);
        await loadSessions(); // refresh list to show new session
      }
      setIsInitialising(false);
    };
    init();
  }, []);

  const handleNewConversation = async () => {
    setSidebarOpen(false);
    const newId = await createNewSession();
    if (!newId) return;
    setCurrentSessionId(newId);
    setMessages([]);
    setInputText('');
    await loadSessions();
  };

  const handleSwitchSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) { setSidebarOpen(false); return; }
    setSidebarOpen(false);
    setCurrentSessionId(sessionId);
    await loadMessages(sessionId);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setDeletingId(sessionId);
    try {
      await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE', credentials: 'include' });
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);

      if (sessionId === currentSessionId) {
        // If deleting current session, start a new one
        const newId = await createNewSession();
        if (newId) {
          setCurrentSessionId(newId);
          setMessages([]);
          await loadSessions();
        }
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleSend = async (text?: string) => {
    const content = (text ?? inputText).trim();
    if (!content || isSending || !currentSessionId) return;

    const optimistic: Message = { role: 'user', content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, session_id: currentSessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, data.message]);
      // Refresh sidebar so title updates from auto-title
      loadSessions();
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I could not process your message. Please try again.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const pastSessions = sessions.filter(s => s.id !== currentSessionId && Number(s.message_count) > 0);

  const Sidebar = (
    <aside className={`
      w-72 flex-shrink-0 border-r border-primary/10 bg-white dark:bg-slate-950 flex flex-col
      md:relative md:translate-x-0 md:flex
      ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'fixed -translate-x-full inset-y-0 left-0 z-50 md:translate-x-0'}
      transition-transform duration-300
    `}>
      {/* Logo */}
      <div className="p-6 border-b border-primary/5 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer mb-5" onClick={() => navigate('/dashboard')}>
          <div className="size-9 flex items-center justify-center">
            <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-primary text-lg font-bold leading-tight">HeartGuard</h1>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Heart Health AI</p>
          </div>
        </div>

        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-3 px-4 font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] text-sm"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Conversation
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Current session */}
        {currentSession && (
          <div className="px-3 mb-1">
            <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Chat</p>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/8 border border-primary/15 text-primary">
              <span className="material-symbols-outlined text-base shrink-0">chat</span>
              <span className="text-xs font-semibold truncate flex-1">{currentSession.title}</span>
            </div>
          </div>
        )}

        {/* Past sessions */}
        {pastSessions.length > 0 && (
          <div className="px-3 mt-4">
            <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">History</p>
            <div className="space-y-0.5">
              {pastSessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => handleSwitchSession(session.id)}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-slate-400 shrink-0">chat_bubble_outline</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{session.title}</p>
                    <p className="text-[10px] text-slate-400">{formatSessionDate(session.updated_at)}</p>
                  </div>
                  <button
                    onClick={e => handleDeleteSession(e, session.id)}
                    disabled={deletingId === session.id}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 hover:text-red-500 text-slate-400 transition-all shrink-0"
                    title="Delete conversation"
                  >
                    {deletingId === session.id
                      ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      : <span className="material-symbols-outlined text-base">delete_outline</span>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pastSessions.length === 0 && !currentSession && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-2">
            <span className="material-symbols-outlined text-3xl text-slate-200 dark:text-slate-700">history</span>
            <p className="text-xs text-slate-400">No past conversations yet</p>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="p-4 border-t border-primary/5 shrink-0">
        <div
          className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={async () => { await logout(); navigate('/login'); }}
        >
          <div className="relative">
            <div className="size-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
              {initial}
            </div>
            <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{firstName}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors text-lg" title="Sign out">logout</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex w-full overflow-hidden" style={{ height: '100dvh' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-shrink-0 md:flex-col border-r border-primary/10 bg-white dark:bg-slate-950">
        {Sidebar}
      </div>
      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {Sidebar}
      </div>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark relative overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-16 shrink-0 border-b border-primary/5 px-4 md:px-6 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 -ml-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="size-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Heart Health AI</h2>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold uppercase">Online</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                {currentSession && currentSession.title !== 'New Conversation'
                  ? currentSession.title
                  : 'Ask me anything about cardiovascular health'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <ThemeToggle />
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-5 max-w-3xl mx-auto w-full">

          {(isInitialising || isLoadingMessages) && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          )}

          {!isInitialising && !isLoadingMessages && messages.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-10 text-center gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Hello, {firstName}!</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm leading-relaxed">
                  Ask me anything about heart health — diet, exercise, symptoms, medications, or how to lower your cardiovascular risk.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-lg">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="px-3 py-2 rounded-full border border-primary/20 bg-white dark:bg-slate-800 text-primary text-xs font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}
              >
                <div className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'assistant' ? 'bg-red-50' : 'bg-primary'}`}>
                  {msg.role === 'assistant'
                    ? <span className="material-symbols-outlined text-red-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    : <span className="text-white font-bold text-[11px]">{initial}</span>}
                </div>
                <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'assistant' ? 'bg-white dark:bg-slate-800 rounded-tl-none border border-slate-100 dark:border-slate-700' : 'bg-primary text-white rounded-tr-none shadow-primary/20'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed prose-chat">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-slate-100">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 text-slate-900 dark:text-slate-100">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1 text-slate-900 dark:text-slate-100">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-slate-800 dark:text-slate-200">{children}</h3>,
                            code: ({ children }) => <code className="bg-slate-100 dark:bg-slate-700 text-xs px-1.5 py-0.5 rounded font-mono text-primary">{children}</code>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 pl-3 my-2 text-slate-500 dark:text-slate-400 italic">{children}</blockquote>,
                            hr: () => <hr className="my-3 border-slate-200 dark:border-slate-600" />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  <p className={`text-[10px] text-slate-400 ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                    {msg.role === 'assistant' ? 'Heart Health AI' : 'You'} · {formatTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isSending && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[88%]"
            >
              <div className="size-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 px-5 py-4 flex items-center gap-1.5 shadow-sm">
                {[0, 0.18, 0.36].map(d => (
                  <motion.div key={d} className="w-2 h-2 bg-primary/50 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: d }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 md:px-8 pb-5 md:pb-7 pt-2 max-w-3xl mx-auto w-full">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-primary/10 shadow-xl shadow-primary/5 p-1.5 flex items-center gap-2 focus-within:ring-2 ring-primary/20 transition-all">
            <input
              className="flex-1 border-none focus:ring-0 text-sm bg-transparent placeholder:text-slate-400 py-3 px-3 outline-none"
              placeholder="Ask a heart health question..."
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending || isInitialising}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isSending || isInitialising}
              className={`size-10 rounded-xl flex items-center justify-center transition-all shadow-md ${inputText.trim() && !isSending ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:scale-105 active:scale-95' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 shadow-none'}`}
            >
              <span className="material-symbols-outlined text-lg ml-0.5">send</span>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest hidden sm:block">
            For informational purposes only — always consult a doctor for medical advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatbotPage;

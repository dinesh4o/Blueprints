import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, FileText, Send, Loader2, Sparkles,
  User, ArrowLeft, Paperclip, Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const N8N_WEBHOOK = 'https://testphaseluvara.app.n8n.cloud/webhook/b69ab6d2-ccaf-4ab9-9a35-60393b98f745/chat';

interface Message { role: 'user' | 'assistant'; content: string; }
interface UploadedFile { name: string; size: number; base64: string; }

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const STARTERS = [
  'Summarize the key findings',
  'What methodology was used?',
  'List all drugs or compounds mentioned',
  'What are the clinical conclusions?',
  'What are the study limitations?',
];

export default function RAGChatPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [input]);

  const processFiles = useCallback(async (raw: FileList | File[]) => {
    const pdfs = Array.from(raw).filter(f => f.type === 'application/pdf');
    if (!pdfs.length) { setError('Only PDF files are supported.'); return; }
    setError('');
    setUploading(true);
    try {
      const encoded: UploadedFile[] = await Promise.all(
        pdfs.map(async f => ({ name: f.name, size: f.size, base64: await toBase64(f) }))
      );
      setFiles(prev => {
        const seen = new Set(prev.map(p => p.name));
        return [...prev, ...encoded.filter(e => !seen.has(e.name))];
      });
      if (!messages.length) {
        setMessages([{ role: 'assistant', content: `Ready. I've loaded **${pdfs.map(f => f.name).join(', ')}**. What would you like to know?` }]);
      }
    } catch { setError('Failed to process file. Please try again.'); }
    finally { setUploading(false); }
  }, [messages.length]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    if (files.length === 1) setMessages([]);
  };

  const send = async (e: React.FormEvent | React.KeyboardEvent, quick?: string) => {
    e.preventDefault();
    const text = (quick || input).trim();
    if (!text || loading) return;
    if (!files.length) { setError('Upload a PDF first.'); return; }
    setError('');
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          files: files.map(f => ({ name: f.name, type: 'application/pdf', data: f.base64 })),
          history: messages.slice(-10),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('text/event-stream')) {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        let buf = '', reply = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n'); buf = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const d = line.slice(6).trim();
            if (d === '[DONE]') break;
            try {
              const p = JSON.parse(d);
              const token = p.text || p.content || p.token || '';
              if (token) { reply += token; setMessages(prev => { const m = [...prev]; m[m.length-1] = { role:'assistant', content: reply }; return m; }); }
            } catch { /* skip */ }
          }
        }
      } else {
        const data = await res.json();
        const reply = data.output || data.text || data.message || data.response || (Array.isArray(data) && data[0]?.text) || JSON.stringify(data);
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Could not reach the RAG service — ${err?.message || 'network error'}.` }]);
    } finally { setLoading(false); }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
  };

  const empty = messages.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_30%,transparent_100%)]" />

      <header className="relative z-20 shrink-0 flex items-center gap-4 px-6 h-14 border-b border-zinc-800/60">
        <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-sm bg-black" />
          </div>
          <span className="text-sm font-semibold text-zinc-100 tracking-tight">Research RAG</span>
          <span className="text-zinc-700 text-sm">/</span>
          <span className="text-xs text-zinc-500">PDF Intelligence</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {files.length > 0 && (
            <span className="text-[11px] text-zinc-500 border border-zinc-800 rounded-full px-2.5 py-1">
              {files.length} PDF{files.length > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <Paperclip size={11} /> Upload PDF
          </button>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-zinc-800/60 p-4 gap-3">
          <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Documents</p>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-5 cursor-pointer transition-all duration-200 text-center text-xs',
              dragOver ? 'border-zinc-600 bg-zinc-900/60 text-zinc-300' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-500'
            )}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="leading-snug">{uploading ? 'Processing' : 'Drop PDF or click'}</span>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 min-h-0">
            <AnimatePresence>
              {files.map(f => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  className="group flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2"
                >
                  <FileText size={12} className="text-zinc-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-300 truncate">{f.name}</p>
                    <p className="text-[10px] text-zinc-700">{fmt(f.size)}</p>
                  </div>
                  <button onClick={() => removeFile(f.name)} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-rose-400 transition-all">
                    <X size={11} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {files.length === 0 && <p className="text-[11px] text-zinc-800 text-center mt-3">No files loaded</p>}
          </div>
          {files.length > 0 && (
            <button onClick={() => { setFiles([]); setMessages([]); }} className="flex items-center justify-center gap-1 text-[11px] text-zinc-700 hover:text-rose-500 transition-colors">
              <Trash2 size={10} /> Clear all
            </button>
          )}
        </aside>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12">
            {empty ? (
              <div className="flex flex-col items-center justify-center h-full gap-8 max-w-lg mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-5">
                    <Sparkles size={18} className="text-zinc-400" />
                  </div>
                  <h1 className="text-xl font-semibold text-zinc-100 mb-2 tracking-tight">Research PDF Intelligence</h1>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Upload a research paper or clinical study PDF, then ask any question about it.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="lg:hidden w-full"
                >
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                      'flex flex-col items-center gap-2 border border-dashed rounded-xl py-8 cursor-pointer transition-all text-sm',
                      dragOver ? 'border-zinc-600 text-zinc-300 bg-zinc-900/50' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                    )}
                  >
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <span>{uploading ? 'Processing' : 'Tap to upload PDF'}</span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                  className="w-full flex flex-col gap-1.5"
                >
                  <p className="text-[11px] text-zinc-700 uppercase tracking-wider mb-1">Suggested questions</p>
                  {STARTERS.map((q, i) => (
                    <button
                      key={i}
                      onClick={e => {
                        if (!files.length) { setError('Upload a PDF first.'); return; }
                        send(e as any, q);
                      }}
                      className="text-left text-sm text-zinc-500 hover:text-zinc-200 border border-zinc-800/70 hover:border-zinc-700 rounded-lg px-4 py-2.5 transition-all bg-zinc-900/30 hover:bg-zinc-900/60"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto flex flex-col gap-6">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                    >
                      <div className={clsx(
                        'w-7 h-7 rounded-full shrink-0 flex items-center justify-center border',
                        msg.role === 'user'
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      )}>
                        {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
                      </div>
                      <div className={clsx(
                        'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm'
                          : 'bg-zinc-900/80 border border-zinc-800/60 text-zinc-300 rounded-tl-sm [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>h1]:text-sm [&>h1]:font-bold [&>h2]:text-sm [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium [&>strong]:text-zinc-200 [&>code]:text-xs [&>code]:bg-zinc-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded'
                      )}>
                        {msg.role === 'user' ? msg.content : (
                          <>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {msg.content === '' && loading && (
                              <span className="inline-flex gap-1 items-center">
                                <span className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" />
                                <span className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0.15s' }} />
                                <span className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0.3s' }} />
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mx-6 md:mx-12 mb-2 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/8 border border-rose-500/20 rounded-lg px-4 py-2"
              >
                <span className="flex-1">{error}</span>
                <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-400"><X size={11} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="shrink-0 px-6 md:px-12 pb-6 pt-3 border-t border-zinc-800/60">
            {files.length > 0 && (
              <div className="lg:hidden flex gap-1.5 mb-2 overflow-x-auto pb-1">
                {files.map(f => (
                  <div key={f.name} className="shrink-0 flex items-center gap-1 text-[11px] bg-zinc-900/60 border border-zinc-800 rounded-full px-2.5 py-1 text-zinc-500">
                    <FileText size={9} className="text-zinc-600" />
                    <span className="max-w-[90px] truncate">{f.name}</span>
                    <button onClick={() => removeFile(f.name)} className="text-zinc-700 hover:text-rose-400 ml-0.5"><X size={9} /></button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={send} className="flex gap-2 items-end max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="lg:hidden shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <Paperclip size={14} />
              </button>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  disabled={loading}
                  placeholder={files.length ? 'Ask anything about your document' : 'Upload a PDF to begin'}
                  className="w-full resize-none bg-zinc-900/80 border border-zinc-800 focus:border-zinc-700 focus:ring-0 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-colors disabled:opacity-40 max-h-36 leading-relaxed"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim() || !files.length}
                className={clsx(
                  'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                  !loading && input.trim() && files.length
                    ? 'bg-zinc-100 hover:bg-white text-zinc-900'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-700 cursor-not-allowed'
                )}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
              </button>
            </form>
            <p className="text-center text-[11px] text-zinc-800 mt-2 max-w-2xl mx-auto">
              Enter to send  Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Sparkles, LayoutGrid, Command, Search as SearchIcon, Shield, TrendingUp, Menu, X, History, ChevronRight, FileText, Database, Activity, FlaskConical, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LiquidBackground } from "@/components/LiquidBackground";
import { ShaderButton } from "@/components/ui/ShaderButton";
import { VoiceSearch } from "@/components/VoiceSearch";
import { ParticleConstellation } from "@/components/ParticleConstellation";

function FloatingCard({
  icon: Icon,
  title,
  className,
  delay = 0,
  floatDuration = 5,
  yOffset = 12
}: {
  icon: any;
  title: string;
  className: string;
  delay?: number;
  floatDuration?: number;
  yOffset?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={`absolute hidden lg:block z-0 pointer-events-none ${className}`}
    >
      <motion.div
        animate={{ y: [0, -yOffset, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay }}
        className="flex items-center gap-3 bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-2xl p-3.5 shadow-2xl"
      >
        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700">
          <Icon size={18} />
        </div>
        <span className="font-medium text-sm text-zinc-200 whitespace-nowrap">{title}</span>
      </motion.div>
    </motion.div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [molecules, setMolecules] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // Detect if input looks like a natural language prompt vs a molecule name
  const isPromptMode = (() => {
    const text = query.trim();
    if (!text || molecules.length > 0) return false;
    const words = text.split(/\s+/);
    // Single word is always molecule mode (e.g. "Aspirin", "Metformin")
    if (words.length === 1) return false;
    // 2+ words: check for known multi-word drug patterns first
    // Common multi-word drug names: "Valproic Acid", "Folic Acid", "Vitamin D"
    if (words.length === 2 && /^(acid|oxide|sulfate|chloride|citrate|sodium|calcium|hydrochloride|tartrate|phosphate|succinate|maleate|fumarate|mesylate|besylate|bromide|nitrate|acetate)$/i.test(words[1])) return false;
    // 2+ words with NL patterns → prompt mode
    if (words.length >= 2) {
      const nlPatterns = /\b(find|search|what|which|how|is there|show|suggest|recommend|explore|discover|treat|treatment|cure|drug|molecule|medicine|therapy|repurpos|candidate|disease|condition|patient|symptom|disorder|syndrome|cancer|diabetes|alzheimer|parkinson|for)\b/i;
      if (nlPatterns.test(text)) return true;
    }
    // 3+ words is almost always a prompt
    if (words.length >= 3) return true;
    return false;
  })();

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  // History panel state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch History from DB
    if (isHistoryOpen) {
      fetch('/api/history')
        .then(res => res.json())
        .then(data => {
          if(Array.isArray(data)) {
            const unique = [];
            const seen = new Set();
            for(const job of data) {
              const mol = job.molecule.toLowerCase();
              if(!seen.has(mol)) {
                  seen.add(mol);
                  unique.push(job);
              }
            }
            setSearchHistory(unique);
          }
        })
        .catch(console.error);
    }
  }, [isHistoryOpen]);

  useEffect(() => {
    if (query.length < 2 || isPromptMode) {
      setSuggestions([]);
      if (query.length < 2) setError(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.dictionary_terms && data.dictionary_terms.compound) {
          setSuggestions(data.dictionary_terms.compound.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isPromptMode]);

  const addMolecule = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (molecules.length >= 2) return;
    if (molecules.some(m => m.toLowerCase() === trimmed.toLowerCase())) return;
    setMolecules(prev => [...prev, trimmed]);
    setQuery("");
    setSuggestions([]);
  };

  const removeMolecule = (index: number) => {
    setMolecules(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async (overridePrompt?: string) => {
    const trimmedQuery = overridePrompt?.trim() || query.trim();

    // Detect prompt mode for the actual text being submitted
    const textIsPrompt = (() => {
      if (!trimmedQuery || molecules.length > 0) return false;
      const words = trimmedQuery.split(/\s+/);
      if (words.length === 1) return false;
      if (words.length === 2 && /^(acid|oxide|sulfate|chloride|citrate|sodium|calcium|hydrochloride|tartrate|phosphate|succinate|maleate|fumarate|mesylate|besylate|bromide|nitrate|acetate)$/i.test(words[1])) return false;
      if (words.length >= 2) {
        const nlPatterns = /\b(find|search|what|which|how|is there|show|suggest|recommend|explore|discover|treat|treatment|cure|drug|molecule|medicine|therapy|repurpos|candidate|disease|condition|patient|symptom|disorder|syndrome|cancer|diabetes|alzheimer|parkinson|for)\b/i;
        if (nlPatterns.test(trimmedQuery)) return true;
      }
      if (words.length >= 3) return true;
      return false;
    })();

    // Prompt mode: send as { prompt } — no chips needed
    if (textIsPrompt && trimmedQuery && molecules.length === 0) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ prompt: trimmedQuery }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to resolve your query."); setLoading(false); return; }
        if (data.job_id) navigate(`/progress/${data.job_id}`);
      } catch (e) {
        setError("Network error occurred. Please try again.");
        setLoading(false);
      }
      return;
    }

    // Molecule mode: collect chips + current typed text
    const allMolecules = [...molecules];
    if (trimmedQuery && !allMolecules.some(m => m.toLowerCase() === trimmedQuery.toLowerCase())) {
      allMolecules.push(trimmedQuery);
    }
    if (allMolecules.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      if (allMolecules.length >= 2) {
        // Compare mode: analyze both
        const [res1, res2] = await Promise.all([
          fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ molecule: allMolecules[0] }),
          }),
          fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ molecule: allMolecules[1] }),
          }),
        ]);
        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

        if (!res1.ok) { setError(data1.error || `Failed for ${allMolecules[0]}`); setLoading(false); return; }
        if (!res2.ok) { setError(data2.error || `Failed for ${allMolecules[1]}`); setLoading(false); return; }

        if (data1.job_id && data2.job_id) {
          navigate(`/progress/${data1.job_id}?compare=${data2.job_id}`);
        }
      } else {
        // Single molecule
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ molecule: allMolecules[0] }),
        });
        const data = await res.json();

        if (!res.ok) { setError(data.error || "Failed to authenticate molecule."); setLoading(false); return; }
        if (data.job_id) navigate(`/progress/${data.job_id}`);
      }
    } catch (e) {
      setError("Network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-200 font-sans selection:bg-zinc-800 flex flex-col relative overflow-hidden">
      
      {/* Interactive Particle Background */}
      <ParticleConstellation className="opacity-40" />
      
      {/* History Side Panel */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-900 z-[60] flex flex-col pt-6 pb-6 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 mb-8">
                <div className="flex items-center gap-2 text-zinc-100">
                  <History size={18} className="text-zinc-400" />
                  <span className="font-semibold tracking-wide">Research History</span>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 w-full scrollbar-thin scrollbar-thumb-zinc-800">
                {searchHistory.length === 0 ? (
                  <div className="text-center text-zinc-500 text-sm mt-10">No past research found.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {searchHistory.map((job, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                           setIsHistoryOpen(false);
                           setQuery(job.molecule);
                           navigate(`/report/${job._id}`);
                        }}
                        className="w-full text-left group hover:bg-zinc-900 rounded-xl p-4 transition-all border border-transparent hover:border-zinc-800"
                      >
                        <div className="flex items-center justify-between overflow-hidden">
                          <span className="font-medium text-zinc-200 truncate pr-2">{job.molecule}</span>
                          <SearchIcon size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-sm" />
            </div>
          </div>
        </div>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          <button onClick={() => navigate("/")} className="hover:text-zinc-200">HOME</button>
          <button onClick={() => navigate("/community")} className="hover:text-zinc-200">COMMUNITY</button>
        </nav>
        
        <div className="w-24 hidden md:block" />
      </header>

      {/* Floating Background Badges */}
      <FloatingCard
        icon={TrendingUp}
        title="Live Market Insights"
        className="top-[25%] left-[10%]"
        delay={0.2}
      />
      <FloatingCard
        icon={Activity}
        title="Clinical Trial Tracking"
        className="top-[15%] right-[15%]"
        delay={0.4}
        yOffset={10}
      />
      <FloatingCard
        icon={Shield}
        title="FDA Patent Analysis"
        className="bottom-[35%] right-[10%]"
        delay={0.6}
        yOffset={15}
      />
      <FloatingCard
        icon={Database}
        title="Real-Time Synth"
        className="bottom-[25%] left-[15%]"
        delay={0.8}
        yOffset={12}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full max-w-3xl mx-auto mt-10">
        
        {/* Animated Icon */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 p-3 rounded-2xl bg-indigo-500/20 text-indigo-400"
        >
          <Sparkles size={36} fill="currentColor" />
        </motion.div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl mb-6 tracking-tight text-white flex gap-3 text-center">
          <span className="font-serif italic font-light">Discover</span>
          <span className="font-serif capitalize">Intelligence</span>
        </h1>

        <p className="text-center text-zinc-400 text-base md:text-xl mb-12 max-w-2xl leading-relaxed">
          This AI turns your pharmacological queries into insights you can trust—grounded in real-time data, and delivered instantly.
        </p>

        <div className="w-full max-w-xl flex flex-col gap-3 relative">
          {/* Single chip-based search input */}
          <div
            className="relative group flex flex-wrap items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800/80 focus-within:bg-zinc-900 transition-all duration-300 border border-zinc-700/50 focus-within:border-zinc-300/80 rounded-full px-4 py-2.5 min-h-[56px] cursor-text"
            onClick={() => {
              const el = document.getElementById('mol-search-input');
              el?.focus();
            }}
          >
            {/* Molecule chips */}
            <AnimatePresence mode="popLayout">
              {molecules.map((mol, i) => (
                <motion.span
                  key={mol}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 text-zinc-100 rounded-full pl-3 pr-1.5 py-1 text-sm font-medium"
                >
                  {mol}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMolecule(i); }}
                    className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>

            {/* Text input */}
            {molecules.length < 2 && (
              <input
                id="mol-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (isPromptMode) {
                      e.preventDefault();
                      handleAnalyze();
                    } else if (query.trim() && molecules.length < 2) {
                      e.preventDefault();
                      addMolecule(query);
                    }
                  } else if (e.key === "Backspace" && !query && molecules.length > 0) {
                    removeMolecule(molecules.length - 1);
                  } else if (e.key === "," || e.key === "Tab") {
                    if (query.trim() && molecules.length < 2) {
                      e.preventDefault();
                      addMolecule(query);
                    }
                  }
                }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                disabled={loading}
                placeholder={molecules.length === 0 ? "Enter a molecule name or describe what you're looking for..." : molecules.length < 2 ? "Add another to compare..." : ""}
                className="flex-1 min-w-[120px] bg-transparent text-base text-zinc-100 placeholder:text-zinc-400 focus:outline-none py-1"
              />
            )}

            {/* Voice Search */}
            <div className="ml-auto flex items-center gap-1 flex-shrink-0">
              {molecules.length < 2 && (
                <div className="z-10">
                  <VoiceSearch
                    onResult={(text) => {
                      if (molecules.length < 2) addMolecule(text);
                    }}
                  />
                </div>
              )}
              <button
                onClick={() => handleAnalyze()}
                disabled={loading || (molecules.length === 0 && !query.trim())}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-50 transition-colors"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>

          {/* Mode indicator */}
          <AnimatePresence mode="wait">
            {query.trim().length >= 2 && molecules.length === 0 && (
              <motion.div
                key={isPromptMode ? 'prompt' : 'molecule'}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-1.5 px-2 text-xs"
              >
                {isPromptMode ? (
                  <><MessageCircle size={12} className="text-violet-400" /><span className="text-violet-400/80">AI will find the best molecule for your query</span></>
                ) : (
                  <><FlaskConical size={12} className="text-cyan-400" /><span className="text-cyan-400/80">Molecule lookup</span></>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint text */}
          {molecules.length === 1 && !query && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-zinc-500 px-2"
            >
              Type another molecule to compare, or click the arrow to analyze
            </motion.p>
          )}

          {/* Example prompt chips */}
          {molecules.length === 0 && !query && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 px-1 mt-1"
            >
              {[
                'Find a repurposing candidate for Parkinson\'s',
                'Drug for Alzheimer\'s disease',
                'Metformin',
                'Treatment for lupus',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    if (example.includes(' ')) {
                      // Multi-word: submit directly as prompt
                      setQuery(example);
                      handleAnalyze(example);
                    } else {
                      // Single word molecule: add as chip
                      addMolecule(example);
                    }
                  }}
                  className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </motion.div>
          )}

          {/* Autocomplete suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && query.length >= 2 && !loading && inputFocused && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-20"
              >
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      addMolecule(sug);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-zinc-900 text-zinc-300 border-b border-zinc-800 last:border-0 flex items-center gap-3 transition-colors"
                  >
                    <SearchIcon size={14} className="text-zinc-500" />
                    {sug}
                  </button>
                ))}
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-8 left-4 flex items-center gap-2 text-indigo-400 text-sm"
              >
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-zinc-400">Thinking...</span>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-3 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 flex items-start gap-3 z-20 backdrop-blur-md"
              >
                <span className="text-rose-400 text-base mt-0.5">⚠</span>
                <div>
                  <p className="text-rose-300 text-sm font-medium">Molecule not found</p>
                  <p className="text-rose-400/80 text-xs mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Bottom Right Nav/Support */}
      <div className="absolute bottom-6 right-6 flex items-center gap-3 z-50">
        <button 
          onClick={() => navigate("/community")}
          className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white backdrop-blur-md transition-colors border border-white/10"
        >
          <LayoutGrid size={20} />
        </button>
      </div>
      
    </div>
  );
}

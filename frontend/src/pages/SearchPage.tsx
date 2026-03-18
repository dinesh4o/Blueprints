import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, Loader2, Command, UserCircle, Briefcase, TrendingUp, Shield, Activity, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

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
      className={`absolute hidden md:block z-0 pointer-events-none ${className}`}
    >
      <motion.div
        animate={{ y: [0, -yOffset, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay }}
        className="flex items-center gap-3 bg-white/70 dark:bg-white/5 backdrop-blur-[12px] border border-slate-300/50 dark:border-slate-700/50 rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Icon size={18} />
        </div>
        <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200 whitespace-nowrap">{title}</span>
      </motion.div>
    </motion.div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [portfolioActive, setPortfolioActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecent(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
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
    }, 300); // 300ms debounce prevents API call on every keystroke
    return () => clearTimeout(timer);
  }, [query]);

  const handleAnalyze = async (molecule: string) => {
    if (!molecule.trim()) return;
    setLoading(true);
    
    // Save to recent
    const newRecent = [molecule, ...recent.filter(r => r !== molecule)].slice(0, 5);
    setRecent(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ molecule }),
      });
      const data = await res.json();
      if (data.job_id) {
        navigate(`/progress/${data.job_id}`);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center bg-[#f8fafc] dark:bg-[#000000] text-zinc-900 dark:text-[#ededed] font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 min-h-screen relative overflow-hidden"
    >
      {/* Fixed background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_90%_70%_at_50%_30%,#000_10%,transparent_100%)]" />

      {/* Floating Background Badges */}
      <FloatingCard 
        icon={TrendingUp} 
        title="Live Market Insights" 
        className="top-[15%] left-[5%] xl:left-[12%]" 
        delay={0.2} 
        floatDuration={5.5} 
      />
      <FloatingCard 
        icon={Shield} 
        title="Patent Analysis" 
        className="bottom-[25%] left-[3%] xl:left-[10%]" 
        delay={0.6} 
        floatDuration={6} 
        yOffset={15}
      />
      <FloatingCard 
        icon={Activity} 
        title="Clinical Trial Data" 
        className="top-[20%] right-[5%] xl:right-[12%]" 
        delay={0.4} 
        floatDuration={5} 
        yOffset={10}
      />
      <FloatingCard 
        icon={BrainCircuit} 
        title="AI Mechanism Matching" 
        className="bottom-[30%] right-[3%] xl:right-[10%]" 
        delay={0.8} 
        floatDuration={6.5} 
        yOffset={18}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl px-6 pb-32 relative z-10 pt-20">
        <div className="text-center space-y-4 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-[84px] font-bold tracking-tighter leading-[1.05] mb-7"
          >
            <span className="text-zinc-900 dark:text-white">Autonomous</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-zinc-200 dark:to-zinc-600">
              Research Platform
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl text-center mx-auto mb-10 font-light leading-relaxed"
          >
            Enter any compound name to initiate a multi-agent pipeline synthesizing clinical, regulatory, and literature data in seconds.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full relative"
        >
          <div className="relative flex items-center group">
            <Search className="absolute left-6 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze(query);
              }}
              placeholder="Search molecules (e.g. Metformin, Rapamycin)..."
              className="w-full h-auto pl-16 pr-36 py-5 text-lg rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.06)] bg-white/60 dark:bg-white/5 backdrop-blur-[24px] border-slate-300/50 dark:border-slate-400/50 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100"
            />
            <div className="absolute right-3 flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 font-mono mr-2">
                <Command size={12} /> K
              </div>
              <button
                onClick={() => handleAnalyze(query)}
                disabled={loading || !query.trim()}
                className="px-5 py-2.5 text-sm tracking-wide font-medium bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl transition-all duration-300 shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Analyze
              </button>
            </div>
          </div>

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-4 overflow-hidden z-20 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.06)] border border-slate-300/50 dark:border-slate-400/50 bg-white/60 dark:bg-[#0c0c0e]/80 backdrop-blur-[24px] rounded-2xl"
              >
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(sug);
                      handleAnalyze(sug);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 border-b border-slate-200/50 dark:border-zinc-800/50 last:border-0 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-800 p-1">
                        <img 
                          src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(sug)}/PNG`} 
                          alt={sug}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="font-medium text-lg">{sug}</span>
                    </div>
                    <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 w-full"
        >
          {recent.length > 0 && (
            <div className="space-y-4 flex flex-col items-center">
              <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                <Clock size={14} /> Recent Analyses
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {recent.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnalyze(r)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-300/50 dark:border-slate-500/30 hover:bg-white dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

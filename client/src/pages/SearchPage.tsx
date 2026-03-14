import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, Loader2, Command, UserCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { ModeToggle } from '@/components/mode-toggle';

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
    }, 50);
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
      className="flex-1 flex flex-col items-center bg-transparent min-h-screen relative overflow-hidden"
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl px-6 pb-32 relative z-10 pt-20">
        <div className="text-center space-y-4 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-foreground tracking-tighter"
          >
            Autonomous Research
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Enter a molecule to initiate a multi-agent pipeline synthesizing clinical, regulatory, and literature data.
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
              className="w-full h-auto pl-16 pr-36 py-6 text-xl rounded-2xl shadow-2xl bg-card/80 backdrop-blur-xl border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
            <div className="absolute right-4 flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-xs text-muted-foreground font-mono mr-2">
                <Command size={12} /> K
              </div>
              <Button
                onClick={() => handleAnalyze(query)}
                disabled={loading || !query.trim()}
                className="rounded-xl shadow-lg shadow-primary/20"
                size="lg"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Analyze
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-4 overflow-hidden z-20 shadow-2xl border border-border/50 bg-card/90 backdrop-blur-2xl rounded-2xl"
              >
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(sug);
                      handleAnalyze(sug);
                    }}
                    className="w-full text-left px-6 py-4 hover:bg-primary/10 hover:text-primary text-foreground border-b border-border/50 last:border-0 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
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
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                <Clock size={14} /> Recent Analyses
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {recent.map((r, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze(r)}
                    className="rounded-full text-muted-foreground hover:text-foreground bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <ModeToggle variant="full" />
    </motion.div>
  );
}

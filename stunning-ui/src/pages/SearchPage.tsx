/**
 * ✦ STUNNING SEARCH PAGE
 * Features: OrbEffect, Particles, GradientText, SpotlightCard floating hints,
 * glassmorphic search bar with glow, animated molecule chips.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ArrowRight, X, Mic, Clock, ChevronRight,
  TrendingUp, Shield, FlaskConical, Brain, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GradientText, OrbEffect, Particles, SpotlightCard, BlurReveal,
  MagneticButton, SplitText,
} from '@/components/reactbits';

const FLOATING_CARDS = [
  { icon: TrendingUp, text: 'Live Market Insights', delay: 0 },
  { icon: Shield, text: 'FDA Patent Analysis', delay: 0.2 },
  { icon: FlaskConical, text: 'Clinical Trial Tracking', delay: 0.4 },
  { icon: Brain, text: 'AI Synthesis Engine', delay: 0.6 },
  { icon: BarChart3, text: 'Competitive Intelligence', delay: 0.8 },
];

const POPULAR_MOLECULES = ['Aspirin', 'Metformin', 'Ibuprofen', 'Remdesivir', 'Dexamethasone'];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [molecules, setMolecules] = React.useState<string[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addMolecule = (name: string) => {
    if (molecules.length >= 2 || molecules.includes(name)) return;
    setMolecules((prev) => [...prev, name]);
    setQuery('');
  };

  const removeMolecule = (name: string) => {
    setMolecules((prev) => prev.filter((m) => m !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && query.trim()) {
      e.preventDefault();
      addMolecule(query.trim());
    }
    if (e.key === 'Backspace' && !query && molecules.length > 0) {
      removeMolecule(molecules[molecules.length - 1]);
    }
  };

  const handleSubmit = () => {
    if (molecules.length === 0 && !query.trim()) return;
    const all = query.trim() ? [...molecules, query.trim()] : molecules;
    // Navigate to progress page (mock)
    navigate(`/progress/demo?molecules=${encodeURIComponent(all.join(','))}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Particles count={30} color="oklch(0.7 0.2 260)" />
      <OrbEffect className="left-1/4 top-1/4" size={600} />
      <OrbEffect className="right-1/4 bottom-1/4" color="oklch(0.75 0.18 180)" size={400} />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold">Blueprints</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Portfolio</Link>
            <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-14">
        {/* Hero */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold md:text-6xl">
            <GradientText>Discover Intelligence</GradientText>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Enter up to 2 molecules for side-by-side comparison analysis
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div
            className={`relative flex items-center gap-2 rounded-2xl border bg-card/80 backdrop-blur-xl px-4 py-3 transition-all duration-300 ${
              isFocused
                ? 'border-primary/50 shadow-[0_0_40px_oklch(0.7_0.2_260/0.15)] ring-1 ring-primary/20'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />

            {/* Molecule chips */}
            <AnimatePresence>
              {molecules.map((mol) => (
                <motion.div
                  key={mol}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1 rounded-lg bg-primary/15 border border-primary/30 px-3 py-1 text-sm text-primary shrink-0"
                >
                  {mol}
                  <button onClick={() => removeMolecule(mol)} className="ml-1 hover:text-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={molecules.length === 0 ? 'Search molecules...' : molecules.length === 1 ? 'Add a molecule to compare...' : 'Max 2 molecules'}
              disabled={molecules.length >= 2}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm min-w-0"
            />

            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <Mic className="h-4 w-4" />
            </button>

            <button
              onClick={handleSubmit}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg hover:brightness-110 transition-all disabled:opacity-40"
              disabled={molecules.length === 0 && !query.trim()}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Popular molecules */}
          <motion.div
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-xs text-muted-foreground">Popular:</span>
            {POPULAR_MOLECULES.map((mol) => (
              <button
                key={mol}
                onClick={() => addMolecule(mol)}
                className="rounded-lg border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {mol}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating feature cards */}
        <div className="absolute inset-0 pointer-events-none">
          {FLOATING_CARDS.map((card, i) => {
            const positions = [
              { left: '5%', top: '20%' },
              { right: '5%', top: '25%' },
              { left: '3%', bottom: '25%' },
              { right: '3%', bottom: '30%' },
              { right: '12%', top: '15%' },
            ];
            return (
              <motion.div
                key={card.text}
                className="absolute hidden lg:flex items-center gap-2 rounded-xl glass px-4 py-3 pointer-events-auto"
                style={positions[i]}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ delay: 1 + card.delay, duration: 0.6 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
              >
                <card.icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">{card.text}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

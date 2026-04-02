/**
 * ✦ STUNNING PORTFOLIO PAGE
 * Features: SpotlightCard report cards, animated scores,
 * BlurReveal grid, search with glassmorphic input, TiltCard hover.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, FlaskConical, ChevronRight, BarChart3,
  Calendar, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  SpotlightCard, BlurReveal, Aurora, Particles, NumberTicker, GradientText,
} from '@/components/reactbits';

const MOCK_REPORTS = [
  { id: '1', molecule: 'Metformin', date: '2026-03-28', score: 8.2, indications: ['Colorectal Cancer', 'Breast Cancer', 'Alzheimer\'s'] },
  { id: '2', molecule: 'Aspirin', date: '2026-03-25', score: 7.5, indications: ['Cardiovascular', 'Colorectal Prevention', 'Pain Management'] },
  { id: '3', molecule: 'Remdesivir', date: '2026-03-20', score: 6.8, indications: ['COVID-19', 'RSV', 'Ebola'] },
  { id: '4', molecule: 'Ibuprofen', date: '2026-03-15', score: 5.4, indications: ['Inflammation', 'Pain', 'Fever'] },
  { id: '5', molecule: 'Dexamethasone', date: '2026-03-10', score: 8.9, indications: ['COVID-19', 'Myeloma', 'Inflammation'] },
  { id: '6', molecule: 'Thalidomide', date: '2026-03-05', score: 7.1, indications: ['Multiple Myeloma', 'Leprosy', 'Graft-vs-Host'] },
];

function scoreColor(score: number) {
  if (score >= 7.5) return { text: 'text-success', bg: 'bg-success', bar: 'oklch(0.72 0.2 155)' };
  if (score >= 5) return { text: 'text-warning', bg: 'bg-warning', bar: 'oklch(0.78 0.15 80)' };
  return { text: 'text-destructive', bg: 'bg-destructive', bar: 'oklch(0.65 0.22 25)' };
}

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = MOCK_REPORTS.filter((r) =>
    r.molecule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highViability = MOCK_REPORTS.filter((r) => r.score >= 7.5).length;

  return (
    <div className="relative min-h-screen bg-background">
      <Aurora colors={['oklch(0.7 0.2 260 / 0.04)', 'oklch(0.75 0.18 180 / 0.03)']} />
      <Particles count={15} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold">Portfolio</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{MOCK_REPORTS.length} analyses</span>
            <Badge variant="success">{highViability} high viability</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Search */}
        <BlurReveal>
          <div className="mb-8 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search molecules..."
              className="w-full h-11 rounded-xl border border-border bg-card/80 backdrop-blur-sm pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
            />
          </div>
        </BlurReveal>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((report, i) => {
              const colors = scoreColor(report.score);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SpotlightCard className="p-6 h-full group cursor-pointer hover:border-primary/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                          {report.molecule}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold font-mono ${colors.text}`}>{report.score}</div>
                        <div className="text-[10px] text-muted-foreground">Phoenix Score</div>
                      </div>
                    </div>

                    <Progress value={report.score} max={10} color={colors.bar} className="mb-4" />

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {report.indications.slice(0, 3).map((ind) => (
                        <Badge key={ind} variant="secondary" className="text-[10px]">{ind}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <Link to={`/report/${report.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          View Report <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-xs">Compare</Button>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">No analyses found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or start a new analysis</p>
            <Link to="/search" className="mt-4">
              <Button>Start New Analysis</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

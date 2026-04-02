/**
 * ✦ STUNNING REPURPOSING PAGE
 * Features: SpotlightCard results, animated similarity bars,
 * molecular twin visualization, GradientText headers.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Search, Dna, Atom, ArrowRight, ExternalLink,
  Sparkles, FlaskConical, Target, Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  SpotlightCard, BlurReveal, Aurora, Particles, GradientText, TiltCard,
  OrbEffect, NumberTicker,
} from '@/components/reactbits';

const MOCK_RESULTS = [
  { name: 'Phenformin', cid: 8249, similarity: 0.92, moa: 'AMPK activator', indications: ['Type 2 Diabetes', 'Cancer'] },
  { name: 'Buformin', cid: 2467, similarity: 0.87, moa: 'Biguanide', indications: ['Diabetes Mellitus'] },
  { name: 'Biguanide', cid: 3037, similarity: 0.95, moa: 'Base scaffold', indications: ['Metabolic Disorders'] },
  { name: 'Galegine', cid: 10983, similarity: 0.78, moa: 'Natural guanidine', indications: ['Diabetes', 'Obesity'] },
  { name: 'Moroxydine', cid: 23601, similarity: 0.71, moa: 'Antiviral biguanide', indications: ['Influenza', 'HSV'] },
  { name: 'Proguanil', cid: 6178, similarity: 0.68, moa: 'DHFR inhibitor', indications: ['Malaria'] },
];

export default function RepurposingPage() {
  const [query, setQuery] = React.useState('Metformin');
  const [searched, setSearched] = React.useState(true);

  return (
    <div className="relative min-h-screen bg-background">
      <Aurora colors={['oklch(0.7 0.2 260 / 0.04)', 'oklch(0.75 0.18 180 / 0.03)']} />
      <Particles count={15} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold flex items-center gap-2">
              <Dna className="h-5 w-5 text-primary" />
              Drug Repurposing
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Hero */}
        <BlurReveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold md:text-4xl">
              Find <GradientText>Structural Twins</GradientText>
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Discover structurally similar molecules for drug repurposing using PubChem similarity & substructure search.
            </p>
          </div>
        </BlurReveal>

        {/* Search */}
        <BlurReveal delay={0.1}>
          <div className="mx-auto max-w-xl mb-12">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Atom className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter molecule name or CID..."
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setSearched(true)}>
                <Search className="h-4 w-4 mr-1" /> Search
              </Button>
            </div>
          </div>
        </BlurReveal>

        {/* Results */}
        {searched && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <BlurReveal delay={0.2}>
              <div className="grid gap-4 md:grid-cols-4">
                <SpotlightCard className="p-5 text-center">
                  <Dna className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold"><NumberTicker value={MOCK_RESULTS.length} /></div>
                  <div className="text-xs text-muted-foreground">Structural Twins</div>
                </SpotlightCard>
                <SpotlightCard className="p-5 text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <div className="text-2xl font-bold"><NumberTicker value={14} /></div>
                  <div className="text-xs text-muted-foreground">Shared Targets</div>
                </SpotlightCard>
                <SpotlightCard className="p-5 text-center">
                  <FlaskConical className="h-6 w-6 mx-auto mb-2 text-warning" />
                  <div className="text-2xl font-bold"><NumberTicker value={8} /></div>
                  <div className="text-xs text-muted-foreground">New Indications</div>
                </SpotlightCard>
                <SpotlightCard className="p-5 text-center">
                  <Brain className="h-6 w-6 mx-auto mb-2 text-rose-400" />
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-xs text-muted-foreground">Max Similarity</div>
                </SpotlightCard>
              </div>
            </BlurReveal>

            {/* Molecule Cards */}
            <BlurReveal delay={0.3}>
              <h3 className="text-lg font-semibold mb-4">Similarity Results</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_RESULTS.map((mol, i) => (
                  <motion.div
                    key={mol.cid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <TiltCard className="p-5 h-full" tiltAmount={6}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{mol.name}</h4>
                          <span className="text-xs text-muted-foreground font-mono">CID: {mol.cid}</span>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-lg font-bold font-mono"
                            style={{ color: mol.similarity >= 0.9 ? 'oklch(0.72 0.2 155)' : mol.similarity >= 0.75 ? 'oklch(0.7 0.2 260)' : 'oklch(0.78 0.15 80)' }}
                          >
                            {(mol.similarity * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      <Progress
                        value={mol.similarity * 100}
                        color={mol.similarity >= 0.9 ? 'oklch(0.72 0.2 155)' : mol.similarity >= 0.75 ? 'oklch(0.7 0.2 260)' : 'oklch(0.78 0.15 80)'}
                        className="mb-3"
                      />

                      <div className="text-xs text-muted-foreground mb-2">
                        <span className="font-medium text-foreground">MoA:</span> {mol.moa}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {mol.indications.map((ind) => (
                          <Badge key={ind} variant="secondary" className="text-[10px]">{ind}</Badge>
                        ))}
                      </div>

                      <a
                        href={`https://pubchem.ncbi.nlm.nih.gov/compound/${mol.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View on PubChem <ExternalLink className="h-3 w-3" />
                      </a>
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            </BlurReveal>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * ✦ STUNNING COMMUNITY PAGE
 * Features: SpotlightCard thread cards, animated upvotes,
 * glassmorphic compose modal, BlurReveal stagger, tag badges.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, Plus, Search, Heart, MessageCircle,
  Share2, MoreHorizontal, Image, Send, X, Hash,
  User, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  SpotlightCard, BlurReveal, Aurora, Particles, GradientText,
} from '@/components/reactbits';

const MOCK_THREADS = [
  {
    id: '1', author: 'Dr. Sarah Chen', avatar: null, time: '2h ago',
    title: 'Metformin shows promising anti-cancer properties in Phase III trials',
    content: 'Just published our latest findings on metformin\'s mTOR inhibition pathway in colorectal cancer models. The results are encouraging — 34% reduction in tumor growth vs control group.',
    tags: ['#Oncology', '#ClinicalTrial', '#Metformin'],
    upvotes: 47, comments: 12, hasUpvoted: false,
  },
  {
    id: '2', author: 'Prof. James Liu', avatar: null, time: '5h ago',
    title: 'New CRISPR targets identified for drug-resistant TB',
    content: 'Our CRISPR screen identified 3 novel gene targets that could sensitize drug-resistant Mycobacterium tuberculosis to existing antibiotics. Full paper on bioRxiv.',
    tags: ['#CRISPR', '#InfectiousDisease', '#Target'],
    upvotes: 32, comments: 8, hasUpvoted: true,
  },
  {
    id: '3', author: 'NeuroLab Team', avatar: null, time: '1d ago',
    title: 'Evidence chain analysis: Thalidomide analogs for glioblastoma',
    content: 'Using the Blueprints evidence chain tool, we mapped 14 thalidomide analogs with potential BBB penetration for GBM treatment. Detailed pathway overlap analysis attached.',
    tags: ['#Neurology', '#DrugRepurposing', '#Evidence'],
    upvotes: 89, comments: 23, hasUpvoted: false,
  },
];

const TAGS = ['#Target', '#Clinical', '#Repurposing', '#Patent', '#Neurology', '#Oncology', '#AI'];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showCompose, setShowCompose] = React.useState(false);
  const [expandedThread, setExpandedThread] = React.useState<string | null>(null);
  const [threads, setThreads] = React.useState(MOCK_THREADS);

  const toggleUpvote = (id: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, hasUpvoted: !t.hasUpvoted, upvotes: t.upvotes + (t.hasUpvoted ? -1 : 1) }
          : t
      )
    );
  };

  const filtered = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-background">
      <Aurora colors={['oklch(0.7 0.2 260 / 0.03)', 'oklch(0.75 0.18 180 / 0.02)']} />
      <Particles count={10} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold">Community</h1>
          </div>
          <Button size="sm" onClick={() => setShowCompose(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Post
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Search */}
        <BlurReveal>
          <div className="mb-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="w-full h-11 rounded-xl border border-border bg-card/80 backdrop-blur-sm pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
            />
          </div>
        </BlurReveal>

        {/* Threads */}
        <div className="space-y-4">
          {filtered.map((thread, i) => (
            <BlurReveal key={thread.id} delay={i * 0.05}>
              <SpotlightCard className="p-6">
                {/* Author row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{thread.author}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {thread.time}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold mb-2">{thread.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {thread.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {thread.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      <Hash className="h-2.5 w-2.5 mr-0.5" />
                      {tag.replace('#', '')}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                  <button
                    onClick={() => toggleUpvote(thread.id)}
                    className={`flex items-center gap-1.5 text-sm transition-all ${
                      thread.hasUpvoted ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'
                    }`}
                  >
                    <motion.div animate={thread.hasUpvoted ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                      <Heart className={`h-4 w-4 ${thread.hasUpvoted ? 'fill-current' : ''}`} />
                    </motion.div>
                    {thread.upvotes}
                  </button>
                  <button
                    onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {thread.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Expanded comments */}
                <AnimatePresence>
                  {expandedThread === thread.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                        {/* Mock comments */}
                        <div className="flex gap-3">
                          <div className="h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium">Researcher42</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Fascinating findings! Could you share the dosing protocol?</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <input
                            placeholder="Write a comment..."
                            className="flex-1 h-9 rounded-lg border border-border bg-input px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                          <Button size="sm" className="h-9 w-9 p-0">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SpotlightCard>
            </BlurReveal>
          ))}
        </div>
      </main>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">New Post</h2>
                <button onClick={() => setShowCompose(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Input placeholder="Title" className="text-base font-medium" />
                <textarea
                  placeholder="Share your research, findings, or questions..."
                  rows={5}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 resize-none"
                />

                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      className="rounded-lg border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Image className="h-4 w-4" /> Add Image
                  </Button>
                  <Button>
                    Post <Send className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Activity, TrendingUp, TrendingDown, Atom, Crown, Users, BarChart3,
  FileText, Share2, MessageSquare, ThumbsUp, Shield,
  ChevronRight, ChevronLeft, Clock, Sparkles, Search,
  FlaskConical, Target, PieChart as PieIcon, Zap, Plus, BookOpen, Menu,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { clsx } from 'clsx';

// ── Types ──────────────────────────────────────────────────────────
interface UserStats {
  totalAnalyses: number;
  completedAnalyses: number;
  failedAnalyses: number;
  completionRate: number;
  avgPhoenixScore: number;
  topMolecule: { name: string; score: number } | null;
  weeklyTrend: { week: string; count: number }[];
  sharedReports: number;
  topCandidates: { condition: string; molecule: string; repurposing_score: number; market_size_usd_billion?: number }[];
  plan: string;
}

interface RecentActivity {
  recentAnalyses: { id: string; molecule: string; status: string; phoenixScore: number | null; createdAt: string }[];
  communityPosts: { id: string; title: string; upvotes: number; commentCount: number; createdAt: string }[];
}

interface AdminStats {
  users: {
    total: number; free: number; researcher: number; organization: number;
    activeToday: number; signupTrend: { date: string; count: number }[];
  };
  analyses: {
    total: number; completed: number; failed: number; pending: number;
    platformAvgScore: number; topMolecules: { molecule: string; count: number }[];
  };
  community: { totalThreads: number; totalComments: number; totalUpvotes: number };
}

// ── Helpers ────────────────────────────────────────────────────────
function statusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Completed</Badge>;
    case 'failed':
      return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">Failed</Badge>;
    default:
      return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Processing</Badge>;
  }
}

function scoreColor(s: number | null) {
  if (s === null) return 'text-muted-foreground';
  if (s >= 7.5) return 'text-emerald-600 dark:text-emerald-400';
  if (s >= 5) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

const PIE_COLORS = ['#10b981', '#f43f5e', '#f59e0b'];
const CATEGORY_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#a78bfa'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold text-foreground">
          {p.value} <span className="text-muted-foreground text-xs font-normal">{p.name}</span>
        </p>
      ))}
    </div>
  );
}

function TrendIndicator({ value, label, positive = true }: { value: string; label: string; positive?: boolean }) {
  return (
    <div className="flex items-center gap-1 mt-1">
      {positive ? (
        <TrendingUp className="w-3 h-3 text-emerald-500" />
      ) : (
        <TrendingDown className="w-3 h-3 text-rose-500" />
      )}
      <span className={clsx("text-xs font-medium", positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Stat Card ──────────────────────────────────────────────────────
const STAT_ACCENTS: Record<string, { bg: string; icon: string }> = {
  analyses: { bg: '#06b6d418', icon: '#06b6d4' },
  score:    { bg: '#6366f118', icon: '#6366f1' },
  molecule: { bg: '#a78bfa18', icon: '#a78bfa' },
  shared:   { bg: '#10b98118', icon: '#10b981' },
  users:    { bg: '#06b6d418', icon: '#06b6d4' },
  paid:     { bg: '#a78bfa18', icon: '#a78bfa' },
  runs:     { bg: '#6366f118', icon: '#6366f1' },
  active:   { bg: '#f59e0b18', icon: '#f59e0b' },
  threads:  { bg: '#06b6d418', icon: '#06b6d4' },
  comments: { bg: '#6366f118', icon: '#6366f1' },
  upvotes:  { bg: '#10b98118', icon: '#10b981' },
};

function StatCard({ label, value, trend, trendLabel, trendPositive = true, icon: Icon, accent = 'analyses' }: {
  label: string; value: string | number; trend?: string; trendLabel?: string; trendPositive?: boolean; icon: any; accent?: string;
}) {
  const ac = STAT_ACCENTS[accent] || STAT_ACCENTS.analyses;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ac.bg }}>
        <Icon className="w-5 h-5" style={{ color: ac.icon }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-zinc-100 tabular-nums truncate">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trendPositive ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
            <span className={clsx('text-xs font-medium', trendPositive ? 'text-emerald-400' : 'text-red-400')}>{trend}</span>
            <span className="text-xs text-zinc-500">{trendLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  USER DASHBOARD
// ════════════════════════════════════════════════════════════════════
function UserDashboard({ stats, activity, loading }: {
  stats: UserStats | null;
  activity: RecentActivity | null;
  loading: boolean;
}) {
  const navigate = useNavigate();
  const [tablePage, setTablePage] = useState(0);
  const pageSize = 6;

  if (loading) return <LoadingState />;
  if (!stats) return <EmptyState />;

  const analyses = activity?.recentAnalyses || [];
  const totalPages = Math.ceil(analyses.length / pageSize);
  const pagedAnalyses = analyses.slice(tablePage * pageSize, (tablePage + 1) * pageSize);

  // Analysis status breakdown
  const statusData = [
    { name: 'Completed', value: stats.completedAnalyses },
    { name: 'Failed', value: stats.failedAnalyses },
    { name: 'Processing', value: Math.max(0, stats.totalAnalyses - stats.completedAnalyses - stats.failedAnalyses) },
  ].filter(d => d.value > 0);
  const statusTotal = statusData.reduce((s, d) => s + d.value, 0);

  // Top candidates for pie chart
  const categoryData = stats.topCandidates.slice(0, 4).map(c => ({
    name: c.condition.length > 15 ? c.condition.slice(0, 15) + '…' : c.condition,
    fullName: c.condition,
    value: c.repurposing_score,
    molecule: c.molecule,
  }));

  // Combined activity feed
  const activityItems = [
    ...(activity?.recentAnalyses?.slice(0, 5).map(a => ({
      type: a.status === 'completed' ? 'Analysis Complete' : a.status === 'failed' ? 'Analysis Failed' : 'Analysis Started',
      desc: a.molecule,
      time: a.createdAt,
      initials: a.molecule.slice(0, 2).toUpperCase(),
    })) || []),
    ...(activity?.communityPosts?.slice(0, 5).map(p => ({
      type: 'Community Post',
      desc: p.title,
      time: p.createdAt,
      initials: p.title.slice(0, 2).toUpperCase(),
    })) || []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard accent="analyses" icon={FlaskConical} label="Total Analyses" value={stats.totalAnalyses.toLocaleString()} trend={`${stats.completionRate}%`} trendLabel="success rate" trendPositive={stats.completionRate >= 70} />
        <StatCard accent="score" icon={Target} label="Avg Phoenix Score" value={stats.avgPhoenixScore > 0 ? stats.avgPhoenixScore.toFixed(1) : '—'} trend={stats.avgPhoenixScore >= 7 ? '+Strong' : stats.avgPhoenixScore >= 5 ? 'Moderate' : undefined} trendLabel="confidence" trendPositive={stats.avgPhoenixScore >= 5} />
        <StatCard accent="molecule" icon={Atom} label="Top Molecule" value={stats.topMolecule?.name ?? '—'} trend={stats.topMolecule ? `${stats.topMolecule.score.toFixed(1)}/10` : undefined} trendLabel="Phoenix Score" trendPositive={(stats.topMolecule?.score ?? 0) >= 7} />
        <StatCard accent="shared" icon={Share2} label="Shared Reports" value={stats.sharedReports.toLocaleString()} trend={stats.sharedReports > 0 ? `${stats.sharedReports}` : undefined} trendLabel="shared" trendPositive />
      </div>

      {/* ── Area Chart ── */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-zinc-100">Analysis Trend</p>
            <p className="text-xs text-zinc-500">Last 30 days</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-cyan-400" /> Analyses
          </div>
        </div>
        {stats.weeklyTrend.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyTrend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} allowDecimals={false} width={32} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fill="url(#trendFill)" name="Analyses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-zinc-600">No data yet — run an analysis to get started</div>
        )}
      </div>

      {/* ── Pie Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <p className="font-semibold text-zinc-100 mb-1">Analysis Status</p>
          <p className="text-xs text-zinc-500 mb-4">{statusTotal} Total Analyses</p>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#09090b">{statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {statusData.map((d, i) => { const pct = statusTotal > 0 ? ((d.value / statusTotal) * 100).toFixed(1) : '0'; return (<div key={d.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} /><span className="text-sm text-zinc-200">{d.name}</span></div><span className="text-sm font-medium tabular-nums text-zinc-400">{pct}%</span></div>); })}
              </div>
            </div>
          ) : (<div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No analyses yet</div>)}
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <p className="font-semibold text-zinc-100 mb-1">Top Opportunities</p>
          <p className="text-xs text-zinc-500 mb-4">By repurposing score</p>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#09090b">{categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {categoryData.map((d, i) => (<div key={d.name} className="flex items-center justify-between"><div className="flex items-center gap-2 min-w-0"><div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i] }} /><div className="min-w-0"><span className="text-sm text-zinc-200 truncate block">{d.name}</span><span className="text-xs text-zinc-500">{d.molecule}</span></div></div><span className="text-sm font-semibold tabular-nums ml-2 text-zinc-100">{d.value.toFixed(1)}</span></div>))}
              </div>
            </div>
          ) : (<div className="h-40 flex items-center justify-center text-zinc-600 text-sm">Run analyses to discover opportunities</div>)}
        </div>
      </div>

      {/* ── Bottom Row: Table + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <div>
              <p className="font-semibold text-zinc-100">Recent Analyses</p>
              <p className="text-xs text-zinc-500">{analyses.length} total</p>
            </div>
          </div>
          {analyses.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/40">
                    <TableHead className="text-zinc-500">Molecule</TableHead>
                    <TableHead className="hidden sm:table-cell text-zinc-500">Date</TableHead>
                    <TableHead className="text-right text-zinc-500">Phoenix Score</TableHead>
                    <TableHead className="text-right text-zinc-500">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedAnalyses.map((a) => (
                    <TableRow key={a.id} className={clsx('border-zinc-800/40', a.status === 'completed' ? 'cursor-pointer hover:bg-zinc-800/40' : '')} onClick={() => a.status === 'completed' ? navigate(`/report/${a.id}`) : undefined}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback className="rounded-lg text-xs font-bold" style={{ backgroundColor: '#6366f118', color: '#6366f1' }}>{a.molecule.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-zinc-200">{a.molecule}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-zinc-500">{new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell className="text-right">{a.phoenixScore !== null ? <span className={clsx("font-semibold tabular-nums", scoreColor(a.phoenixScore))}>{a.phoenixScore.toFixed(1)}</span> : <span className="text-zinc-500">—</span>}</TableCell>
                      <TableCell className="text-right">{statusBadge(a.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/60">
                <span className="text-xs text-zinc-500">{tablePage * pageSize + 1}-{Math.min((tablePage + 1) * pageSize, analyses.length)} of {analyses.length}</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={tablePage === 0} onClick={() => setTablePage(p => p - 1)}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={tablePage >= totalPages - 1} onClick={() => setTablePage(p => p + 1)}><ChevronRight className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-zinc-600 text-sm">No analyses yet. <button onClick={() => navigate('/search')} className="text-cyan-400 hover:underline">Start your first analysis →</button></div>
          )}
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/60">
            <p className="font-semibold text-zinc-100">Recent Activity</p>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-0">
              {activityItems.length > 0 ? activityItems.map((item, i) => (
                <div key={i}>
                  <div className="flex items-start gap-3 py-3">
                    <Avatar className="h-8 w-8 mt-0.5"><AvatarFallback className="text-xs bg-zinc-800 text-zinc-400">{item.initials}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 leading-tight">{item.type}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-xs text-zinc-600 whitespace-nowrap flex-shrink-0">{timeAgo(item.time)}</span>
                  </div>
                  {i < activityItems.length - 1 && <Separator className="bg-zinc-800/60" />}
                </div>
              )) : (<div className="py-12 text-center text-zinc-600 text-sm">No recent activity</div>)}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════════════
function AdminDashboard({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  if (loading) return <LoadingState />;
  if (!stats) return <EmptyState />;

  const paidUsers = stats.users.researcher + stats.users.organization;
  const conversionRate = stats.users.total ? Math.round((paidUsers / stats.users.total) * 100) : 0;
  const completionRate = stats.analyses.total ? Math.round((stats.analyses.completed / stats.analyses.total) * 100) : 0;

  const planData = [
    { name: 'Free', value: stats.users.free },
    { name: 'Researcher', value: stats.users.researcher },
    { name: 'Organization', value: stats.users.organization },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Completed', value: stats.analyses.completed },
    { name: 'Failed', value: stats.analyses.failed },
    { name: 'Pending', value: stats.analyses.pending },
  ].filter(d => d.value > 0);

  const PLAN_COLORS = ['#6366f1', '#06b6d4', '#a78bfa'];

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard accent="users" icon={Users} label="Total Users" value={stats.users.total.toLocaleString()} trend={`${conversionRate}%`} trendLabel="paid conversion" trendPositive={conversionRate > 5} />
        <StatCard accent="paid" icon={Crown} label="Paid Users" value={paidUsers.toLocaleString()} trend={`+${paidUsers}`} trendLabel="subscribers" trendPositive />
        <StatCard accent="runs" icon={FlaskConical} label="Analyses Run" value={stats.analyses.total.toLocaleString()} trend={`${completionRate}%`} trendLabel="success rate" trendPositive={completionRate > 70} />
        <StatCard accent="active" icon={Zap} label="Active Today" value={stats.users.activeToday.toLocaleString()} />
      </div>

      {/* ── Signup Trend Chart ── */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
        <div className="mb-4">
          <p className="font-semibold text-zinc-100">User Signups</p>
          <p className="text-xs text-zinc-500">Last 30 days</p>
        </div>
          {stats.users.signupTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.users.signupTrend}>
                  <defs>
                    <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }}
                    allowDecimals={false} width={32} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fill="url(#signupFill)" name="Signups" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-zinc-600">No signup data</div>
          )}
        </div>

      {/* ── Pie Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plan Distribution */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <p className="font-semibold text-zinc-100 mb-1">Plan Distribution</p>
          <p className="text-xs text-zinc-500 mb-4">{stats.users.total} users</p>
            {planData.length > 0 ? (
              <div className="flex items-center gap-8">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#09090b">
                        {planData.map((_, i) => <Cell key={i} fill={PLAN_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {planData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PLAN_COLORS[i] }} />
                        <span className="text-sm text-zinc-300">{d.name}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-zinc-100">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No users</div>
            )}
          </div>

        {/* Analysis Pipeline */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <p className="font-semibold text-zinc-100 mb-1">Analysis Pipeline</p>
          <p className="text-xs text-zinc-500 mb-4">{stats.analyses.total} total</p>
            {statusData.length > 0 ? (
              <div className="flex items-center gap-8">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#09090b">
                        {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                        <span className="text-sm text-zinc-300">{d.name}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-zinc-100">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No analyses</div>
            )}
          </div>
        </div>

      {/* ── Top Molecules Table ── */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/60">
          <p className="font-semibold text-zinc-100">Most Analyzed Molecules</p>
          <p className="text-xs text-zinc-500">Platform-wide leaderboard</p>
        </div>
        <div className="p-0">
          {stats.analyses.topMolecules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/40">
                  <TableHead className="w-12 text-zinc-500">#</TableHead>
                  <TableHead className="text-zinc-500">Molecule</TableHead>
                  <TableHead className="text-right text-zinc-500">Analyses</TableHead>
                  <TableHead className="text-right hidden sm:table-cell text-zinc-500">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.analyses.topMolecules.slice(0, 8).map((m, i) => (
                  <TableRow key={m.molecule} className="border-zinc-800/40 hover:bg-zinc-800/30">
                    <TableCell className="font-medium text-zinc-500">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7 rounded-lg">
                          <AvatarFallback className="rounded-lg text-[10px] font-bold" style={{ backgroundColor: '#6366f118', color: '#6366f1' }}>
                            {m.molecule.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-zinc-200">{m.molecule}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-zinc-100">{m.count}</TableCell>
                    <TableCell className="text-right text-zinc-500 hidden sm:table-cell">
                      {stats.analyses.total > 0 ? `${((m.count / stats.analyses.total) * 100).toFixed(1)}%` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-zinc-600 text-sm">No analyses yet</div>
          )}
        </div>
      </div>

      {/* ── Community Health ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard accent="threads" icon={FileText} label="Community Threads" value={stats.community.totalThreads.toLocaleString()} />
        <StatCard accent="comments" icon={MessageSquare} label="Total Comments" value={stats.community.totalComments.toLocaleString()} />
        <StatCard accent="upvotes" icon={ThumbsUp} label="Total Upvotes" value={stats.community.totalUpvotes.toLocaleString()} />
      </div>
    </div>
  );
}

// ── Loading / Empty ────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading analytics...</p>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <BarChart3 className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">No data available yet</p>
      <Button size="sm" onClick={() => navigate('/search')} className="gap-1">
        <Search className="w-3.5 h-3.5" /> Start an Analysis
      </Button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD PAGE
// ════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [section, setSection] = useState<'overview' | 'admin'>('overview');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/user-stats', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/dashboard/recent-activity', { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([statsData, activityData]) => {
        if (statsData.success) setUserStats(statsData);
        if (activityData.success) setActivity(activityData);
      })
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    if (section !== 'admin' || !isAdmin || adminStats) return;
    setLoadingAdmin(true);
    fetch('/api/dashboard/admin-stats', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.success) setAdminStats(data); })
      .catch(console.error)
      .finally(() => setLoadingAdmin(false));
  }, [section, isAdmin]);

  type Section = 'overview' | 'admin';
  const NAV: { id: Section; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    ...(isAdmin ? [{ id: 'admin' as Section, label: 'Admin Panel', icon: Shield }] : []),
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">

        {/* ── Fixed Sidebar ── */}
        <aside className={clsx(
          'fixed inset-y-0 left-0 z-40 w-56 bg-zinc-900 border-r border-zinc-800/60 flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          {/* Brand */}
          <div className="px-4 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                <div className="w-2.5 h-2.5 bg-black rounded-sm" />
              </div>
              <p className="text-xs font-semibold text-zinc-100 tracking-wide uppercase">
                {user?.name?.split(' ')[0] || 'Dashboard'}
              </p>
            </div>
            {userStats?.plan && (
              <Badge className={clsx('text-[10px] capitalize mt-1.5', {
                'bg-purple-500/15 text-purple-300 border-purple-500/30': userStats.plan === 'organization',
                'bg-cyan-500/15 text-cyan-300 border-cyan-500/30': userStats.plan === 'researcher',
                'bg-zinc-700/60 text-zinc-400 border-zinc-600/40': userStats.plan === 'free',
              })}>
                {userStats.plan}
              </Badge>
            )}
          </div>

          {/* Nav sections */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-3 mb-2">Analytics</p>
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  section === item.id
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}

            <div className="pt-3 pb-1">
              <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-3 mb-2">Navigate</p>
            </div>
            {[
              { label: 'New Analysis', icon: Search,       path: '/search'        },
              { label: 'Portfolio',    icon: FileText,     path: '/portfolio'      },
              { label: 'Research Hub', icon: FlaskConical, path: '/research-hub'  },
              { label: 'Research RAG', icon: BookOpen,     path: '/rag'            },
              { label: 'Community',   icon: MessageSquare, path: '/community'     },
              { label: 'Pricing',     icon: Crown,        path: '/pricing'        },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Back to search */}
          <div className="px-2 pb-4 border-t border-zinc-800/60 pt-3">
            <button
              onClick={() => navigate('/search')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" />
              Back to Search
            </button>
          </div>
        </aside>

        {/* Overlay on mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Main content, offset by sidebar ── */}
        <div className={clsx(
          'min-h-screen flex flex-col transition-all duration-200',
          sidebarOpen ? 'lg:ml-56' : 'ml-0'
        )}>

          {/* Top header */}
          <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 px-4 sm:px-6 h-12 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-semibold text-zinc-100 capitalize">
              {section === 'admin' ? 'Admin Panel' : 'Overview'}
            </h1>
            <div className="ml-auto">
              <Button size="sm" onClick={() => navigate('/search')} className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white border-0 h-8 text-xs">
                <Plus className="w-3 h-3" /> New Analysis
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {section === 'admin' ? (
                  <AdminDashboard stats={adminStats} loading={loadingAdmin} />
                ) : (
                  <UserDashboard
                    stats={userStats}
                    activity={activity}
                    loading={loadingUser}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

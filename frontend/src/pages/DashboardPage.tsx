import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
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
  FlaskConical, Target, PieChart as PieIcon, Zap, Download, Plus,
  Filter,
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
function StatCard({ label, value, trend, trendLabel, trendPositive = true, icon: Icon }: {
  label: string; value: string | number; trend?: string; trendLabel?: string; trendPositive?: boolean; icon: any;
}) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-700 ring-0 bg-white dark:bg-zinc-900">
      <CardHeader>
        <CardDescription className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          {label}
          <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
        </CardDescription>
        <CardTitle className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">{value}</CardTitle>
      </CardHeader>
      {trend && (
        <CardContent className="-mt-2">
          <TrendIndicator value={trend} label={trendLabel || ''} positive={trendPositive} />
        </CardContent>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  USER DASHBOARD
// ════════════════════════════════════════════════════════════════════
function UserDashboard({ stats, activity, loading }: { stats: UserStats | null; activity: RecentActivity | null; loading: boolean }) {
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
        <StatCard
          icon={FlaskConical}
          label="Total Analyses"
          value={stats.totalAnalyses.toLocaleString()}
          trend={`${stats.completionRate}%`}
          trendLabel="success rate"
          trendPositive={stats.completionRate >= 70}
        />
        <StatCard
          icon={Target}
          label="Avg Phoenix Score"
          value={stats.avgPhoenixScore > 0 ? stats.avgPhoenixScore.toFixed(1) : '—'}
          trend={stats.avgPhoenixScore >= 7 ? '+Strong' : stats.avgPhoenixScore >= 5 ? 'Moderate' : undefined}
          trendLabel="confidence"
          trendPositive={stats.avgPhoenixScore >= 5}
        />
        <StatCard
          icon={Atom}
          label="Top Molecule"
          value={stats.topMolecule?.name ?? '—'}
          trend={stats.topMolecule ? `${stats.topMolecule.score.toFixed(1)}/10` : undefined}
          trendLabel="Phoenix Score"
          trendPositive={(stats.topMolecule?.score ?? 0) >= 7}
        />
        <StatCard
          icon={Share2}
          label="Shared Reports"
          value={stats.sharedReports.toLocaleString()}
          trend={stats.sharedReports > 0 ? `${stats.sharedReports}` : undefined}
          trendLabel="shared"
          trendPositive
        />
      </div>

      {/* ── Area Chart ── */}
      <Card>
        <CardHeader className="border-b">
          <div>
            <CardTitle>Analysis Trend</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
          <CardAction>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" /> Analyses
              </div>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-4">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                    width={32}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#trendFill)" name="Analyses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data yet — run an analysis to get started
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Pie Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Analysis Status */}
        <Card>
          <CardHeader className="border-b">
            <div>
              <CardTitle>Analysis Status</CardTitle>
              <CardDescription>{statusTotal} Total Analyses</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {statusData.length > 0 ? (
              <div className="flex items-center gap-8">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                        {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {statusData.map((d, i) => {
                    const pct = statusTotal > 0 ? ((d.value / statusTotal) * 100).toFixed(1) : '0';
                    return (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                          <span className="text-sm text-foreground">{d.name}</span>
                        </div>
                        <span className="text-sm font-medium tabular-nums text-muted-foreground">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No analyses yet</div>
            )}
          </CardContent>
        </Card>

        {/* Top Opportunities */}
        <Card>
          <CardHeader className="border-b">
            <div>
              <CardTitle>Top Opportunities</CardTitle>
              <CardDescription>By repurposing score</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-8">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                        {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {categoryData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
                        <div className="min-w-0">
                          <span className="text-sm text-foreground truncate block">{d.name}</span>
                          <span className="text-xs text-muted-foreground">{d.molecule}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold tabular-nums ml-2">{d.value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Run analyses to discover opportunities</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: Table + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Analyses Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>{analyses.length} total</CardDescription>
            </div>
            <CardAction>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Filter className="w-3 h-3" /> Filter
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-0">
            {analyses.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Molecule</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right">Phoenix Score</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedAnalyses.map((a) => (
                      <TableRow
                        key={a.id}
                        className={a.status === 'completed' ? 'cursor-pointer hover:bg-muted/50' : ''}
                        onClick={() => a.status === 'completed' ? navigate(`/report/${a.id}`) : undefined}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                {a.molecule.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{a.molecule}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right">
                          {a.phoenixScore !== null ? (
                            <span className={clsx("font-semibold tabular-nums", scoreColor(a.phoenixScore))}>
                              {a.phoenixScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {statusBadge(a.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {tablePage * pageSize + 1}-{Math.min((tablePage + 1) * pageSize, analyses.length)} of {analyses.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={tablePage === 0} onClick={() => setTablePage(p => p - 1)}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={tablePage >= totalPages - 1} onClick={() => setTablePage(p => p + 1)}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No analyses yet.{' '}
                <button onClick={() => navigate('/search')} className="text-primary hover:underline">Start your first analysis →</button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-0">
                {activityItems.length > 0 ? activityItems.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3 py-3">
                      <Avatar className="h-8 w-8 mt-0.5">
                        <AvatarFallback className="text-xs bg-muted">{item.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight">{item.type}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.desc}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{timeAgo(item.time)}</span>
                    </div>
                    {i < activityItems.length - 1 && <Separator />}
                  </div>
                )) : (
                  <div className="py-12 text-center text-muted-foreground text-sm">No recent activity</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
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
        <StatCard icon={Users} label="Total Users" value={stats.users.total.toLocaleString()} trend={`${conversionRate}%`} trendLabel="paid conversion" trendPositive={conversionRate > 5} />
        <StatCard icon={Crown} label="Paid Users" value={paidUsers.toLocaleString()} trend={`+${paidUsers}`} trendLabel="subscribers" trendPositive />
        <StatCard icon={FlaskConical} label="Analyses Run" value={stats.analyses.total.toLocaleString()} trend={`${completionRate}%`} trendLabel="success rate" trendPositive={completionRate > 70} />
        <StatCard icon={Zap} label="Active Today" value={stats.users.activeToday.toLocaleString()} />
      </div>

      {/* ── Signup Trend Chart ── */}
      <Card>
        <CardHeader className="border-b">
          <div>
            <CardTitle>User Signups</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
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
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false} width={32} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fill="url(#signupFill)" name="Signups" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">No signup data</div>
          )}
        </CardContent>
      </Card>

      {/* ── Pie Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plan Distribution */}
        <Card>
          <CardHeader className="border-b">
            <div>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>{stats.users.total} users</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {planData.length > 0 ? (
              <div className="flex items-center gap-8">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
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
                        <span className="text-sm">{d.name}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No users</div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Pipeline */}
        <Card>
          <CardHeader className="border-b">
            <div>
              <CardTitle>Analysis Pipeline</CardTitle>
              <CardDescription>{stats.analyses.total} total</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {statusData.length > 0 ? (
              <div className="flex items-center gap-8">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
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
                        <span className="text-sm">{d.name}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No analyses</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Top Molecules Table ── */}
      <Card>
        <CardHeader className="border-b">
          <div>
            <CardTitle>Most Analyzed Molecules</CardTitle>
            <CardDescription>Platform-wide leaderboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {stats.analyses.topMolecules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Molecule</TableHead>
                  <TableHead className="text-right">Analyses</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.analyses.topMolecules.slice(0, 8).map((m, i) => (
                  <TableRow key={m.molecule}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                            {m.molecule.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{m.molecule}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{m.count}</TableCell>
                    <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                      {stats.analyses.total > 0 ? `${((m.count / stats.analyses.total) * 100).toFixed(1)}%` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">No analyses yet</div>
          )}
        </CardContent>
      </Card>

      {/* ── Community Health ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Community Threads" value={stats.community.totalThreads.toLocaleString()} />
        <StatCard icon={MessageSquare} label="Total Comments" value={stats.community.totalComments.toLocaleString()} />
        <StatCard icon={ThumbsUp} label="Total Upvotes" value={stats.community.totalUpvotes.toLocaleString()} />
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

  const [tab, setTab] = useState<'user' | 'admin'>('user');
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
    if (tab !== 'admin' || !isAdmin || adminStats) return;
    setLoadingAdmin(true);
    fetch('/api/dashboard/admin-stats', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.success) setAdminStats(data); })
      .catch(console.error)
      .finally(() => setLoadingAdmin(false));
  }, [tab, isAdmin]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-muted/40">
        {/* ── Header ── */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/search')} className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Separator orientation="vertical" className="h-5" />
                <h1 className="text-sm font-semibold text-foreground hidden sm:block">Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/portfolio')} className="gap-1.5 hidden sm:flex">
                  <FileText className="w-3.5 h-3.5" /> Portfolio
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/community')} className="gap-1.5 hidden sm:flex">
                  <MessageSquare className="w-3.5 h-3.5" /> Community
                </Button>
                <Button size="sm" onClick={() => navigate('/search')} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> New Analysis
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Welcome Banner ── */}
        <div className="bg-background border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome Back, {user?.name?.split(' ')[0] || 'Researcher'}!
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {userStats
                    ? `You have ${userStats.totalAnalyses} analyses across ${userStats.completedAnalyses} completed reports`
                    : 'Your research intelligence dashboard'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/search')}>
                  <Plus className="w-3.5 h-3.5" /> New Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher (admin only) ── */}
        {isAdmin && (
          <div className="bg-background border-b border-border">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-0">
                <button
                  onClick={() => setTab('user')}
                  className={clsx(
                    "px-4 py-3 text-sm font-medium transition-colors relative",
                    tab === 'user' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> My Dashboard
                  </div>
                  {tab === 'user' && (
                    <motion.div layoutId="dash-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setTab('admin')}
                  className={clsx(
                    "px-4 py-3 text-sm font-medium transition-colors relative",
                    tab === 'admin' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Admin Panel
                  </div>
                  {tab === 'admin' && (
                    <motion.div layoutId="dash-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            {tab === 'user' ? (
              <motion.div key="user" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <UserDashboard stats={userStats} activity={activity} loading={loadingUser} />
              </motion.div>
            ) : (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <AdminDashboard stats={adminStats} loading={loadingAdmin} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
}

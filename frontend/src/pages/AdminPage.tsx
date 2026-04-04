import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, FlaskConical, ChevronLeft, Ban, Trash2,
  Search, Crown, TrendingUp, AlertTriangle, X, RefreshCw, Clock,
  Activity, Zap, BarChart3, UserCheck, UserX, ShieldCheck, ChevronRight,
  CheckCircle2, XCircle, Loader2, Eye, Menu,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { clsx } from 'clsx';

// ── Types ──────────────────────────────────────────────────────────
interface AdminStats {
  users: {
    total: number; free: number; researcher: number; organization: number;
    banned: number; activeToday: number;
    signupTrend: { date: string; count: number }[];
  };
  analyses: {
    total: number; completed: number; failed: number; pending: number;
    platformAvgScore: number;
    topMolecules: { molecule: string; count: number }[];
    analysesTrend: { date: string; count: number }[];
  };
  community: { totalThreads: number; totalComments: number; totalUpvotes: number };
}

interface AdminUser {
  _id: string; email: string; name?: string;
  plan: 'free' | 'researcher' | 'organization';
  isActive: boolean; bannedUntil?: string; role: string;
  authProvider: string; createdAt: string; lastLogin?: string; jobCount: number;
}

interface AdminJob {
  id: string; molecule: string; status: string;
  phoenixScore: number | null; createdAt: string;
  user: { email: string; name?: string } | null;
}

// ── Helpers ────────────────────────────────────────────────────────
function timeAgo(date: string) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function planBadge(plan: string) {
  if (plan === 'organization') return <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-xs">Organization</Badge>;
  if (plan === 'researcher') return <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-xs">Researcher</Badge>;
  return <Badge className="bg-zinc-700/60 text-zinc-400 border-zinc-600/40 text-xs">Free</Badge>;
}

function statusBadge(status: string) {
  if (status === 'completed') return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">Completed</Badge>;
  if (status === 'failed') return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs">Failed</Badge>;
  if (status === 'processing') return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs">Processing</Badge>;
  return <Badge className="bg-zinc-700/60 text-zinc-400 border-zinc-600/40 text-xs">Pending</Badge>;
}

const CHART_COLORS = { cyan: '#06b6d4', indigo: '#6366f1', green: '#10b981', red: '#f43f5e', amber: '#f59e0b', purple: '#a78bfa' };
const PIE_PLAN = [CHART_COLORS.indigo, CHART_COLORS.cyan, CHART_COLORS.purple];
const PIE_STATUS = [CHART_COLORS.green, CHART_COLORS.red, CHART_COLORS.amber];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2 shadow-xl text-sm">
      <p className="text-zinc-500 text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold text-zinc-100">{p.value} <span className="text-zinc-500 text-xs font-normal">{p.name}</span></p>
      ))}
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: any; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-zinc-100 tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Ban Modal ──────────────────────────────────────────────────────
function BanModal({ user, onConfirm, onClose }: {
  user: AdminUser;
  onConfirm: (isActive: boolean, bannedUntil?: string) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'temp' | 'permanent'>('temp');
  const [duration, setDuration] = useState('24h');
  const [loading, setLoading] = useState(false);

  const durationOptions = [
    { label: '1 hour', value: '1h' }, { label: '6 hours', value: '6h' },
    { label: '24 hours', value: '24h' }, { label: '3 days', value: '3d' },
    { label: '7 days', value: '7d' }, { label: '30 days', value: '30d' },
  ];

  const parseDuration = (d: string): Date => {
    const now = Date.now();
    const map: Record<string, number> = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '3d': 259200000, '7d': 604800000, '30d': 2592000000 };
    return new Date(now + (map[d] ?? 86400000));
  };

  const handleConfirm = async () => {
    setLoading(true);
    if (mode === 'permanent') {
      await onConfirm(false);
    } else {
      await onConfirm(false, parseDuration(duration).toISOString());
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
              <Ban className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="font-semibold text-zinc-100">Ban User</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-sm text-zinc-400 mb-5">
          Banning <span className="text-zinc-200 font-medium">{user.email}</span>. They will be immediately logged out.
        </p>

        <div className="space-y-3 mb-5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={clsx('w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors', mode === 'temp' ? 'border-cyan-400 bg-cyan-400' : 'border-zinc-600 group-hover:border-zinc-400')}>
              {mode === 'temp' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
            </div>
            <input type="radio" className="hidden" checked={mode === 'temp'} onChange={() => setMode('temp')} />
            <div>
              <p className="text-sm text-zinc-200 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> Temporary suspension</p>
              <p className="text-xs text-zinc-500">Auto-lifts after the selected period</p>
            </div>
          </label>

          {mode === 'temp' && (
            <div className="ml-7 flex flex-wrap gap-2">
              {durationOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors', duration === opt.value ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-600')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={clsx('w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors', mode === 'permanent' ? 'border-red-400 bg-red-400' : 'border-zinc-600 group-hover:border-zinc-400')}>
              {mode === 'permanent' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
            </div>
            <input type="radio" className="hidden" checked={mode === 'permanent'} onChange={() => setMode('permanent')} />
            <div>
              <p className="text-sm text-zinc-200 font-medium flex items-center gap-1.5"><Ban className="w-3.5 h-3.5 text-red-400" /> Permanent ban</p>
              <p className="text-xs text-zinc-500">Account deactivated indefinitely</p>
            </div>
          </label>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">Cancel</Button>
          <Button size="sm" onClick={handleConfirm} disabled={loading}
            className={clsx('gap-1.5', mode === 'permanent' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white')}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
            {mode === 'permanent' ? 'Permanently Ban' : 'Suspend'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────
function DeleteModal({ user, onConfirm, onClose }: { user: AdminUser; onConfirm: () => void; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState('');

  const handle = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="font-semibold text-zinc-100">Delete User</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
        </div>

        <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">
              This will permanently delete <span className="font-semibold">{user.email}</span> and all their analyses ({user.jobCount} jobs). This cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mb-2">Type <span className="text-zinc-300 font-mono">delete</span> to confirm:</p>
        <Input
          value={confirmed}
          onChange={e => setConfirmed(e.target.value)}
          placeholder="delete"
          className="mb-4 bg-zinc-800/60 border-zinc-700/60 text-zinc-100 placeholder-zinc-600"
        />

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">Cancel</Button>
          <Button size="sm" onClick={handle} disabled={confirmed !== 'delete' || loading}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Permanently
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Overview Section ───────────────────────────────────────────────
function OverviewSection({ stats }: { stats: AdminStats }) {
  const paidUsers = stats.users.researcher + stats.users.organization;
  const convRate = stats.users.total ? Math.round((paidUsers / stats.users.total) * 100) : 0;
  const completionRate = stats.analyses.total ? Math.round((stats.analyses.completed / stats.analyses.total) * 100) : 0;

  const planData = [
    { name: 'Free', value: stats.users.free },
    { name: 'Researcher', value: stats.users.researcher },
    { name: 'Organization', value: stats.users.organization },
  ].filter(d => d.value > 0);

  const pipelineData = [
    { name: 'Completed', value: stats.analyses.completed },
    { name: 'Failed', value: stats.analyses.failed },
    { name: 'Pending', value: stats.analyses.pending },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Users" value={stats.users.total} sub={`${convRate}% paid conversion`} color={CHART_COLORS.cyan} />
        <KpiCard icon={Crown} label="Paid Users" value={paidUsers} sub={`${stats.users.organization} organizations`} color={CHART_COLORS.purple} />
        <KpiCard icon={FlaskConical} label="Analyses Run" value={stats.analyses.total} sub={`${completionRate}% success rate`} color={CHART_COLORS.indigo} />
        <KpiCard icon={Zap} label="Active Today" value={stats.users.activeToday} sub={`${stats.users.banned} banned accounts`} color={CHART_COLORS.amber} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={CheckCircle2} label="Completed" value={stats.analyses.completed} color={CHART_COLORS.green} />
        <KpiCard icon={XCircle} label="Failed" value={stats.analyses.failed} color={CHART_COLORS.red} />
        <KpiCard icon={TrendingUp} label="Avg Phoenix Score" value={stats.analyses.platformAvgScore > 0 ? `${stats.analyses.platformAvgScore}/10` : '—'} color={CHART_COLORS.cyan} />
        <KpiCard icon={Activity} label="Community Posts" value={stats.community.totalThreads} sub={`${stats.community.totalComments} comments`} color={CHART_COLORS.indigo} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Signups trend */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="mb-4">
            <p className="font-semibold text-zinc-100">User Signups</p>
            <p className="text-xs text-zinc-500">Last 30 days</p>
          </div>
          <div className="h-52">
            {stats.users.signupTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.users.signupTrend}>
                  <defs>
                    <linearGradient id="signFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }}
                    tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    axisLine={{ stroke: '#27272a' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} width={28} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#signFill)" name="Signups" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm">No signup data yet</div>
            )}
          </div>
        </div>

        {/* Analyses trend */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="mb-4">
            <p className="font-semibold text-zinc-100">Analyses Per Day</p>
            <p className="text-xs text-zinc-500">Last 30 days</p>
          </div>
          <div className="h-52">
            {stats.analyses.analysesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.analyses.analysesTrend} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }}
                    tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    axisLine={{ stroke: '#27272a' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} width={28} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={CHART_COLORS.indigo} radius={[3, 3, 0, 0]} name="Analyses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm">No analyses data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Pie charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plan distribution */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <p className="font-semibold text-zinc-100 mb-1">Plan Distribution</p>
          <p className="text-xs text-zinc-500 mb-4">{stats.users.total} total users</p>
          {planData.length > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" strokeWidth={2} stroke="#09090b">
                      {planData.map((_, i) => <Cell key={i} fill={PIE_PLAN[i % PIE_PLAN.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {planData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_PLAN[i] }} />
                      <span className="text-sm text-zinc-300">{d.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold tabular-nums text-zinc-100">{d.value}</span>
                      <span className="text-xs text-zinc-500 ml-1.5">{stats.users.total > 0 ? `${((d.value / stats.users.total) * 100).toFixed(0)}%` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No users yet</div>
          )}
        </div>

        {/* Analysis pipeline */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <p className="font-semibold text-zinc-100 mb-1">Analysis Pipeline</p>
          <p className="text-xs text-zinc-500 mb-4">{stats.analyses.total} total analyses</p>
          {pipelineData.length > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" strokeWidth={2} stroke="#09090b">
                      {pipelineData.map((_, i) => <Cell key={i} fill={PIE_STATUS[i % PIE_STATUS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {pipelineData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_STATUS[i] }} />
                      <span className="text-sm text-zinc-300">{d.name}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-zinc-100">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No analyses yet</div>
          )}
        </div>
      </div>

      {/* Top Molecules */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/60">
          <p className="font-semibold text-zinc-100">Most Analyzed Molecules</p>
          <p className="text-xs text-zinc-500">Platform-wide leaderboard</p>
        </div>
        {stats.analyses.topMolecules.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/40 hover:bg-transparent">
                <TableHead className="text-zinc-500 w-10">#</TableHead>
                <TableHead className="text-zinc-500">Molecule</TableHead>
                <TableHead className="text-zinc-500 text-right">Analyses</TableHead>
                <TableHead className="text-zinc-500 text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.analyses.topMolecules.slice(0, 8).map((m, i) => (
                <TableRow key={m.molecule} className="border-zinc-800/40 hover:bg-zinc-800/30">
                  <TableCell className="text-zinc-500 font-medium">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 rounded-lg">
                        <AvatarFallback className="rounded-lg text-[10px] font-bold" style={{ backgroundColor: `${CHART_COLORS.indigo}18`, color: CHART_COLORS.indigo }}>
                          {m.molecule.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-zinc-200">{m.molecule}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-zinc-100">{m.count}</TableCell>
                  <TableCell className="text-right text-zinc-500">
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
  );
}

// ── Users Section ──────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      if (statusFilter) params.set('status', statusFilter);
      const r = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      const d = await r.json();
      if (d.success) { setUsers(d.users); setTotal(d.total); setPages(d.pages); }
    } catch {}
    setLoading(false);
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const flash = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const updateUser = async (id: string, body: object) => {
    const r = await fetch(`/api/admin/users/${id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  };

  const handleBan = async (isActive: boolean, bannedUntil?: string) => {
    if (!banTarget) return;
    const res = await updateUser(banTarget._id, { isActive, bannedUntil });
    if (res.success) {
      flash(bannedUntil ? `${banTarget.email} suspended` : `${banTarget.email} permanently banned`);
      setBanTarget(null);
      fetchUsers();
    }
  };

  const handleUnban = async (u: AdminUser) => {
    const res = await updateUser(u._id, { isActive: true, bannedUntil: null });
    if (res.success) { flash(`${u.email} unbanned`); fetchUsers(); }
  };

  const handlePlanChange = async (u: AdminUser, plan: string) => {
    const res = await updateUser(u._id, { plan });
    if (res.success) { flash(`${u.email} plan changed to ${plan}`); fetchUsers(); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const r = await fetch(`/api/admin/users/${deleteTarget._id}`, { method: 'DELETE', credentials: 'include' });
    const res = await r.json();
    if (res.success) { flash(`Deleted ${deleteTarget.email}`); setDeleteTarget(null); fetchUsers(); }
  };

  return (
    <div className="space-y-4">
      {actionMsg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl px-4 py-3 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {actionMsg}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email or name..."
            className="pl-9 bg-zinc-900/60 border-zinc-700/60 text-zinc-100 placeholder-zinc-500" />
        </div>
        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-700/60 text-zinc-300 text-sm focus:outline-none focus:border-cyan-500/50">
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="researcher">Researcher</option>
          <option value="organization">Organization</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-700/60 text-zinc-300 text-sm focus:outline-none focus:border-cyan-500/50">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
        <Button variant="ghost" size="sm" onClick={fetchUsers} className="text-zinc-400 hover:text-zinc-200 border border-zinc-700/60">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats row */}
      <p className="text-xs text-zinc-500">{total.toLocaleString()} users found</p>

      {/* Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-zinc-600 text-sm">No users found</div>
        ) : (
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/40 hover:bg-transparent">
                  <TableHead className="text-zinc-500">User</TableHead>
                  <TableHead className="text-zinc-500">Plan</TableHead>
                  <TableHead className="text-zinc-500 hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-zinc-500 hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-zinc-500 hidden lg:table-cell">Last Login</TableHead>
                  <TableHead className="text-zinc-500 text-center hidden sm:table-cell">Jobs</TableHead>
                  <TableHead className="text-zinc-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u._id} className="border-zinc-800/40 hover:bg-zinc-800/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs font-bold bg-zinc-800 text-zinc-300">
                            {(u.name || u.email).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{u.name || '—'}</p>
                          <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                        </div>
                        {u.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={u.plan}
                        onChange={e => handlePlanChange(u, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 focus:outline-none focus:border-cyan-500/60 cursor-pointer"
                      >
                        <option value="free">Free</option>
                        <option value="researcher">Researcher</option>
                        <option value="organization">Organization</option>
                      </select>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {u.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Active</Badge>
                      ) : (
                        <div>
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Banned</Badge>
                          {u.bannedUntil && (
                            <p className="text-[10px] text-zinc-500 mt-0.5">Until {fmt(u.bannedUntil)}</p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm hidden lg:table-cell">{fmt(u.createdAt)}</TableCell>
                    <TableCell className="text-zinc-500 text-sm hidden lg:table-cell">{u.lastLogin ? timeAgo(u.lastLogin) : '—'}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <span className="text-sm font-semibold tabular-nums text-zinc-300">{u.jobCount}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.isActive ? (
                          <Button size="sm" variant="ghost"
                            onClick={() => setBanTarget(u)}
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10">
                            <Ban className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost"
                            onClick={() => handleUnban(u)}
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                            <UserCheck className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {u.role !== 'admin' && (
                          <Button size="sm" variant="ghost"
                            onClick={() => setDeleteTarget(u)}
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Page {page} of {pages}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 border border-zinc-700/60 text-zinc-400" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 border border-zinc-700/60 text-zinc-400" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {banTarget && <BanModal user={banTarget} onConfirm={handleBan} onClose={() => setBanTarget(null)} />}
      {deleteTarget && <DeleteModal user={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ── Analyses Section ───────────────────────────────────────────────
function AnalysesSection() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const r = await fetch(`/api/admin/jobs?${params}`, { credentials: 'include' });
      const d = await r.json();
      if (d.success) { setJobs(d.jobs); setTotal(d.total); setPages(d.pages); }
    } catch {}
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by molecule..."
            className="pl-9 bg-zinc-900/60 border-zinc-700/60 text-zinc-100 placeholder-zinc-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-700/60 text-zinc-300 text-sm focus:outline-none focus:border-cyan-500/50">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
        </select>
        <Button variant="ghost" size="sm" onClick={fetchJobs} className="text-zinc-400 hover:text-zinc-200 border border-zinc-700/60">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-zinc-500">{total.toLocaleString()} analyses found</p>

      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center text-zinc-600 text-sm">No analyses found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/40 hover:bg-transparent">
                <TableHead className="text-zinc-500">Molecule</TableHead>
                <TableHead className="text-zinc-500 hidden md:table-cell">User</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-zinc-500 text-right hidden sm:table-cell">Score</TableHead>
                <TableHead className="text-zinc-500 text-right hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-zinc-500 text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map(j => (
                <TableRow key={String(j.id)} className="border-zinc-800/40 hover:bg-zinc-800/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 rounded-lg">
                        <AvatarFallback className="rounded-lg text-[10px] font-bold" style={{ backgroundColor: `${CHART_COLORS.indigo}18`, color: CHART_COLORS.indigo }}>
                          {j.molecule.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-zinc-200">{j.molecule}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {j.user ? (
                      <div>
                        <p className="text-xs text-zinc-300">{j.user.name || j.user.email}</p>
                        {j.user.name && <p className="text-[10px] text-zinc-600">{j.user.email}</p>}
                      </div>
                    ) : <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell>{statusBadge(j.status)}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {j.phoenixScore !== null ? (
                      <span className={clsx('font-semibold tabular-nums text-sm', j.phoenixScore >= 7.5 ? 'text-emerald-400' : j.phoenixScore >= 5 ? 'text-amber-400' : 'text-red-400')}>
                        {j.phoenixScore.toFixed(1)}
                      </span>
                    ) : <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm hidden lg:table-cell text-right">{timeAgo(j.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {j.status === 'completed' && (
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/report/${j.id}`)}
                        className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-200">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Page {page} of {pages}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 border border-zinc-700/60 text-zinc-400" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 border border-zinc-700/60 text-zinc-400" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────
const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analyses', label: 'Analyses', icon: FlaskConical },
];

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<'overview' | 'users' | 'analyses'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (section !== 'overview' || stats) return;
    setLoadingStats(true);
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d); })
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [section, stats]);

  // Guard: not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
          <p className="text-zinc-400 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">Access Denied</h1>
          <p className="text-zinc-500 text-sm mb-6">This page is restricted to administrators only.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-zinc-700 text-zinc-300">
            <ChevronLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar — always fixed, never in document flow */}
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
            <p className="text-xs font-semibold text-zinc-100 tracking-wide uppercase">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id as any); setSidebarOpen(false); }}
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
        </nav>


      </aside>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main — offset by sidebar width when open */}
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
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-zinc-100 capitalize">{section}</h1>
            {section === 'overview' && stats && (
              <Badge className="bg-zinc-800/80 text-zinc-400 border-zinc-700/40 text-[10px]">Live</Badge>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {section === 'overview' && (
              <button onClick={() => setStats(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 hover:border-zinc-700 transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {section === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {loadingStats ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="text-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
                      <p className="text-zinc-500 text-sm">Loading platform stats...</p>
                    </div>
                  </div>
                ) : stats ? (
                  <OverviewSection stats={stats} />
                ) : (
                  <div className="text-center py-32 text-zinc-600">Failed to load stats</div>
                )}
              </motion.div>
            )}
            {section === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <UsersSection />
              </motion.div>
            )}
            {section === 'analyses' && (
              <motion.div key="analyses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <AnalysesSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

import { Router, Request, Response } from 'express';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { Thread } from '../models/Thread';

const router = Router();

// ── Middleware: require authentication ──
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  next();
}

// ── Middleware: require admin role ──
function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if ((req.user as any).role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
}

// ────────────────────────────────────────────────────────────────
// GET /api/dashboard/user-stats  — Personal analytics
// ────────────────────────────────────────────────────────────────
router.get('/user-stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;

    // All jobs for this user
    const jobs = await Job.find({ userId }).lean();
    const completed = jobs.filter(j => j.status === 'completed');
    const failed = jobs.filter(j => j.status === 'failed');

    // Phoenix scores across completed reports
    const scores = completed
      .map(j => j.reportData?.phoenix_score)
      .filter((s): s is number => typeof s === 'number');
    const avgScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    const topMoleculeJob = completed.sort((a, b) => (b.reportData?.phoenix_score ?? 0) - (a.reportData?.phoenix_score ?? 0))[0];

    // Weekly trend — last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentJobs = jobs.filter(j => new Date(j.createdAt) >= thirtyDaysAgo);
    const weeklyMap: Record<string, number> = {};
    for (const j of recentJobs) {
      const d = new Date(j.createdAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      weeklyMap[key] = (weeklyMap[key] || 0) + 1;
    }
    const weeklyTrend = Object.entries(weeklyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({ week, count }));

    // Shared reports
    const sharedCount = completed.filter(j => j.shareToken).length;

    // Top repurposing candidates across all reports — deduplicated by condition+molecule
    const allCandidates: any[] = [];
    for (const j of completed) {
      const cands = j.reportData?.repurposing_candidates || [];
      for (const c of cands) {
        allCandidates.push({ ...c, molecule: j.molecule });
      }
    }
    // Keep the highest-scoring entry per unique condition+molecule pair
    const seen = new Map<string, any>();
    for (const c of allCandidates) {
      const key = `${(c.condition || '').toLowerCase()}||${(c.molecule || '').toLowerCase()}`;
      if (!seen.has(key) || (c.repurposing_score ?? 0) > (seen.get(key).repurposing_score ?? 0)) {
        seen.set(key, c);
      }
    }
    const topCandidates = Array.from(seen.values())
      .sort((a, b) => (b.repurposing_score ?? 0) - (a.repurposing_score ?? 0))
      .slice(0, 5);

    // User info
    const user = await User.findById(userId).lean();

    res.json({
      success: true,
      totalAnalyses: jobs.length,
      completedAnalyses: completed.length,
      failedAnalyses: failed.length,
      completionRate: jobs.length ? Math.round((completed.length / jobs.length) * 100) : 0,
      avgPhoenixScore: avgScore,
      topMolecule: topMoleculeJob ? { name: topMoleculeJob.molecule, score: topMoleculeJob.reportData?.phoenix_score } : null,
      weeklyTrend,
      sharedReports: sharedCount,
      topCandidates,
      plan: user?.plan || 'free',
    });
  } catch (error) {
    console.error('[Dashboard] user-stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
  }
});

// ────────────────────────────────────────────────────────────────
// GET /api/dashboard/recent-activity  — Last 10 analyses + recent community posts
// ────────────────────────────────────────────────────────────────
router.get('/recent-activity', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const userName = (req.user as any).name || '';

    const recentJobs = await Job.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('molecule status createdAt reportData.phoenix_score')
      .lean();

    const recentAnalyses = recentJobs.map(j => ({
      id: j._id,
      molecule: j.molecule,
      status: j.status,
      phoenixScore: j.reportData?.phoenix_score ?? null,
      createdAt: j.createdAt,
    }));

    // Community posts by this user (matched by name)
    let communityPosts: any[] = [];
    if (userName) {
      const threads = await Thread.find({ author: userName })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title upvotes comments createdAt')
        .lean();
      communityPosts = threads.map(t => ({
        id: t._id,
        title: t.title,
        upvotes: t.upvotes,
        commentCount: t.comments?.length ?? 0,
        createdAt: t.createdAt,
      }));
    }

    res.json({ success: true, recentAnalyses, communityPosts });
  } catch (error) {
    console.error('[Dashboard] recent-activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity' });
  }
});

// ────────────────────────────────────────────────────────────────
// GET /api/dashboard/admin-stats  — Platform-wide analytics (admin only)
// ────────────────────────────────────────────────────────────────
router.get('/admin-stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    // ── Users ──
    const [totalUsers, freeUsers, researcherUsers, orgUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: 'free' }),
      User.countDocuments({ plan: 'researcher' }),
      User.countDocuments({ plan: 'organization' }),
    ]);

    // Signups over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select('createdAt')
      .lean();
    const signupByDay: Record<string, number> = {};
    for (const u of recentUsers) {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      signupByDay[key] = (signupByDay[key] || 0) + 1;
    }
    const signupTrend = Object.entries(signupByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // ── Analyses ──
    const [totalAnalyses, completedAnalyses, failedAnalyses, pendingAnalyses] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'completed' }),
      Job.countDocuments({ status: 'failed' }),
      Job.countDocuments({ status: { $in: ['pending', 'processing'] } }),
    ]);

    // Top 10 most-analyzed molecules
    const topMolecules = await Job.aggregate([
      { $group: { _id: '$molecule', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Platform-wide avg Phoenix Score
    const avgResult = await Job.aggregate([
      { $match: { status: 'completed', 'reportData.phoenix_score': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$reportData.phoenix_score' } } },
    ]);
    const platformAvgScore = avgResult.length ? Math.round(avgResult[0].avg * 10) / 10 : 0;

    // Active today (users who logged in today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const activeToday = await User.countDocuments({ lastLogin: { $gte: startOfDay } });

    // ── Community ──
    const [totalThreads, threadStats] = await Promise.all([
      Thread.countDocuments(),
      Thread.aggregate([
        {
          $group: {
            _id: null,
            totalComments: { $sum: { $size: '$comments' } },
            totalUpvotes: { $sum: '$upvotes' },
          },
        },
      ]),
    ]);
    const communityStats = {
      totalThreads,
      totalComments: threadStats[0]?.totalComments ?? 0,
      totalUpvotes: threadStats[0]?.totalUpvotes ?? 0,
    };

    res.json({
      success: true,
      users: {
        total: totalUsers,
        free: freeUsers,
        researcher: researcherUsers,
        organization: orgUsers,
        activeToday,
        signupTrend,
      },
      analyses: {
        total: totalAnalyses,
        completed: completedAnalyses,
        failed: failedAnalyses,
        pending: pendingAnalyses,
        platformAvgScore,
        topMolecules: topMolecules.map(m => ({ molecule: m._id, count: m.count })),
      },
      community: communityStats,
    });
  } catch (error) {
    console.error('[Dashboard] admin-stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
});

export default router;

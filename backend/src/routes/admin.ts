import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Thread } from '../models/Thread';

const router = Router();

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if ((req.user as any).role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
}

// ── GET /api/admin/stats ──────────────────────────────────────────
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, freeUsers, researcherUsers, orgUsers, bannedUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: 'free' }),
      User.countDocuments({ plan: 'researcher' }),
      User.countDocuments({ plan: 'organization' }),
      User.countDocuments({ isActive: false }),
    ]);

    // Signups per day — last 30 days
    const recentUsers = await User.find({ createdAt: { $gte: thirtyDaysAgo } }).select('createdAt').lean();
    const signupByDay: Record<string, number> = {};
    for (const u of recentUsers) {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      signupByDay[key] = (signupByDay[key] || 0) + 1;
    }
    const signupTrend = Object.entries(signupByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Analyses per day — last 30 days
    const recentJobs = await Job.find({ createdAt: { $gte: thirtyDaysAgo } }).select('createdAt status').lean();
    const jobsByDay: Record<string, number> = {};
    for (const j of recentJobs) {
      const key = new Date(j.createdAt).toISOString().slice(0, 10);
      jobsByDay[key] = (jobsByDay[key] || 0) + 1;
    }
    const analysesTrend = Object.entries(jobsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const [totalJobs, completedJobs, failedJobs, pendingJobs] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'completed' }),
      Job.countDocuments({ status: 'failed' }),
      Job.countDocuments({ status: { $in: ['pending', 'processing'] } }),
    ]);

    const topMolecules = await Job.aggregate([
      { $group: { _id: '$molecule', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const avgResult = await Job.aggregate([
      { $match: { status: 'completed', 'reportData.phoenix_score': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$reportData.phoenix_score' } } },
    ]);
    const platformAvgScore = avgResult.length ? Math.round(avgResult[0].avg * 10) / 10 : 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const activeToday = await User.countDocuments({ lastLogin: { $gte: startOfDay } });

    const [totalThreads, threadStats] = await Promise.all([
      Thread.countDocuments(),
      Thread.aggregate([
        { $group: { _id: null, totalComments: { $sum: { $size: '$comments' } }, totalUpvotes: { $sum: '$upvotes' } } },
      ]),
    ]);

    res.json({
      success: true,
      users: { total: totalUsers, free: freeUsers, researcher: researcherUsers, organization: orgUsers, banned: bannedUsers, activeToday, signupTrend },
      analyses: { total: totalJobs, completed: completedJobs, failed: failedJobs, pending: pendingJobs, platformAvgScore, topMolecules: topMolecules.map(m => ({ molecule: m._id, count: m.count })), analysesTrend },
      community: { totalThreads, totalComments: threadStats[0]?.totalComments ?? 0, totalUpvotes: threadStats[0]?.totalUpvotes ?? 0 },
    });
  } catch (e) {
    console.error('[Admin] stats error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'))));
    const search = String(req.query.search || '').trim();
    const planFilter = String(req.query.plan || '');
    const statusFilter = String(req.query.status || '');

    const query: Record<string, any> = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (planFilter && ['free', 'researcher', 'organization'].includes(planFilter)) query.plan = planFilter;
    if (statusFilter === 'active') query.isActive = true;
    if (statusFilter === 'banned') query.isActive = false;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -googleId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Attach job counts
    const userIds = users.map(u => u._id);
    const jobCounts = await Job.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const jobCountMap: Record<string, number> = {};
    for (const jc of jobCounts) jobCountMap[String(jc._id)] = jc.count;

    res.json({
      success: true,
      users: users.map(u => ({ ...u, jobCount: jobCountMap[String(u._id)] || 0 })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error('[Admin] users error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// ── PUT /api/admin/users/:id ──────────────────────────────────────
router.put('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = req.user as any;

    if (id === String(adminUser._id)) {
      return res.status(400).json({ success: false, message: 'Cannot modify your own account' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { plan, isActive, bannedUntil } = req.body;

    if (plan !== undefined && ['free', 'researcher', 'organization'].includes(plan)) user.plan = plan;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (bannedUntil !== undefined) user.bannedUntil = bannedUntil ? new Date(bannedUntil) : undefined;

    await user.save();
    res.json({
      success: true,
      user: { id: user._id, email: user.email, plan: user.plan, isActive: user.isActive, bannedUntil: user.bannedUntil },
    });
  } catch (e) {
    console.error('[Admin] update user error:', e);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────
router.delete('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = req.user as any;

    if (id === String(adminUser._id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await Promise.all([
      User.findByIdAndDelete(id),
      Job.deleteMany({ userId: id }),
    ]);

    res.json({ success: true, message: 'User and all their data deleted' });
  } catch (e) {
    console.error('[Admin] delete user error:', e);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// ── GET /api/admin/jobs ───────────────────────────────────────────
router.get('/jobs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'))));
    const search = String(req.query.search || '').trim();
    const statusFilter = String(req.query.status || '');

    const query: Record<string, any> = {};
    if (search) query.molecule = { $regex: search, $options: 'i' };
    if (statusFilter && ['completed', 'failed', 'pending', 'processing'].includes(statusFilter)) query.status = statusFilter;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select('molecule status progress createdAt userId reportData.phoenix_score')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    const userIds = [...new Set(jobs.map(j => j.userId?.toString()).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).select('email name').lean();
    const userMap: Record<string, any> = {};
    for (const u of users) userMap[String(u._id)] = u;

    res.json({
      success: true,
      jobs: jobs.map(j => ({
        id: j._id,
        molecule: j.molecule,
        status: j.status,
        progress: j.progress,
        phoenixScore: (j.reportData as any)?.phoenix_score ?? null,
        createdAt: j.createdAt,
        user: j.userId ? (userMap[j.userId.toString()] ?? null) : null,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error('[Admin] jobs error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
  }
});

export default router;

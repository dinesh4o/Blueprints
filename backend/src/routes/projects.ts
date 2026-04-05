import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { ResearchProject } from '../models/ResearchProject';
import { Job } from '../models/Job';

const router = Router();

/* ── helper: require auth ─────────────────────────────────────────────────── */
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

/* ── helper: push activity (capped at 50) ─────────────────────────────────── */
function pushActivity(project: any, action: string, user: any, detail?: string) {
  project.activity.unshift({
    action,
    userId: (user as any)._id?.toString() || (user as any).id,
    userName: (user as any).name || 'Unknown',
    detail,
    createdAt: new Date(),
  });
  if (project.activity.length > 50) project.activity = project.activity.slice(0, 50);
}

// ── GET /api/projects ─────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tag, sort, search, page = '1', limit = '20' } = req.query;
    const filter: any = { visibility: 'public', status: 'active' };

    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { molecule: { $regex: search, $options: 'i' } },
        { disease: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: Record<string, 1 | -1> =
      sort === 'stars' ? { 'stars.length': -1 as const } :
      sort === 'oldest' ? { createdAt: 1 as const } :
      { createdAt: -1 as const };

    let query = ResearchProject.find(filter)
      .sort(sortObj as any)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const [projects, total] = await Promise.all([
      query,
      ResearchProject.countDocuments(filter),
    ]);

    // Enrich with contributor info
    const ownerIds = [...new Set(projects.map((p: any) => p.owner))];
    const owners = await User.find({ _id: { $in: ownerIds } }).select('name email').lean();
    const ownerMap = new Map(owners.map((o: any) => [o._id.toString(), o]));

    const enriched = projects.map((p: any) => ({
      ...p,
      ownerName: ownerMap.get(p.owner)?.name || 'Unknown',
      starCount: p.stars?.length || 0,
      collaboratorCount: (p.collaborators?.length || 0) + 1,
      contributors: [
        { name: ownerMap.get(p.owner)?.name || 'Unknown', role: 'owner' },
        ...(p.collaborators || []).map((c: any) => ({ name: c.name, role: c.role })),
      ],
    }));

    res.json({ projects: enriched, total, page: Number(page), limit: Number(limit) });
  } catch (err: any) {
    console.error('[Projects] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ── GET /api/projects/my ──────────────────────────────────────────────────────
router.get('/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;

    const projects = await ResearchProject.find({
      $or: [
        { owner: userId },
        { 'collaborators.userId': userId },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ projects });
  } catch (err: any) {
    console.error('[Projects] My projects error:', err.message);
    res.status(500).json({ error: 'Failed to fetch your projects' });
  }
});

// ── POST /api/projects ────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    const userName = (req.user as any).name || 'Unknown';
    const { title, description, molecule, disease, tags, visibility } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    const project = await ResearchProject.create({
      title: title.trim(),
      description: description || '',
      molecule,
      disease,
      tags: tags || [],
      owner: userId,
      ownerName: userName,
      visibility: visibility || 'public',
      collaborators: [{ userId, name: userName, role: 'owner', joinedAt: new Date() }],
      activity: [{ action: 'created', userId, userName, createdAt: new Date() }],
    });

    res.status(201).json({ project });
  } catch (err: any) {
    console.error('[Projects] Create error:', err.message);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ── GET /api/projects/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await ResearchProject.findById(req.params.id)
      .lean();

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Enrich analyses with job data
    const jobIds = (project.analyses || []).map((a: any) => a.jobId);
    const jobs = jobIds.length
      ? await Job.find({ _id: { $in: jobIds } }).select('molecule status result createdAt').lean()
      : [];
    const jobMap = new Map(jobs.map((j: any) => [j._id.toString(), j]));

    const enrichedAnalyses = (project.analyses || []).map((a: any) => ({
      ...a,
      job: jobMap.get(a.jobId) || null,
    }));

    // Owner info
    const owner = await User.findById(project.owner).select('name email').lean();

    res.json({
      project: {
        ...project,
        ownerName: owner?.name || project.ownerName || 'Unknown',
        analyses: enrichedAnalyses,
        starCount: project.stars?.length || 0,
      },
    });
  } catch (err: any) {
    console.error('[Projects] Get error:', err.message);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// ── PUT /api/projects/:id ─────────────────────────────────────────────────────
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    const { title, description, molecule, disease, tags, visibility, status } = req.body;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner !== userId) return res.status(403).json({ error: 'Not authorized' });

    if (title !== undefined) project.title = title.trim();
    if (description !== undefined) project.description = description;
    if (molecule !== undefined) project.molecule = molecule;
    if (disease !== undefined) project.disease = disease;
    if (tags !== undefined) project.tags = tags;
    if (visibility !== undefined) project.visibility = visibility;
    if (status !== undefined) project.status = status;

    pushActivity(project, 'updated', req.user!, `Updated project settings`);
    await project.save();

    res.json({ project });
  } catch (err: any) {
    console.error('[Projects] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ── DELETE /api/projects/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner !== userId) return res.status(403).json({ error: 'Not authorized' });

    await project.deleteOne();
    res.json({ ok: true });
  } catch (err: any) {
    console.error('[Projects] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ── POST /api/projects/:id/star ───────────────────────────────────────────────
router.post('/:id/star', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const idx = project.stars.indexOf(userId);
    if (idx >= 0) {
      project.stars.splice(idx, 1);
    } else {
      project.stars.push(userId);
    }

    await project.save();
    res.json({ starred: idx < 0, starCount: project.stars.length });
  } catch (err: any) {
    console.error('[Projects] Star error:', err.message);
    res.status(500).json({ error: 'Failed to star project' });
  }
});

// ── POST /api/projects/:id/fork ───────────────────────────────────────────────
router.post('/:id/fork', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    const userName = (req.user as any).name || 'Unknown';

    const original = await ResearchProject.findById(req.params.id).lean() as any;
    if (!original) return res.status(404).json({ error: 'Project not found' });

    // Create fork
    const forked = await ResearchProject.create({
      title: `${original.title} (fork)`,
      description: original.description,
      molecule: original.molecule,
      disease: original.disease,
      tags: original.tags,
      owner: userId,
      ownerName: userName,
      visibility: 'public',
      forkOf: original._id,
      collaborators: [{ userId, name: userName, role: 'owner', joinedAt: new Date() }],
      hypotheses: original.hypotheses || [],
      activity: [{ action: 'forked', userId, userName, detail: `Forked from ${original.title}`, createdAt: new Date() }],
    });

    await ResearchProject.findByIdAndUpdate(original._id, { $inc: { forkCount: 1 } });

    res.status(201).json({ project: forked });
  } catch (err: any) {
    console.error('[Projects] Fork error:', err.message);
    res.status(500).json({ error: 'Failed to fork project' });
  }
});

// ── POST /api/projects/:id/analyses ──────────────────────────────────────────
router.post('/:id/analyses', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    const { jobId, title } = req.body;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check permission
    const isOwner = project.owner === userId;
    const isCollab = project.collaborators.some(
      (c) => c.userId === userId && ['owner', 'editor'].includes(c.role)
    );
    if (!isOwner && !isCollab) return res.status(403).json({ error: 'Not authorized' });

    // Avoid duplicate
    if (project.analyses.some((a) => a.jobId === jobId)) {
      return res.status(409).json({ error: 'Analysis already added' });
    }

    project.analyses.push({ jobId, title, addedAt: new Date() });
    pushActivity(project, 'added_analysis', req.user!, `Added analysis: ${title || jobId}`);
    await project.save();

    res.json({ ok: true, analyses: project.analyses });
  } catch (err: any) {
    console.error('[Projects] Add analysis error:', err.message);
    res.status(500).json({ error: 'Failed to add analysis' });
  }
});

// ── DELETE /api/projects/:id/analyses/:jobId ─────────────────────────────────
router.delete('/:id/analyses/:jobId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner !== userId) return res.status(403).json({ error: 'Not authorized' });

    project.analyses = project.analyses.filter((a) => a.jobId !== req.params.jobId) as any;
    pushActivity(project, 'removed_analysis', req.user!, `Removed analysis: ${req.params.jobId}`);
    await project.save();

    res.json({ ok: true });
  } catch (err: any) {
    console.error('[Projects] Remove analysis error:', err.message);
    res.status(500).json({ error: 'Failed to remove analysis' });
  }
});

// ── POST /api/projects/:id/hypotheses ────────────────────────────────────────
router.post('/:id/hypotheses', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    const userName = (req.user as any).name || 'Unknown';
    const { title, description } = req.body;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.hypotheses.push({
      title,
      description: description || '',
      status: 'proposed',
      authorId: userId,
      authorName: userName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    pushActivity(project, 'added_hypothesis', req.user!, `Proposed: ${title}`);
    await project.save();

    res.json({ ok: true, hypotheses: project.hypotheses });
  } catch (err: any) {
    console.error('[Projects] Add hypothesis error:', err.message);
    res.status(500).json({ error: 'Failed to add hypothesis' });
  }
});

// ── PUT /api/projects/:id/hypotheses/:hid ────────────────────────────────────
router.put('/:id/hypotheses/:hid', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    const { status, title, description } = req.body;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const hyp = project.hypotheses.find((h: any) => h._id?.toString() === req.params.hid);
    if (!hyp) return res.status(404).json({ error: 'Hypothesis not found' });

    if (status) hyp.status = status;
    if (title) hyp.title = title;
    if (description !== undefined) hyp.description = description;
    hyp.updatedAt = new Date();

    pushActivity(project, 'updated_hypothesis', req.user!, `Updated hypothesis: ${hyp.title}`);
    await project.save();

    res.json({ ok: true, hypotheses: project.hypotheses });
  } catch (err: any) {
    console.error('[Projects] Update hypothesis error:', err.message);
    res.status(500).json({ error: 'Failed to update hypothesis' });
  }
});

// ── DELETE /api/projects/:id/hypotheses/:hid ─────────────────────────────────
router.delete('/:id/hypotheses/:hid', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner !== userId) return res.status(403).json({ error: 'Not authorized' });

    const hyp = project.hypotheses.find((h: any) => h._id?.toString() === req.params.hid);
    project.hypotheses = project.hypotheses.filter((h: any) => h._id?.toString() !== req.params.hid) as any;
    pushActivity(project, 'removed_hypothesis', req.user!, `Removed: ${hyp?.title || req.params.hid}`);
    await project.save();

    res.json({ ok: true });
  } catch (err: any) {
    console.error('[Projects] Remove hypothesis error:', err.message);
    res.status(500).json({ error: 'Failed to remove hypothesis' });
  }
});

// ── POST /api/projects/:id/collaborators ─────────────────────────────────────
router.post('/:id/collaborators', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    const { email, role } = req.body;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner !== userId) return res.status(403).json({ error: 'Only owner can add collaborators' });

    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ error: 'User not found' });

    const inviteeId = invitee._id.toString();
    if (project.collaborators.some((c) => c.userId === inviteeId)) {
      return res.status(409).json({ error: 'Already a collaborator' });
    }

    project.collaborators.push({
      userId: inviteeId,
      name: invitee.name || email,
      role: role || 'editor',
      joinedAt: new Date(),
    });

    pushActivity(project, 'added_collaborator', req.user!, `Added ${invitee.name || email} as ${role || 'editor'}`);
    await project.save();

    res.json({ ok: true, collaborators: project.collaborators });
  } catch (err: any) {
    console.error('[Projects] Add collaborator error:', err.message);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// ── DELETE /api/projects/:id/collaborators/:uid ───────────────────────────────
router.delete('/:id/collaborators/:uid', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner !== userId) return res.status(403).json({ error: 'Only owner can remove collaborators' });

    project.collaborators = project.collaborators.filter((c) => c.userId !== req.params.uid) as any;
    pushActivity(project, 'removed_collaborator', req.user!, `Removed collaborator`);
    await project.save();

    res.json({ ok: true });
  } catch (err: any) {
    console.error('[Projects] Remove collaborator error:', err.message);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

// ── GET /api/projects/:id/files ───────────────────────────────────────────────
router.get('/:id/files', async (req: Request, res: Response) => {
  try {
    const { path: folderPath = '' } = req.query;
    const project = await ResearchProject.findById(req.params.id)
      .select('files')
      .lean();

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const prefix = folderPath ? `${folderPath}/` : '';
    const allFiles = project.files || [];

    // Build virtual folder listing at current path level
    const seen = new Set<string>();
    const items: any[] = [];

    for (const f of allFiles) {
      if (prefix && !f.path.startsWith(prefix)) continue;
      if (!prefix && f.path.includes('/')) {
        // Top level — show folder entry for first segment
        const folder = f.path.split('/')[0];
        if (!seen.has(folder)) {
          seen.add(folder);
          // Count files in this folder
          const folderFiles = allFiles.filter((ff: any) => ff.path.startsWith(folder + '/') || ff.path === folder);
          items.push({
            _id: `folder-${folder}`,
            name: folder,
            path: folder,
            type: 'folder',
            fileCount: folderFiles.length,
            updatedAt: folderFiles.reduce((latest: Date, ff: any) =>
              (ff.updatedAt && new Date(ff.updatedAt) > latest) ? new Date(ff.updatedAt) : latest,
              new Date(0)
            ),
          });
        }
      } else if (prefix) {
        const relative = f.path.slice(prefix.length);
        if (relative.includes('/')) {
          // Subfolder
          const folder = relative.split('/')[0];
          if (!seen.has(folder)) {
            seen.add(folder);
            const subPath = prefix + folder;
            const subFiles = allFiles.filter((ff: any) => ff.path.startsWith(subPath + '/') || ff.path === subPath);
            items.push({
              _id: `folder-${subPath}`,
              name: folder,
              path: subPath,
              type: 'folder',
              fileCount: subFiles.length,
              updatedAt: subFiles.reduce((latest: Date, ff: any) =>
                (ff.updatedAt && new Date(ff.updatedAt) > latest) ? new Date(ff.updatedAt) : latest,
                new Date(0)
              ),
            });
          }
        } else {
          // Direct file at this level
          items.push(f);
        }
      } else {
        // Top level file (no slash in path)
        items.push(f);
      }
    }

    // Sort: folders first, then files alphabetically
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({ files: items, path: folderPath });
  } catch (err: any) {
    console.error('[Projects] List files error:', err.message);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// ── POST /api/projects/:id/files ─────────────────────────────────────────────
router.post('/:id/files', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;
    const userName = (req.user as any).name || 'Unknown';
    const { name, path: filePath, type, url, description, size } = req.body;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check permission
    const isOwner = project.owner === userId;
    const isCollab = project.collaborators.some(
      (c) => c.userId === userId && ['owner', 'editor'].includes(c.role)
    );
    if (!isOwner && !isCollab) return res.status(403).json({ error: 'Not authorized' });

    const fullPath = filePath ? `${filePath}/${name}` : name;

    // Check for duplicate
    if (project.files.some((f) => f.path === fullPath)) {
      return res.status(409).json({ error: 'File already exists at this path' });
    }

    project.files.push({
      name,
      path: fullPath,
      type: type || 'file',
      url,
      description,
      contributorId: userId,
      contributorName: userName,
      size: size || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    pushActivity(project, 'added_file', req.user!, `Added ${fullPath}`);
    await project.save();

    res.status(201).json({ ok: true, file: project.files[project.files.length - 1] });
  } catch (err: any) {
    console.error('[Projects] Add file error:', err.message);
    res.status(500).json({ error: 'Failed to add file' });
  }
});

// ── DELETE /api/projects/:id/files/:fileId ───────────────────────────────────
router.delete('/:id/files/:fileId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).id;

    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner !== userId) return res.status(403).json({ error: 'Not authorized' });

    const file = project.files.find((f: any) => f._id?.toString() === req.params.fileId);
    project.files = project.files.filter((f: any) => f._id?.toString() !== req.params.fileId) as any;
    pushActivity(project, 'removed_file', req.user!, `Removed ${file?.name || req.params.fileId}`);
    await project.save();

    res.json({ ok: true });
  } catch (err: any) {
    console.error('[Projects] Remove file error:', err.message);
    res.status(500).json({ error: 'Failed to remove file' });
  }
});

export default router;

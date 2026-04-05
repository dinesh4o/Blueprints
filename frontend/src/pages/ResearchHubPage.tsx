import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Star, GitFork, Filter, Loader2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectCard } from '@/components/ProjectCard';
import { NewProjectModal } from '@/components/NewProjectModal';

// ── Showcase projects (inline mock for demo — South Indian researchers) ──────
const SHOWCASE_PROJECTS = [
  {
    _id: 'showcase-1',
    title: 'Metformin Repurposing for Glioblastoma Multiforme',
    description: 'Investigating the anti-tumor effects of metformin on GBM cell lines and in vivo models. Focus on AMPK/mTOR pathway modulation and combination with temozolomide.',
    molecule: 'Metformin',
    disease: 'Glioblastoma',
    tags: ['oncology', 'repurposing', 'phase-2', 'AMPK'],
    ownerName: 'Dr. Lakshmi Narayanan',
    visibility: 'public',
    starCount: 47,
    forkCount: 8,
    collaboratorCount: 5,
    contributors: [
      { name: 'Dr. Lakshmi Narayanan', role: 'owner' },
      { name: 'Dr. Kavitha Rajan', role: 'editor' },
      { name: 'R. Surya Prakash', role: 'editor' },
      { name: 'Dr. Meenakshi Iyer', role: 'viewer' },
      { name: 'Hari Krishnan S.', role: 'viewer' },
    ],
    updatedAt: '2026-03-28T10:15:00Z',
  },
  {
    _id: 'showcase-2',
    title: 'Lenalidomide in Drug-Resistant Tuberculosis',
    description: 'Exploring immunomodulatory properties of lenalidomide to enhance macrophage-mediated killing of M. tuberculosis in MDR-TB patients.',
    molecule: 'Lenalidomide',
    disease: 'Drug-resistant TB',
    tags: ['immunology', 'infectious-disease', 'MDR-TB'],
    ownerName: 'Dr. Arun Shankar K.',
    visibility: 'public',
    starCount: 32,
    forkCount: 4,
    collaboratorCount: 3,
    contributors: [
      { name: 'Dr. Arun Shankar K.', role: 'owner' },
      { name: 'Priya Balakrishnan', role: 'editor' },
      { name: 'Dr. Vijay Mohan', role: 'editor' },
    ],
    updatedAt: '2026-03-25T14:30:00Z',
  },
  {
    _id: 'showcase-3',
    title: 'Pioglitazone for Non-Alcoholic Steatohepatitis (NASH)',
    description: 'Phase 2 clinical evaluation of pioglitazone for NASH with fibrosis. PPARγ activation improves hepatic steatosis and inflammation markers.',
    molecule: 'Pioglitazone',
    disease: 'NASH',
    tags: ['hepatology', 'metabolic', 'PPAR-gamma', 'phase-2'],
    ownerName: 'Dr. Revathi Sundaram',
    visibility: 'public',
    starCount: 29,
    forkCount: 6,
    collaboratorCount: 4,
    contributors: [
      { name: 'Dr. Revathi Sundaram', role: 'owner' },
      { name: 'K. Deepak Raja', role: 'editor' },
      { name: 'Dr. Shalini Devi', role: 'editor' },
      { name: 'Anand Velu', role: 'viewer' },
    ],
    updatedAt: '2026-03-20T09:00:00Z',
  },
  {
    _id: 'showcase-4',
    title: 'Colchicine for Post-Myocardial Infarction Inflammation',
    description: 'Evaluating low-dose colchicine to reduce residual inflammatory risk post-MI. NLRP3 inflammasome inhibition and IL-1β / IL-6 modulation.',
    molecule: 'Colchicine',
    disease: 'Post-MI Inflammation',
    tags: ['cardiology', 'inflammation', 'NLRP3', 'phase-3'],
    ownerName: 'Dr. Karthikeyan R.',
    visibility: 'public',
    starCount: 41,
    forkCount: 11,
    collaboratorCount: 6,
    contributors: [
      { name: 'Dr. Karthikeyan R.', role: 'owner' },
      { name: 'Dr. Pradeep Kumar M.', role: 'editor' },
      { name: 'Nandhini S.', role: 'editor' },
      { name: 'Dr. Divya Lakshmi', role: 'editor' },
      { name: 'Suresh Babu K.', role: 'viewer' },
      { name: 'Vignesh R.', role: 'viewer' },
    ],
    updatedAt: '2026-03-18T16:45:00Z',
  },
  {
    _id: 'showcase-5',
    title: 'Hydroxychloroquine in Cutaneous Lupus Erythematosus',
    description: 'Assessing long-term HCQ efficacy and retinal safety in South Indian CLE patients. Includes pharmacogenomic CYP2D6 analysis.',
    molecule: 'Hydroxychloroquine',
    disease: 'Cutaneous Lupus',
    tags: ['dermatology', 'autoimmune', 'pharmacogenomics'],
    ownerName: 'Dr. Padmavathi G.',
    visibility: 'public',
    starCount: 23,
    forkCount: 3,
    collaboratorCount: 3,
    contributors: [
      { name: 'Dr. Padmavathi G.', role: 'owner' },
      { name: 'Dr. Ramesh Babu', role: 'editor' },
      { name: 'Swetha Venkatesh', role: 'viewer' },
    ],
    updatedAt: '2026-03-15T11:20:00Z',
  },
  {
    _id: 'showcase-6',
    title: 'Dapsone for Chronic Diabetic Wound Healing',
    description: 'Repurposing dapsone anti-inflammatory properties for accelerating wound closure in diabetic foot ulcers. In vivo and clinical pilot data.',
    molecule: 'Dapsone',
    disease: 'Diabetic Wounds',
    tags: ['wound-healing', 'diabetes', 'anti-inflammatory', 'pilot'],
    ownerName: 'Dr. Senthil Kumar V.',
    visibility: 'public',
    starCount: 18,
    forkCount: 2,
    collaboratorCount: 4,
    contributors: [
      { name: 'Dr. Senthil Kumar V.', role: 'owner' },
      { name: 'Dr. Jayashree N.', role: 'editor' },
      { name: 'Manikandan P.', role: 'editor' },
      { name: 'Dhivya R.', role: 'viewer' },
    ],
    updatedAt: '2026-03-10T08:30:00Z',
  },
];

export default function ResearchHubPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'stars' | 'oldest'>('latest');
  const [filterTag, setFilterTag] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (sortBy !== 'latest') params.set('sort', sortBy);
      if (filterTag) params.set('tag', filterTag);

      const res = await fetch(`/api/projects?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Merge showcase + real data, dedupe by _id
      const realIds = new Set((data.projects || []).map((p: any) => p._id));
      const showcase = SHOWCASE_PROJECTS.filter(
        (s) => !realIds.has(s._id) &&
          (!search || s.title.toLowerCase().includes(search.toLowerCase()) || s.molecule?.toLowerCase().includes(search.toLowerCase())) &&
          (!filterTag || s.tags.includes(filterTag))
      );

      setProjects([...showcase, ...(data.projects || [])]);
      setTotal((data.total || 0) + showcase.length);
    } catch {
      // If backend is down, show showcase only
      const filtered = SHOWCASE_PROJECTS.filter(
        (s) =>
          (!search || s.title.toLowerCase().includes(search.toLowerCase()) || s.molecule?.toLowerCase().includes(search.toLowerCase())) &&
          (!filterTag || s.tags.includes(filterTag))
      );
      setProjects(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, filterTag]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const allTags = [...new Set(SHOWCASE_PROJECTS.flatMap((p) => p.tags))].sort();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_30%,transparent_100%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Research Hub</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Collaborative drug repurposing projects — explore, fork, and contribute.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
            >
              <Plus size={14} /> New Project
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects, molecules, diseases..."
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="flex gap-2">
            {user && (
              <button
                onClick={() => navigate('/research-hub/my')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
              >
                <Users size={12} /> My Projects
              </button>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400 focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="stars">Most Stars</option>
              <option value="oldest">Oldest</option>
            </select>

            <div className="relative">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-3 py-2 text-xs bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400 focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer pr-7"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <Filter size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-[11px] text-zinc-600">
          <span>{total} project{total !== 1 ? 's' : ''}</span>
          {filterTag && (
            <span className="flex items-center gap-1">
              Tag: <span className="text-zinc-400">{filterTag}</span>
              <button onClick={() => setFilterTag('')} className="text-zinc-600 hover:text-zinc-400 ml-0.5">×</button>
            </span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-zinc-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">No projects found.</p>
            {user && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Create the first one →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}
      </div>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

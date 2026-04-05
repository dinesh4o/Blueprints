import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, GitFork, Users, Settings, FileText, FlaskConical, Lightbulb,
  Activity, Folder, File, Plus, Trash2, X, Loader2, Edit2, Check, ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';

// ═══════════════════════════════════════════════════════════════════════════════
// Showcase data for the 6 demo projects
// ═══════════════════════════════════════════════════════════════════════════════
const SHOWCASE_DATA: Record<string, any> = {
  'showcase-1': {
    _id: 'showcase-1',
    title: 'Metformin Repurposing for Glioblastoma Multiforme',
    description: 'Investigating the anti-tumor effects of metformin on GBM cell lines and in vivo models. Focus on AMPK/mTOR pathway modulation and combination with temozolomide.',
    molecule: 'Metformin', disease: 'Glioblastoma',
    tags: ['oncology', 'repurposing', 'phase-2', 'AMPK'],
    owner: 'showcase-owner-1', ownerName: 'Dr. Lakshmi Narayanan',
    visibility: 'public', stars: Array(47).fill('x'), forkCount: 8, starCount: 47,
    collaborators: [
      { userId: 'u1', name: 'Dr. Lakshmi Narayanan', role: 'owner', joinedAt: '2025-06-01' },
      { userId: 'u2', name: 'Dr. Kavitha Rajan', role: 'editor', joinedAt: '2025-07-15' },
      { userId: 'u3', name: 'R. Surya Prakash', role: 'editor', joinedAt: '2025-08-01' },
      { userId: 'u4', name: 'Dr. Meenakshi Iyer', role: 'viewer', joinedAt: '2025-09-10' },
      { userId: 'u5', name: 'Hari Krishnan S.', role: 'viewer', joinedAt: '2025-10-20' },
    ],
    files: [
      { _id: 'f1', name: 'README.md', path: 'README.md', type: 'file', size: 2400, contributorName: 'Dr. Lakshmi Narayanan', updatedAt: '2026-03-28' },
      { _id: 'f2', name: 'protocol_v2.pdf', path: 'protocols/protocol_v2.pdf', type: 'file', size: 145000, url: 'https://pubmed.ncbi.nlm.nih.gov/28959935/', contributorName: 'Dr. Kavitha Rajan', updatedAt: '2026-03-25' },
      { _id: 'f3', name: 'metformin_gbm_review.pdf', path: 'literature/metformin_gbm_review.pdf', type: 'file', size: 320000, url: 'https://pubmed.ncbi.nlm.nih.gov/26684457/', contributorName: 'R. Surya Prakash', updatedAt: '2026-03-20' },
      { _id: 'f4', name: 'cell_viability_data.csv', path: 'data/cell_viability_data.csv', type: 'file', size: 18500, contributorName: 'Dr. Lakshmi Narayanan', updatedAt: '2026-03-15' },
      { _id: 'f5', name: 'ampk_western_blots.png', path: 'data/ampk_western_blots.png', type: 'file', size: 540000, contributorName: 'R. Surya Prakash', updatedAt: '2026-03-10' },
      { _id: 'f6', name: 'combination_tmz_protocol.pdf', path: 'protocols/combination_tmz_protocol.pdf', type: 'file', size: 98000, url: 'https://pubmed.ncbi.nlm.nih.gov/32939073/', contributorName: 'Dr. Meenakshi Iyer', updatedAt: '2026-02-28' },
      { _id: 'f7', name: 'nct02780024_results.pdf', path: 'clinical/nct02780024_results.pdf', type: 'file', size: 210000, url: 'https://clinicaltrials.gov/ct2/show/NCT02780024', contributorName: 'Hari Krishnan S.', updatedAt: '2026-02-15' },
    ],
    analyses: [],
    hypotheses: [
      { _id: 'h1', title: 'Metformin synergizes with TMZ via AMPK-mediated autophagy', status: 'testing', authorName: 'Dr. Lakshmi Narayanan', createdAt: '2025-11-01' },
      { _id: 'h2', title: 'Low-dose metformin crosses BBB at therapeutic concentrations', status: 'proposed', authorName: 'Dr. Kavitha Rajan', createdAt: '2026-01-15' },
    ],
    activity: [
      { action: 'added_file', userName: 'Hari Krishnan S.', detail: 'Added clinical/nct02780024_results.pdf', createdAt: '2026-02-15' },
      { action: 'added_hypothesis', userName: 'Dr. Kavitha Rajan', detail: 'Proposed: Low-dose metformin crosses BBB', createdAt: '2026-01-15' },
      { action: 'added_file', userName: 'R. Surya Prakash', detail: 'Added literature/metformin_gbm_review.pdf', createdAt: '2026-03-20' },
      { action: 'created', userName: 'Dr. Lakshmi Narayanan', detail: 'Project created', createdAt: '2025-06-01' },
    ],
  },
  'showcase-2': {
    _id: 'showcase-2',
    title: 'Lenalidomide in Drug-Resistant Tuberculosis',
    description: 'Exploring immunomodulatory properties of lenalidomide to enhance macrophage-mediated killing of M. tuberculosis in MDR-TB patients.',
    molecule: 'Lenalidomide', disease: 'Drug-resistant TB',
    tags: ['immunology', 'infectious-disease', 'MDR-TB'],
    owner: 'showcase-owner-2', ownerName: 'Dr. Arun Shankar K.',
    visibility: 'public', stars: Array(32).fill('x'), forkCount: 4, starCount: 32,
    collaborators: [
      { userId: 'u6', name: 'Dr. Arun Shankar K.', role: 'owner', joinedAt: '2025-05-01' },
      { userId: 'u7', name: 'Priya Balakrishnan', role: 'editor', joinedAt: '2025-06-15' },
      { userId: 'u8', name: 'Dr. Vijay Mohan', role: 'editor', joinedAt: '2025-07-01' },
    ],
    files: [
      { _id: 'f8', name: 'README.md', path: 'README.md', type: 'file', size: 1800, contributorName: 'Dr. Arun Shankar K.', updatedAt: '2026-03-25' },
      { _id: 'f9', name: 'lenalidomide_tb_review.pdf', path: 'literature/lenalidomide_tb_review.pdf', type: 'file', size: 280000, url: 'https://pubmed.ncbi.nlm.nih.gov/27756577/', contributorName: 'Priya Balakrishnan', updatedAt: '2026-03-20' },
    ],
    analyses: [],
    hypotheses: [
      { _id: 'h3', title: 'TNF-α modulation by lenalidomide enhances macrophage bactericidal activity', status: 'testing', authorName: 'Dr. Arun Shankar K.', createdAt: '2025-08-01' },
    ],
    activity: [
      { action: 'added_file', userName: 'Priya Balakrishnan', detail: 'Added literature review', createdAt: '2026-03-20' },
      { action: 'created', userName: 'Dr. Arun Shankar K.', detail: 'Project created', createdAt: '2025-05-01' },
    ],
  },
  'showcase-3': {
    _id: 'showcase-3',
    title: 'Pioglitazone for Non-Alcoholic Steatohepatitis (NASH)',
    description: 'Phase 2 clinical evaluation of pioglitazone for NASH with fibrosis. PPARγ activation improves hepatic steatosis and inflammation markers.',
    molecule: 'Pioglitazone', disease: 'NASH',
    tags: ['hepatology', 'metabolic', 'PPAR-gamma', 'phase-2'],
    owner: 'showcase-owner-3', ownerName: 'Dr. Revathi Sundaram',
    visibility: 'public', stars: Array(29).fill('x'), forkCount: 6, starCount: 29,
    collaborators: [
      { userId: 'u9', name: 'Dr. Revathi Sundaram', role: 'owner', joinedAt: '2025-04-01' },
      { userId: 'u10', name: 'K. Deepak Raja', role: 'editor', joinedAt: '2025-05-15' },
      { userId: 'u11', name: 'Dr. Shalini Devi', role: 'editor', joinedAt: '2025-06-01' },
      { userId: 'u12', name: 'Anand Velu', role: 'viewer', joinedAt: '2025-07-01' },
    ],
    files: [
      { _id: 'f10', name: 'README.md', path: 'README.md', type: 'file', size: 2100, contributorName: 'Dr. Revathi Sundaram', updatedAt: '2026-03-20' },
      { _id: 'f11', name: 'pioglitazone_nash_rct.pdf', path: 'literature/pioglitazone_nash_rct.pdf', type: 'file', size: 410000, url: 'https://pubmed.ncbi.nlm.nih.gov/20427778/', contributorName: 'K. Deepak Raja', updatedAt: '2026-03-18' },
      { _id: 'f12', name: 'ppar_meta_analysis.pdf', path: 'literature/ppar_meta_analysis.pdf', type: 'file', size: 350000, url: 'https://pubmed.ncbi.nlm.nih.gov/27907868/', contributorName: 'Dr. Shalini Devi', updatedAt: '2026-03-10' },
      { _id: 'f13', name: 'nct00994682_data.pdf', path: 'clinical/nct00994682_data.pdf', type: 'file', size: 180000, url: 'https://clinicaltrials.gov/ct2/show/NCT00994682', contributorName: 'Anand Velu', updatedAt: '2026-02-28' },
    ],
    analyses: [],
    hypotheses: [
      { _id: 'h4', title: 'PPARγ agonism reverses hepatic stellate cell activation in NASH fibrosis', status: 'supported', authorName: 'Dr. Revathi Sundaram', createdAt: '2025-09-01' },
    ],
    activity: [
      { action: 'updated_hypothesis', userName: 'Dr. Revathi Sundaram', detail: 'Updated hypothesis status to supported', createdAt: '2026-03-15' },
      { action: 'created', userName: 'Dr. Revathi Sundaram', detail: 'Project created', createdAt: '2025-04-01' },
    ],
  },
  'showcase-4': {
    _id: 'showcase-4',
    title: 'Colchicine for Post-Myocardial Infarction Inflammation',
    description: 'Evaluating low-dose colchicine to reduce residual inflammatory risk post-MI. NLRP3 inflammasome inhibition and IL-1β / IL-6 modulation.',
    molecule: 'Colchicine', disease: 'Post-MI Inflammation',
    tags: ['cardiology', 'inflammation', 'NLRP3', 'phase-3'],
    owner: 'showcase-owner-4', ownerName: 'Dr. Karthikeyan R.',
    visibility: 'public', stars: Array(41).fill('x'), forkCount: 11, starCount: 41,
    collaborators: [
      { userId: 'u13', name: 'Dr. Karthikeyan R.', role: 'owner', joinedAt: '2025-03-01' },
      { userId: 'u14', name: 'Dr. Pradeep Kumar M.', role: 'editor', joinedAt: '2025-04-15' },
      { userId: 'u15', name: 'Nandhini S.', role: 'editor', joinedAt: '2025-05-01' },
      { userId: 'u16', name: 'Dr. Divya Lakshmi', role: 'editor', joinedAt: '2025-06-01' },
      { userId: 'u17', name: 'Suresh Babu K.', role: 'viewer', joinedAt: '2025-07-01' },
      { userId: 'u18', name: 'Vignesh R.', role: 'viewer', joinedAt: '2025-08-01' },
    ],
    files: [
      { _id: 'f14', name: 'README.md', path: 'README.md', type: 'file', size: 2800, contributorName: 'Dr. Karthikeyan R.', updatedAt: '2026-03-18' },
      { _id: 'f15', name: 'colcot_trial.pdf', path: 'literature/colcot_trial.pdf', type: 'file', size: 520000, url: 'https://pubmed.ncbi.nlm.nih.gov/31733140/', contributorName: 'Dr. Pradeep Kumar M.', updatedAt: '2026-03-15' },
      { _id: 'f16', name: 'nlrp3_colchicine_moa.pdf', path: 'literature/nlrp3_colchicine_moa.pdf', type: 'file', size: 290000, url: 'https://pubmed.ncbi.nlm.nih.gov/23265346/', contributorName: 'Nandhini S.', updatedAt: '2026-03-10' },
      { _id: 'f17', name: 'nct01551094_summary.pdf', path: 'clinical/nct01551094_summary.pdf', type: 'file', size: 165000, url: 'https://clinicaltrials.gov/ct2/show/NCT01551094', contributorName: 'Dr. Divya Lakshmi', updatedAt: '2026-02-20' },
    ],
    analyses: [],
    hypotheses: [
      { _id: 'h5', title: 'Low-dose colchicine (0.5mg/day) reduces hs-CRP by >50% in post-MI patients', status: 'supported', authorName: 'Dr. Karthikeyan R.', createdAt: '2025-10-01' },
      { _id: 'h6', title: 'Colchicine prevents adverse cardiac remodeling via IL-1β suppression', status: 'testing', authorName: 'Dr. Pradeep Kumar M.', createdAt: '2026-01-01' },
    ],
    activity: [
      { action: 'added_hypothesis', userName: 'Dr. Pradeep Kumar M.', detail: 'Proposed: Colchicine prevents adverse cardiac remodeling', createdAt: '2026-01-01' },
      { action: 'created', userName: 'Dr. Karthikeyan R.', detail: 'Project created', createdAt: '2025-03-01' },
    ],
  },
  'showcase-5': {
    _id: 'showcase-5',
    title: 'Hydroxychloroquine in Cutaneous Lupus Erythematosus',
    description: 'Assessing long-term HCQ efficacy and retinal safety in South Indian CLE patients. Includes pharmacogenomic CYP2D6 analysis.',
    molecule: 'Hydroxychloroquine', disease: 'Cutaneous Lupus',
    tags: ['dermatology', 'autoimmune', 'pharmacogenomics'],
    owner: 'showcase-owner-5', ownerName: 'Dr. Padmavathi G.',
    visibility: 'public', stars: Array(23).fill('x'), forkCount: 3, starCount: 23,
    collaborators: [
      { userId: 'u19', name: 'Dr. Padmavathi G.', role: 'owner', joinedAt: '2025-02-01' },
      { userId: 'u20', name: 'Dr. Ramesh Babu', role: 'editor', joinedAt: '2025-03-15' },
      { userId: 'u21', name: 'Swetha Venkatesh', role: 'viewer', joinedAt: '2025-04-01' },
    ],
    files: [
      { _id: 'f18', name: 'README.md', path: 'README.md', type: 'file', size: 1900, contributorName: 'Dr. Padmavathi G.', updatedAt: '2026-03-15' },
      { _id: 'f19', name: 'hcq_cle_cochrane.pdf', path: 'literature/hcq_cle_cochrane.pdf', type: 'file', size: 380000, url: 'https://pubmed.ncbi.nlm.nih.gov/24942170/', contributorName: 'Dr. Ramesh Babu', updatedAt: '2026-03-10' },
      { _id: 'f20', name: 'retinal_safety_guidelines.pdf', path: 'literature/retinal_safety_guidelines.pdf', type: 'file', size: 250000, url: 'https://pubmed.ncbi.nlm.nih.gov/30395537/', contributorName: 'Dr. Padmavathi G.', updatedAt: '2026-03-05' },
      { _id: 'f21', name: 'cyp2d6_pharmacogenomics.pdf', path: 'literature/cyp2d6_pharmacogenomics.pdf', type: 'file', size: 195000, url: 'https://pubmed.ncbi.nlm.nih.gov/29494689/', contributorName: 'Swetha Venkatesh', updatedAt: '2026-02-25' },
      { _id: 'f22', name: 'nct01946880_protocol.pdf', path: 'clinical/nct01946880_protocol.pdf', type: 'file', size: 140000, url: 'https://clinicaltrials.gov/ct2/show/NCT01946880', contributorName: 'Dr. Ramesh Babu', updatedAt: '2026-02-15' },
    ],
    analyses: [],
    hypotheses: [
      { _id: 'h7', title: 'CYP2D6 poor metabolizers require dose adjustment for HCQ to prevent retinal toxicity', status: 'proposed', authorName: 'Swetha Venkatesh', createdAt: '2026-02-01' },
    ],
    activity: [
      { action: 'added_hypothesis', userName: 'Swetha Venkatesh', detail: 'Proposed: CYP2D6 poor metabolizers require dose adjustment', createdAt: '2026-02-01' },
      { action: 'created', userName: 'Dr. Padmavathi G.', detail: 'Project created', createdAt: '2025-02-01' },
    ],
  },
  'showcase-6': {
    _id: 'showcase-6',
    title: 'Dapsone for Chronic Diabetic Wound Healing',
    description: 'Repurposing dapsone anti-inflammatory properties for accelerating wound closure in diabetic foot ulcers. In vivo and clinical pilot data.',
    molecule: 'Dapsone', disease: 'Diabetic Wounds',
    tags: ['wound-healing', 'diabetes', 'anti-inflammatory', 'pilot'],
    owner: 'showcase-owner-6', ownerName: 'Dr. Senthil Kumar V.',
    visibility: 'public', stars: Array(18).fill('x'), forkCount: 2, starCount: 18,
    collaborators: [
      { userId: 'u22', name: 'Dr. Senthil Kumar V.', role: 'owner', joinedAt: '2025-01-01' },
      { userId: 'u23', name: 'Dr. Jayashree N.', role: 'editor', joinedAt: '2025-02-15' },
      { userId: 'u24', name: 'Manikandan P.', role: 'editor', joinedAt: '2025-03-01' },
      { userId: 'u25', name: 'Dhivya R.', role: 'viewer', joinedAt: '2025-04-01' },
    ],
    files: [
      { _id: 'f23', name: 'README.md', path: 'README.md', type: 'file', size: 2200, contributorName: 'Dr. Senthil Kumar V.', updatedAt: '2026-03-10' },
      { _id: 'f24', name: 'dapsone_wound_healing.pdf', path: 'literature/dapsone_wound_healing.pdf', type: 'file', size: 310000, url: 'https://pubmed.ncbi.nlm.nih.gov/29624694/', contributorName: 'Dr. Jayashree N.', updatedAt: '2026-03-05' },
      { _id: 'f25', name: 'diabetic_ulcer_review.pdf', path: 'literature/diabetic_ulcer_review.pdf', type: 'file', size: 270000, url: 'https://pubmed.ncbi.nlm.nih.gov/25607655/', contributorName: 'Manikandan P.', updatedAt: '2026-02-28' },
      { _id: 'f26', name: 'nct02016683_pilot.pdf', path: 'clinical/nct02016683_pilot.pdf', type: 'file', size: 155000, url: 'https://clinicaltrials.gov/ct2/show/NCT02016683', contributorName: 'Dhivya R.', updatedAt: '2026-02-15' },
    ],
    analyses: [],
    hypotheses: [
      { _id: 'h8', title: 'Topical dapsone reduces neutrophil infiltration and accelerates re-epithelialization in diabetic wounds', status: 'testing', authorName: 'Dr. Senthil Kumar V.', createdAt: '2025-06-01' },
    ],
    activity: [
      { action: 'added_file', userName: 'Dhivya R.', detail: 'Added clinical pilot data', createdAt: '2026-02-15' },
      { action: 'created', userName: 'Dr. Senthil Kumar V.', detail: 'Project created', createdAt: '2025-01-01' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
type Tab = 'overview' | 'repository' | 'analyses' | 'hypotheses' | 'activity';

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const STATUS_COLORS: Record<string, string> = {
  proposed: 'bg-zinc-700 text-zinc-300',
  testing: 'bg-amber-500/20 text-amber-300',
  supported: 'bg-emerald-500/20 text-emerald-300',
  rejected: 'bg-red-500/20 text-red-300',
};

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  // File browser state
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileDesc, setNewFileDesc] = useState('');

  // Hypothesis form
  const [showHypForm, setShowHypForm] = useState(false);
  const [hypTitle, setHypTitle] = useState('');
  const [hypDesc, setHypDesc] = useState('');

  // Collaborator form
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [collabEmail, setCollabEmail] = useState('');

  const isShowcase = id?.startsWith('showcase-');

  // Fetch project data
  useEffect(() => {
    if (!id) return;
    if (isShowcase) {
      const data = SHOWCASE_DATA[id];
      if (data) {
        setProject(data);
        setFiles(buildFileTree(data.files || [], ''));
      }
      setLoading(false);
      return;
    }

    fetch(`/api/projects/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.project) setProject(data.project);
        else setProject(null);
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id, isShowcase]);

  // Build file tree from flat file list (for showcase data)
  function buildFileTree(allFiles: any[], prefix: string) {
    const seen = new Set<string>();
    const items: any[] = [];

    for (const f of allFiles) {
      const p = prefix ? `${prefix}/` : '';
      if (p && !f.path.startsWith(p)) continue;

      const relative = p ? f.path.slice(p.length) : f.path;
      if (relative.includes('/')) {
        const folder = relative.split('/')[0];
        if (!seen.has(folder)) {
          seen.add(folder);
          const folderPath = p ? `${prefix}/${folder}` : folder;
          const folderFiles = allFiles.filter((ff: any) => ff.path.startsWith(folderPath + '/'));
          items.push({
            _id: `folder-${folderPath}`,
            name: folder,
            path: folderPath,
            type: 'folder',
            fileCount: folderFiles.length,
            updatedAt: folderFiles[0]?.updatedAt,
          });
        }
      } else {
        items.push(f);
      }
    }

    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    return items;
  }

  // Fetch files from API (non-showcase)
  useEffect(() => {
    if (!id || isShowcase) return;
    if (tab !== 'repository') return;

    setFilesLoading(true);
    fetch(`/api/projects/${id}/files?path=${encodeURIComponent(currentPath)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setFiles(data.files || []))
      .catch(() => setFiles([]))
      .finally(() => setFilesLoading(false));
  }, [id, tab, currentPath, isShowcase]);

  // For showcase: rebuild file tree on path change
  useEffect(() => {
    if (!isShowcase || !project) return;
    setFiles(buildFileTree(project.files || [], currentPath));
  }, [currentPath, isShowcase, project]);

  const addFile = async () => {
    if (!newFileName.trim() || isShowcase) return;
    try {
      await fetch(`/api/projects/${id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newFileName, path: currentPath || undefined, url: newFileUrl || undefined, description: newFileDesc || undefined }),
      });
      setNewFileName(''); setNewFileUrl(''); setNewFileDesc(''); setShowAddFile(false);
      // Refresh
      const r = await fetch(`/api/projects/${id}/files?path=${encodeURIComponent(currentPath)}`, { credentials: 'include' });
      const d = await r.json();
      setFiles(d.files || []);
    } catch {}
  };

  const deleteFile = async (fileId: string) => {
    if (isShowcase) return;
    await fetch(`/api/projects/${id}/files/${fileId}`, { method: 'DELETE', credentials: 'include' });
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
  };

  const toggleStar = async () => {
    if (isShowcase || !user) return;
    try {
      const res = await fetch(`/api/projects/${id}/star`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      setProject((p: any) => ({ ...p, starCount: data.starCount }));
    } catch {}
  };

  const forkProject = async () => {
    if (isShowcase || !user) return;
    const res = await fetch(`/api/projects/${id}/fork`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.project) navigate(`/project/${data.project._id}`);
  };

  const addHypothesis = async () => {
    if (!hypTitle.trim() || isShowcase) return;
    try {
      await fetch(`/api/projects/${id}/hypotheses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: hypTitle, description: hypDesc }),
      });
      setHypTitle(''); setHypDesc(''); setShowHypForm(false);
      // Refresh
      const r = await fetch(`/api/projects/${id}`, { credentials: 'include' });
      const d = await r.json();
      if (d.project) setProject(d.project);
    } catch {}
  };

  const updateHypothesis = async (hid: string, status: string) => {
    if (isShowcase) return;
    await fetch(`/api/projects/${id}/hypotheses/${hid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    setProject((p: any) => ({
      ...p,
      hypotheses: p.hypotheses.map((h: any) => (h._id === hid ? { ...h, status } : h)),
    }));
  };

  const deleteHypothesis = async (hid: string) => {
    if (isShowcase) return;
    await fetch(`/api/projects/${id}/hypotheses/${hid}`, { method: 'DELETE', credentials: 'include' });
    setProject((p: any) => ({ ...p, hypotheses: p.hypotheses.filter((h: any) => h._id !== hid) }));
  };

  const addCollaborator = async () => {
    if (!collabEmail.trim() || isShowcase) return;
    try {
      const res = await fetch(`/api/projects/${id}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: collabEmail, role: 'editor' }),
      });
      const data = await res.json();
      if (data.collaborators) setProject((p: any) => ({ ...p, collaborators: data.collaborators }));
      setCollabEmail(''); setShowCollabForm(false);
    } catch {}
  };

  const removeCollaborator = async (uid: string) => {
    if (isShowcase) return;
    await fetch(`/api/projects/${id}/collaborators/${uid}`, { method: 'DELETE', credentials: 'include' });
    setProject((p: any) => ({ ...p, collaborators: p.collaborators.filter((c: any) => c.userId !== uid) }));
  };

  const deleteAnalysis = async (jobId: string) => {
    if (isShowcase) return;
    await fetch(`/api/projects/${id}/analyses/${jobId}`, { method: 'DELETE', credentials: 'include' });
    setProject((p: any) => ({ ...p, analyses: p.analyses.filter((a: any) => a.jobId !== jobId) }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-zinc-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <p className="text-zinc-500 mb-3">Project not found</p>
        <button onClick={() => navigate('/research-hub')} className="text-cyan-400 text-xs hover:text-cyan-300">
          ← Back to Research Hub
        </button>
      </div>
    );
  }

  const isOwner = user && (project.owner === (user as any)._id || project.owner === (user as any).id);
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'repository', label: 'Repository', icon: Folder },
    { key: 'analyses', label: 'Analyses', icon: FlaskConical },
    { key: 'hypotheses', label: 'Hypotheses', icon: Lightbulb },
    { key: 'activity', label: 'Activity', icon: Activity },
  ];

  // Breadcrumb segments for file browser
  const pathSegments = currentPath ? currentPath.split('/') : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_30%,transparent_100%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/research-hub')}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-3"
            >
              <ArrowLeft size={12} /> Research Hub
            </button>
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight">{project.title}</h1>
            <p className="text-xs text-zinc-500 mt-1">by {project.ownerName || 'Unknown'}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleStar}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
            >
              <Star size={12} /> {project.starCount || 0}
            </button>
            <button
              onClick={forkProject}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
            >
              <GitFork size={12} /> Fork
            </button>
          </div>
        </div>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tags.map((t: string) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/60 text-zinc-500 border border-zinc-800">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-800/60 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); if (t.key === 'repository') setCurrentPath(''); }}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors',
                tab === t.key
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Overview ───────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm text-zinc-300 leading-relaxed">{project.description || 'No description yet.'}</p>
              {(project.molecule || project.disease) && (
                <div className="flex gap-4 mt-4 text-xs text-zinc-500">
                  {project.molecule && <span>Molecule: <span className="text-cyan-400">{project.molecule}</span></span>}
                  {project.disease && <span>Disease: <span className="text-amber-400">{project.disease}</span></span>}
                </div>
              )}
            </div>

            {/* Collaborators */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Collaborators ({project.collaborators?.length || 0})</h3>
                {isOwner && !isShowcase && (
                  <button onClick={() => setShowCollabForm(!showCollabForm)} className="text-cyan-400 text-xs hover:text-cyan-300">
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {showCollabForm && (
                <div className="flex gap-2 mb-3">
                  <input
                    value={collabEmail}
                    onChange={(e) => setCollabEmail(e.target.value)}
                    placeholder="Email address"
                    className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                  />
                  <button onClick={addCollaborator} className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg">Add</button>
                </div>
              )}

              <div className="space-y-2">
                {(project.collaborators || []).map((c: any) => (
                  <div key={c.userId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-400">
                        {c.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-zinc-300">{c.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-600">{c.role}</span>
                    </div>
                    {isOwner && !isShowcase && c.role !== 'owner' && (
                      <button onClick={() => removeCollaborator(c.userId)} className="text-zinc-600 hover:text-red-400">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Owner actions */}
            {isOwner && !isShowcase && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Settings</h3>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const newTitle = prompt('New title', project.title);
                      if (!newTitle) return;
                      await fetch(`/api/projects/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ title: newTitle }),
                      });
                      setProject((p: any) => ({ ...p, title: newTitle }));
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this project?')) return;
                      await fetch(`/api/projects/${id}`, { method: 'DELETE', credentials: 'include' });
                      navigate('/research-hub');
                    }}
                    className="text-xs text-red-500/60 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Repository ─────────────────────────────────────────── */}
        {tab === 'repository' && (
          <div className="space-y-4">
            {/* Contributor bar */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] text-zinc-600">Contributors:</span>
              <div className="flex -space-x-1.5">
                {(project.collaborators || []).slice(0, 6).map((c: any, i: number) => (
                  <div
                    key={c.userId}
                    title={c.name}
                    className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-medium text-zinc-400"
                    style={{ zIndex: 6 - i }}
                  >
                    {c.name?.[0]?.toUpperCase() || '?'}
                  </div>
                ))}
              </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <button onClick={() => setCurrentPath('')} className="hover:text-zinc-300 font-medium">root</button>
              {pathSegments.map((seg, i) => (
                <React.Fragment key={i}>
                  <ChevronRight size={10} className="text-zinc-700" />
                  <button
                    onClick={() => setCurrentPath(pathSegments.slice(0, i + 1).join('/'))}
                    className="hover:text-zinc-300"
                  >
                    {seg}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* File table */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
              {filesLoading ? (
                <div className="p-8 text-center">
                  <Loader2 size={16} className="animate-spin text-zinc-600 mx-auto" />
                </div>
              ) : files.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-600">No files yet.</div>
              ) : (
                <table className="w-full">
                  <tbody>
                    {files.map((f) => (
                      <tr
                        key={f._id}
                        className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            {f.type === 'folder' ? (
                              <button
                                onClick={() => setCurrentPath(f.path)}
                                className="flex items-center gap-2 text-zinc-200 hover:text-cyan-300 transition-colors"
                              >
                                <Folder size={14} className="text-cyan-500/50" />
                                <span className="font-medium">{f.name}</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-zinc-300">
                                <File size={14} className="text-zinc-600" />
                                <span>{f.name}</span>
                                {f.url && (
                                  <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-500/50 hover:text-cyan-400"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-zinc-600 hidden sm:table-cell">
                          {f.contributorName || (f.type === 'folder' ? `${f.fileCount} files` : '')}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-zinc-600 text-right">
                          {f.size ? fmt(f.size) : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add file form */}
            {!isShowcase && user && (
              <div>
                {showAddFile ? (
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="File name" className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none" />
                    <input value={newFileUrl} onChange={(e) => setNewFileUrl(e.target.value)} placeholder="URL (optional)" className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none" />
                    <input value={newFileDesc} onChange={(e) => setNewFileDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none" />
                    <div className="flex gap-2">
                      <button onClick={addFile} className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg">Add</button>
                      <button onClick={() => setShowAddFile(false)} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddFile(true)} className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    <Plus size={12} /> Add file
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Analyses ───────────────────────────────────────────── */}
        {tab === 'analyses' && (
          <div className="space-y-3">
            {(project.analyses || []).length === 0 ? (
              <p className="text-xs text-zinc-600 py-8 text-center">No analyses linked yet. Add reports from the Report page.</p>
            ) : (
              (project.analyses || []).map((a: any) => (
                <div key={a.jobId} className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{a.title || a.jobId}</p>
                    <p className="text-[10px] text-zinc-600">{a.job?.status || 'linked'} · {new Date(a.addedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.job && (
                      <button onClick={() => navigate(`/report/${a.jobId}`)} className="text-xs text-cyan-400 hover:text-cyan-300">View</button>
                    )}
                    {isOwner && !isShowcase && (
                      <button onClick={() => deleteAnalysis(a.jobId)} className="text-zinc-600 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB: Hypotheses ─────────────────────────────────────────── */}
        {tab === 'hypotheses' && (
          <div className="space-y-4">
            {user && !isShowcase && (
              <div>
                {showHypForm ? (
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <input value={hypTitle} onChange={(e) => setHypTitle(e.target.value)} placeholder="Hypothesis title" className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none" />
                    <textarea value={hypDesc} onChange={(e) => setHypDesc(e.target.value)} placeholder="Description" rows={2} className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none" />
                    <div className="flex gap-2">
                      <button onClick={addHypothesis} className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg">Submit</button>
                      <button onClick={() => setShowHypForm(false)} className="px-3 py-1.5 text-xs text-zinc-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowHypForm(true)} className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300">
                    <Plus size={12} /> Propose Hypothesis
                  </button>
                )}
              </div>
            )}

            {(project.hypotheses || []).length === 0 ? (
              <p className="text-xs text-zinc-600 py-8 text-center">No hypotheses yet.</p>
            ) : (
              (project.hypotheses || []).map((h: any) => (
                <div key={h._id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-medium text-zinc-200">{h.title}</h4>
                      {h.description && <p className="text-[11px] text-zinc-500 mt-1">{h.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[h.status] || STATUS_COLORS.proposed)}>
                          {h.status}
                        </span>
                        <span className="text-[10px] text-zinc-600">by {h.authorName}</span>
                      </div>
                    </div>
                    {!isShowcase && (
                      <div className="flex items-center gap-1">
                        {(['proposed', 'testing', 'supported', 'rejected'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateHypothesis(h._id, s)}
                            className={clsx(
                              'text-[9px] px-1.5 py-0.5 rounded transition-colors',
                              h.status === s ? 'bg-zinc-700 text-zinc-300' : 'text-zinc-700 hover:text-zinc-400'
                            )}
                          >
                            {s[0].toUpperCase() + s.slice(1, 4)}
                          </button>
                        ))}
                        {isOwner && (
                          <button onClick={() => deleteHypothesis(h._id)} className="text-zinc-700 hover:text-red-400 ml-1">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB: Activity ───────────────────────────────────────────── */}
        {tab === 'activity' && (
          <div className="space-y-2">
            {(project.activity || []).length === 0 ? (
              <p className="text-xs text-zinc-600 py-8 text-center">No activity yet.</p>
            ) : (
              (project.activity || []).map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-zinc-800/40 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-medium text-zinc-500 mt-0.5 shrink-0">
                    {a.userName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="text-xs text-zinc-300">
                      <span className="font-medium">{a.userName}</span>{' '}
                      <span className="text-zinc-500">{a.action.replace(/_/g, ' ')}</span>
                    </div>
                    {a.detail && <p className="text-[11px] text-zinc-600 mt-0.5">{a.detail}</p>}
                    <p className="text-[10px] text-zinc-700 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, ThumbsUp, Share2, 
  Search, PlusCircle, Target, Activity, Image as ImageIcon, X, Send, MoreVertical, Edit2, Trash2, CheckCircle2, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

interface ThreadComment {
  _id: string;
  author: string;
  avatar: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

interface Thread {
  _id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  upvotes: number;
  upvotedBy?: string[];
  hasLiked?: boolean;
  comments: ThreadComment[];
  timestamp: string;
  isProject?: boolean;
}

const renderContentWithLinks = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline break-all" onClick={(e) => e.stopPropagation()}>
          {part}
        </a>
      );
    }
    return part;
  });
};

// ── Showcase threads: South Indian research community ─────────────────────────
const SHOWCASE_THREADS: Thread[] = [
  {
    _id: 'showcase-t1',
    author: 'Dr. Kavitha Rajendran',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KavithaR&backgroundColor=c0aede',
    title: 'Metformin + Temozolomide Synergy in GBM — Our Phase II Interim Results',
    content: `We just completed interim analysis of our 64-patient Phase II at CMC Vellore. Metformin 1000 mg BID + standard TMZ protocol.\n\n📊 Key findings:\n- 23% improvement in 6-month PFS vs historical controls\n- AMPK phosphorylation increased 3.2x in tumour biopsies\n- No additional grade 3/4 toxicities attributable to metformin\n- MRI volumetric regression correlated with lactate:pyruvate ratio (r=0.71)\n\nWe're now planning the expansion cohort. Would love collaborators from neuro-oncology centres — especially those with access to CSF biomarkers.\n\nhttps://clinicaltrials.gov/search?term=metformin+glioblastoma`,
    tags: ['Oncology', 'Metformin', 'GBM'],
    upvotes: 34,
    upvotedBy: [],
    comments: [
      { _id: 'sc1', author: 'Dr. Suresh Babu M.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SureshB&backgroundColor=b6e3f4', content: 'Remarkable PFS data. Have you stratified by MGMT methylation status? Our NIMHANS cohort shows differential metformin benefit in MGMT-unmethylated GBM.', timestamp: '2 days ago' },
      { _id: 'sc2', author: 'Dr. Ananya Krishnan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaK&backgroundColor=ffd5dc', content: 'The lactate:pyruvate correlation is very interesting — suggests metabolic reprogramming. We can contribute MR spectroscopy data from our 40-patient imaging substudy at SCTIMST.', timestamp: '1 day ago' },
    ],
    timestamp: '3 days ago',
    isProject: true,
  },
  {
    _id: 'showcase-t2',
    author: 'Prof. Arun Kumar S.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArunK&backgroundColor=d1d4f9',
    title: 'Lenalidomide Analogues Against MDR-TB: In-vitro MIC Data from NIRT Chennai',
    content: `Our IIT Madras + NIRT collaboration has completed MIC testing of 12 thalidomide/lenalidomide derivatives against M. tuberculosis H37Rv and 4 MDR clinical isolates.\n\n🔬 Results summary:\n- Compound LND-7 shows MIC 2 µg/mL (better than parent lenalidomide at >64 µg/mL)\n- TNF-α suppression: IC50 = 0.3 µM in THP-1 macrophages\n- No cytotoxicity up to 50 µM (HepG2, HEK-293)\n- Synergy with rifampicin (FIC index 0.38)\n\nLooking for partners with access to mouse TB infection models for in-vivo validation. Happy to share compounds under MTA.\n\n#InfectiousDisease #DrugRepurposing`,
    tags: ['TB', 'Immunomodulation', 'Medicinal Chemistry'],
    upvotes: 28,
    upvotedBy: [],
    comments: [
      { _id: 'sc3', author: 'Dr. Meenakshi Devi R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeenakshiD&backgroundColor=c0aede', content: 'The FIC index with rifampicin is very promising. We have BSL-3 aerosol infection facility at NIRT — can run acute TB mouse model within 8 weeks. Let\'s connect.', timestamp: '5 days ago' },
    ],
    timestamp: '1 week ago',
    isProject: true,
  },
  {
    _id: 'showcase-t3',
    author: 'Dr. Lakshmi Narayanan K.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LakshmiN&backgroundColor=b6e3f4',
    title: 'Pioglitazone in NASH: 38% Fibrosis Regression at 18 Months — Biopsy Data',
    content: `Sharing results from our 200-patient open-label cohort at Sri Ramachandra University:\n\n🏥 Protocol: Pioglitazone 30mg daily + lifestyle modification vs lifestyle alone\n\n📈 18-month paired liver biopsy outcomes:\n- Fibrosis improvement ≥1 stage: 38% (pio) vs 12% (control)\n- NAS score reduction ≥2 points: 52% vs 19%\n- Mean ALT normalized: 78% vs 34%\n- Weight gain (expected): +2.8 kg mean\n- No CHF events, 3 peripheral edema (resolved)\n\nThe cost advantage is enormous — Pioglitazone costs ₹3/day vs ₹300/day for resmetirom. For the Indian NASH epidemic (estimated 40M patients), this could be transformative.\n\nManuscript under review at Hepatology.`,
    tags: ['Hepatology', 'NASH', 'PPARγ'],
    upvotes: 51,
    upvotedBy: [],
    comments: [
      { _id: 'sc4', author: 'Dr. Senthil Murugan R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SenthilM&backgroundColor=ffd5dc', content: '52% NAS improvement is excellent. How did you handle the weight gain confounder? Our Madurai cohort suggests combining with SGLT2i mitigates the weight issue while maintaining hepatic benefit.', timestamp: '4 days ago' },
      { _id: 'sc5', author: 'Dr. Vasanthi Padmanabhan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VasanthiP&backgroundColor=d1d4f9', content: 'The cost-effectiveness argument is compelling. At ₹3/day, this should be in every primary health centre. We\'re running a similar protocol in the tribal population — different genotype distribution, interesting preliminary data.', timestamp: '3 days ago' },
      { _id: 'sc6', author: 'Dr. Prakash Dorairaj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PrakashD&backgroundColor=b6e3f4', content: 'From the cardiology perspective — very reassuring safety data. No CHF in 200 patients over 18 months supports the recent meta-analysis. Would you consider a cardiac MRI substudy in your extension cohort?', timestamp: '2 days ago' },
    ],
    timestamp: '5 days ago',
    isProject: false,
  },
  {
    _id: 'showcase-t4',
    author: 'Dr. Prakash Dorairaj',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PrakashD&backgroundColor=b6e3f4',
    title: 'Colchicine 0.5 mg for Post-MI Pericarditis: Retrospective Analysis of 1,200 STEMI Patients',
    content: `Retrospective cohort from Kovai Medical Center (2019–2025):\n\n❤️ 1,200 STEMI patients, 340 received colchicine 0.5 mg/day within 48h of PCI\n\nResults:\n- Dressler syndrome: 4.1% (colchicine) vs 7.0% (no colchicine), p=0.04\n- Recurrent pericarditis at 1 year: 2.9% vs 8.2%, p<0.01\n- Post-PCI CRP at day 3: 12.4 vs 28.7 mg/L\n- No significant increase in GI adverse events\n- All-cause mortality: no difference (3.2% vs 3.5%)\n\nNLRP3 inflammasome suppression likely mediates the benefit. Planning a prospective RCT — need biostatistics collaborators for sample size calculation with the composite endpoint.\n\nhttps://clinicaltrials.gov/search?term=colchicine+pericarditis`,
    tags: ['Cardiology', 'Inflammation', 'Colchicine'],
    upvotes: 19,
    upvotedBy: [],
    comments: [
      { _id: 'sc7', author: 'Dr. Nithya Ramanathan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NithyaR&backgroundColor=c0aede', content: 'Impressive CRP reduction. For the prospective trial, consider including IL-1β and IL-18 as NLRP3 pathway biomarkers — would strengthen the mechanistic story for publications.', timestamp: '6 days ago' },
    ],
    timestamp: '1 week ago',
    isProject: false,
  },
  {
    _id: 'showcase-t5',
    author: 'Dr. Vijayalakshmi Thangaraj',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VijayaT&backgroundColor=ffd5dc',
    title: 'Topical Dapsone 7.5% Gel for Diabetic Foot Ulcers — RCT Results',
    content: `Completed our RCT at Rajiv Gandhi Government Hospital (n=80):\n\n🦶 Dapsone 7.5% gel applied BID to Wagner Grade 2 diabetic foot ulcers\n\n12-week outcomes:\n- Complete wound closure: 62% (dapsone) vs 31% (standard care), p<0.001\n- Mean time to 50% area reduction: 3.2 vs 5.8 weeks\n- Bacterial biofilm reduction (confocal): 78% vs 42%\n- No systemic dapsone absorption detected (serum levels <0.1 µg/mL)\n\nMechanism: neutrophil chemotaxis modulation + anti-biofilm activity. The zero systemic absorption is critical for avoiding hemolytic anemia risk.\n\nManuscript accepted in Wound Repair and Regeneration. Happy to share protocol details.`,
    tags: ['Wound Healing', 'Diabetes', 'Dapsone'],
    upvotes: 26,
    upvotedBy: [],
    comments: [
      { _id: 'sc8', author: 'Dr. Kumaran Selvam', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KumaranS&backgroundColor=d1d4f9', content: 'Congratulations on the acceptance! The confocal biofilm data is a strong differentiator vs other topical approaches. We should explore this in venous leg ulcers too — similar inflammatory profile.', timestamp: '3 days ago' },
      { _id: 'sc9', author: 'Dr. Shanthini Devi M.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShanthiniD&backgroundColor=c0aede', content: 'Zero systemic absorption is remarkable for a 7.5% formulation. What\'s the vehicle? Our rheumatology patients on systemic dapsone for DH would benefit from understanding the pharmacokinetic barrier.', timestamp: '2 days ago' },
    ],
    timestamp: '4 days ago',
    isProject: false,
  },
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Post Composition
  const [isComposing, setIsComposing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments & Expansion
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Editing State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editThreadTitle, setEditThreadTitle] = useState('');
  const [editThreadContent, setEditThreadContent] = useState('');

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: 'thread' | 'comment'; item: { threadId: string; commentId?: string } | null }>({ isOpen: false, type: 'thread', item: null });

  useEffect(() => {
    fetchThreads();
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/community", { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const apiThreads: Thread[] = (data || []).map((t: any) => ({
          ...t,
          timestamp: t.timestamp || (t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'recently'),
          comments: (t.comments || []).map((c: any) => ({
            ...c,
            timestamp: c.timestamp || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'recently'),
          })),
        }));
        // Append showcase threads after real ones
        if (apiThreads.length === 0) {
          setThreads(SHOWCASE_THREADS);
        } else {
          const realIds = new Set(apiThreads.map(t => t._id));
          setThreads([...apiThreads, ...SHOWCASE_THREADS.filter(s => !realIds.has(s._id))]);
        }
      }
    } catch (e) {
      console.error(e);
      setThreads(SHOWCASE_THREADS);
    }
  };

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTags = newContent.split(" ").filter(w => /^[A-Z][a-z]{3,}$/.test(w)).slice(0, 3);
    if (newTags.length === 0) newTags.push("Discussion");

    const payload = {
      author: user?.name || user?.email || "Anonymous Researcher",
      avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "User"}&backgroundColor=e2e8f0`,
      title: newTitle,
      content: newContent,
      imageUrl: newImage || undefined,
      tags: newTags
    };

    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      await fetchThreads();
    } catch (e) {
      console.error(e);
    }
    setIsComposing(false);
    setNewTitle("");
    setNewContent("");
    setNewImage(null);
  };

  const toggleLike = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    try {
      const userId = user?.email || "anonymous";
      if (userId === "anonymous") return; 
      
      await fetch(`/api/community/${threadId}/upvote`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ userId })
      });
      await fetchThreads();
    } catch (e) {
      console.error("Failed to upvote:", e);
    }
  };

  const toggleThreadExpand = (threadId: string) => {
    if (expandedThread === threadId) {
      setExpandedThread(null);
    } else {
      setExpandedThread(threadId);
      setCommentText('');
    }
  };

  const handleAddComment = async (e: React.MouseEvent | React.KeyboardEvent, threadId: string) => {
    e.stopPropagation();
    if (!commentText.trim()) return;

    try {
      await fetch(`/api/community/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          author: user?.name || user?.email || "Anonymous Researcher",
          avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "User"}&backgroundColor=e2e8f0`,
          content: commentText
        })
      });
      await fetchThreads();
    } catch (err) {
      console.error(err);
    }
    
    setCommentText("");
  };

  const handleDeleteThread = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, type: 'thread', item: { threadId: id } });
  };

  const confirmDeleteThread = async (id: string) => {
    try {
      await fetch(`/api/community/${id}`, { method: 'DELETE', credentials: 'include' });
      if (expandedThread === id) setExpandedThread(null);
      await fetchThreads();
    } catch (err) { console.error(err); }
  };

  const startEditThread = (e: React.MouseEvent, thread: Thread) => {
    e.stopPropagation();
    setEditingThreadId(thread._id);
    setEditThreadTitle(thread.title);
    setEditThreadContent(thread.content);
    setOpenMenuId(null);
  };

  const handleEditThreadSubmit = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/community/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editThreadTitle, content: editThreadContent })
      });
      setEditingThreadId(null);
      await fetchThreads();
    } catch (err) { console.error(err); }
  };

  const handleDeleteComment = async (e: React.MouseEvent, threadId: string, commentId: string) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, type: 'comment', item: { threadId, commentId } });
  };

  const confirmDeleteComment = async (threadId: string, commentId: string) => {
    try {
      await fetch(`/api/community/${threadId}/comments/${commentId}`, { method: 'DELETE', credentials: 'include' });
      await fetchThreads();
    } catch (err) { console.error(err); }
  };

  const startEditComment = (e: React.MouseEvent, threadId: string, comment: ThreadComment) => {
    e.stopPropagation();
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
    setOpenMenuId(null);
  };

  const handleEditCommentSubmit = async (e: React.MouseEvent, threadId: string, commentId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/community/${threadId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: editCommentContent })
      });
      setEditingCommentId(null);
      await fetchThreads();
    } catch (err) { console.error(err); }
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#000000] text-zinc-900 dark:text-[#ededed] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 lg:px-12 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/60 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              Research Community
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Global pharmacological intelligence network</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-zinc-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research..." 
              className="pl-9 w-64 rounded-full bg-zinc-100 dark:bg-zinc-900/50 border-transparent focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-700"
            />
          </div>
          <Button 
            onClick={() => setIsComposing(true)}
            className="rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm font-semibold flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Post</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        <AnimatePresence>
          {isComposing && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Title of your research question or finding"
                  className="w-full bg-transparent text-lg font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border-none outline-none focus:ring-0 px-0 mb-3"
                />
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share details about properties, viability scores, clinical trial overlaps..."
                  className="w-full bg-transparent text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border-none outline-none focus:ring-0 px-0 resize-none min-h-[100px]"
                />

                {/* Attachments Preview */}
                {newImage && (
                  <div className="relative mt-2 mb-4 w-fit group">
                    <img src={newImage} alt="Attachment" className="max-h-64 rounded-xl border border-zinc-200 dark:border-zinc-800 object-contain" />
                    <button 
                      onClick={() => setNewImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={(e) => handleImageUpload(e, setNewImage)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-full w-8 h-8"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setNewContent(prev => prev + ' #Target ')}
                        title="Tag a Molecule/Target"
                        className="hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-full w-8 h-8 hidden sm:flex"
                      >
                        <Target className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setNewContent(prev => prev + ' #Clinical ')}
                        title="Tag Clinical Activity"
                        className="hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-full w-8 h-8 hidden sm:flex"
                      >
                      <Activity className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => { setIsComposing(false); setNewImage(null); }} className="rounded-full text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handlePost} 
                      disabled={!newTitle.trim() || !newContent.trim()}
                      className="rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 font-semibold"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {filteredThreads.length === 0 ? (
             <div className="text-center py-20">
               <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-zinc-400" />
               </div>
               <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No research found</h3>
               <p className="text-zinc-500 dark:text-zinc-400 mt-1">Try adjusting your search criteria or start a new discussion.</p>
             </div>
          ) : (
            filteredThreads.map((thread) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={thread._id} 
                onClick={() => toggleThreadExpand(thread._id)}
                className={clsx(
                  "bg-white dark:bg-[#0c0c0e] border rounded-2xl p-5 sm:p-6 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer shadow-sm relative",
                  thread.isProject ? "border-zinc-300 dark:border-zinc-700" : "border-zinc-200 dark:border-zinc-800/60"
                )}
              >
                <div className="flex items-start justify-between mb-3 relative">
                  <div className="flex items-center gap-3">
                    <img src={thread.avatar} alt={thread.author} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 shrink-0" />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{thread.author}</span>
                      {thread.isProject && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
                          Official Team
                        </span>
                      )}
                      <span className="text-xs text-zinc-500 shrink-0">• {thread.timestamp}</span>
                    </div>
                  </div>
                  
                  {/* Thread 3 dots */}
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(e, thread._id)} 
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === thread._id && (
                      <div className="absolute right-0 top-8 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-50">
                        <button 
                          onClick={(e) => startEditThread(e, thread)}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={(e) => handleDeleteThread(e, thread._id)}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editingThreadId === thread._id ? (
                  <div className="space-y-3 mb-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editThreadTitle} 
                      onChange={(e) => setEditThreadTitle(e.target.value)} 
                      className="w-full bg-transparent text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 outline-none pb-1"
                    />
                    <textarea 
                      value={editThreadContent} 
                      onChange={(e) => setEditThreadContent(e.target.value)} 
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-md p-2 outline-none min-h-[100px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditingThreadId(null)}>Cancel</Button>
                      <Button size="sm" onClick={(e) => handleEditThreadSubmit(e, thread._id)} className="gap-2">
                        <Save className="w-3.5 h-3.5" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 leading-snug">
                      {thread.title}
                    </h2>
                    
                    <p className={clsx("text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 whitespace-pre-wrap", expandedThread !== thread._id && "line-clamp-3")}>
                      {renderContentWithLinks(thread.content)}
                    </p>
                  </>
                )}

                {thread.imageUrl && (
                  <div className="mb-4">
                    <img src={thread.imageUrl} alt="Thread content" className="max-h-96 rounded-xl border border-zinc-200 dark:border-zinc-800 object-contain w-full bg-zinc-50 dark:bg-zinc-900/40" />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  {thread.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900/80 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/50">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 mt-2">
                  <button 
                    onClick={(e) => toggleLike(e, thread._id)}
                    className={clsx(
                      "flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full",
                      (thread.upvotedBy && user?.email && thread.upvotedBy.includes(user.email)) || thread.hasLiked
                        ? "text-cyan-600 dark:text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40" 
                        : "hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900/50"
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs font-bold">{thread.upvotes}</span>
                  </button>
                  <div className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-full ml-auto sm:ml-0">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold">{thread.comments.length}</span>
                  </div>
                </div>

                {/* Expanded Comment Section */}
                <AnimatePresence>
                  {expandedThread === thread._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                      onClick={e => e.stopPropagation()} 
                    >
                      <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 pb-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Discussion</h4>
                        
                        <div className="space-y-4 mb-5">
                          {thread.comments.map(comment => (
                            <div key={comment._id} className="flex gap-3 relative group">
                              <img src={comment.avatar} alt={comment.author} className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 shrink-0" />
                              <div className="flex-1 min-w-0 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80 p-3 rounded-2xl rounded-tl-sm relative">
                                
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{comment.author}</span>
                                    <span className="text-[10px] text-zinc-500">{comment.timestamp}</span>
                                  </div>
                                  
                                  {/* Comment 3 dots */}
                                  <div className="relative">
                                    <button 
                                      onClick={(e) => toggleMenu(e, `comment-${comment._id}`)} 
                                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 rounded-md text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>
                                    {openMenuId === `comment-${comment._id}` && (
                                      <div className="absolute right-0 top-6 w-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-50">
                                        <button 
                                          onClick={(e) => startEditComment(e, thread._id, comment)}
                                          className="w-full text-left px-3 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                                        >
                                          <Edit2 className="w-3 h-3" /> Edit
                                        </button>
                                        <button 
                                          onClick={(e) => handleDeleteComment(e, thread._id, comment._id)}
                                          className="w-full text-left px-3 py-1 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 transition-colors flex items-center gap-2"
                                        >
                                          <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {editingCommentId === comment._id ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea 
                                      value={editCommentContent} 
                                      onChange={(e) => setEditCommentContent(e.target.value)} 
                                      className="w-full bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-md p-2 outline-none min-h-[60px]"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                      <Button size="sm" className="h-7 text-xs gap-1.5" onClick={(e) => handleEditCommentSubmit(e, thread._id, comment._id)}>
                                        <Save className="w-3 h-3" /> Save
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {renderContentWithLinks(comment.content)}
                                  </p>
                                )}

                              </div>
                            </div>
                          ))}
                          
                          {thread.comments.length === 0 && (
                            <div className="text-center py-4 text-sm text-zinc-500">
                              No comments yet. Be the first to start the discussion.
                            </div>
                          )}
                        </div>

                        {/* Comment Input */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 relative">
                            <Input 
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              placeholder="Write a reply..."
                              className="pr-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleAddComment(e, thread._id);
                              }}
                            />

                            <Button 
                              size="icon"
                              variant="ghost"
                              onClick={(e) => handleAddComment(e, thread._id)}
                              disabled={!commentText.trim()}
                              className="absolute right-1 w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 z-10"
                            >
                              <Send className="w-4 h-4 ml-0.5" />
                            </Button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Delete {deleteConfirm.type === 'thread' ? 'Post' : 'Comment'}?</h3>
              </div>
              
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Are you sure you want to delete this {deleteConfirm.type === 'thread' ? 'post' : 'comment'}? This action cannot be undone.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setDeleteConfirm({ isOpen: false, type: 'thread', item: null })}
                  className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={async () => {
                    if (deleteConfirm.item) {
                      if (deleteConfirm.type === 'thread') {
                        await confirmDeleteThread(deleteConfirm.item.threadId);
                      } else if (deleteConfirm.type === 'comment' && deleteConfirm.item.commentId) {
                        await confirmDeleteComment(deleteConfirm.item.threadId, deleteConfirm.item.commentId);
                      }
                    }
                    setDeleteConfirm({ isOpen: false, type: 'thread', item: null });
                  }}
                  className="rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

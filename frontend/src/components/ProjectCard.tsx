import { useNavigate } from 'react-router-dom';
import { Star, GitFork, Users } from 'lucide-react';

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    description?: string;
    molecule?: string;
    disease?: string;
    tags?: string[];
    ownerName?: string;
    starCount?: number;
    forkCount?: number;
    collaboratorCount?: number;
    contributors?: { name: string; role: string }[];
    visibility?: string;
    updatedAt?: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/project/${project._id}`)}
      className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-cyan-300 transition-colors">
            {project.title}
          </h3>
          {project.ownerName && (
            <p className="text-[11px] text-zinc-600 mt-0.5">{project.ownerName}</p>
          )}
        </div>
        {project.visibility === 'public' && (
          <span className="text-[10px] text-zinc-600 border border-zinc-800 rounded-full px-2 py-0.5 ml-2 shrink-0">
            Public
          </span>
        )}
      </div>

      {project.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
          {project.description}
        </p>
      )}

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/60 text-zinc-500 border border-zinc-800"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-[10px] text-zinc-600">+{project.tags.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-[11px] text-zinc-600">
        <span className="flex items-center gap-1">
          <Star size={12} /> {project.starCount || 0}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={12} /> {project.forkCount || 0}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} /> {project.collaboratorCount || 1}
        </span>
        {project.molecule && (
          <span className="ml-auto text-cyan-500/60 truncate max-w-[100px]">
            {project.molecule}
          </span>
        )}
      </div>

      {/* Contributor avatar row */}
      {project.contributors && project.contributors.length > 0 && (
        <div className="flex items-center mt-3 -space-x-1.5">
          {project.contributors.slice(0, 5).map((c, i) => (
            <div
              key={i}
              title={`${c.name} (${c.role})`}
              className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-medium text-zinc-400"
              style={{ zIndex: 5 - i }}
            >
              {c.name?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
          {project.contributors.length > 5 && (
            <span className="text-[10px] text-zinc-600 ml-2">
              +{project.contributors.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

import mongoose, { Document, Schema } from 'mongoose';

export interface IFileEntry {
  name: string;
  path: string;
  type: 'file' | 'folder';
  url?: string;
  description?: string;
  contributorId?: string;
  contributorName?: string;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICollaborator {
  userId: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  avatar?: string;
}

export interface IHypothesis {
  _id?: any;
  title: string;
  description: string;
  status: 'proposed' | 'testing' | 'supported' | 'rejected';
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity {
  action: string;
  userId: string;
  userName: string;
  detail?: string;
  createdAt: Date;
}

export interface IResearchProject extends Document {
  title: string;
  description: string;
  molecule?: string;
  disease?: string;
  tags: string[];
  owner: string;
  ownerName?: string;
  visibility: 'public' | 'private';
  stars: string[];
  forkOf?: mongoose.Types.ObjectId;
  forkCount: number;
  collaborators: ICollaborator[];
  files: IFileEntry[];
  analyses: { jobId: string; title?: string; addedAt: Date }[];
  hypotheses: IHypothesis[];
  activity: IActivity[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const FileEntrySchema = new Schema<IFileEntry>({
  name: { type: String, required: true },
  path: { type: String, required: true },
  type: { type: String, enum: ['file', 'folder'], default: 'file' },
  url: String,
  description: String,
  contributorId: String,
  contributorName: String,
  size: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: true });

const CollaboratorSchema = new Schema<ICollaborator>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' },
  joinedAt: { type: Date, default: Date.now },
  avatar: String,
}, { _id: false });

const HypothesisSchema = new Schema<IHypothesis>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['proposed', 'testing', 'supported', 'rejected'], default: 'proposed' },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ActivitySchema = new Schema<IActivity>({
  action: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  detail: String,
  createdAt: { type: Date, default: Date.now },
});

const ResearchProjectSchema = new Schema<IResearchProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    molecule: String,
    disease: String,
    tags: [{ type: String, trim: true }],
    owner: { type: String, required: true },
    ownerName: String,
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    stars: [String],
    forkOf: { type: Schema.Types.ObjectId, ref: 'ResearchProject' },
    forkCount: { type: Number, default: 0 },
    collaborators: [CollaboratorSchema],
    files: [FileEntrySchema],
    analyses: [{
      jobId: { type: String, required: true },
      title: String,
      addedAt: { type: Date, default: Date.now },
    }],
    hypotheses: [HypothesisSchema],
    activity: {
      type: [ActivitySchema],
      default: [],
      validate: [(v: any[]) => v.length <= 50, 'Activity log capped at 50 entries'],
    },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

ResearchProjectSchema.index({ owner: 1 });
ResearchProjectSchema.index({ visibility: 1, status: 1 });
ResearchProjectSchema.index({ tags: 1 });
ResearchProjectSchema.index({ 'collaborators.userId': 1 });

export const ResearchProject = mongoose.model<IResearchProject>('ResearchProject', ResearchProjectSchema);

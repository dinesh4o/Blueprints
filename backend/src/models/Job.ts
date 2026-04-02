import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  molecule: string;
  prompt?: string;
  resolvedFrom?: string;
  selectionMeta?: any;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  reportData?: any;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    molecule: { type: String, required: true },
    prompt: { type: String },
    resolvedFrom: { type: String },
    selectionMeta: { type: Schema.Types.Mixed },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    currentStep: { type: String, default: 'Initializing AI analysis...' },
    progress: { type: Number, default: 0 },
    reportData: { type: Schema.Types.Mixed }, // Store the finalized report JSON
    shareToken: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);

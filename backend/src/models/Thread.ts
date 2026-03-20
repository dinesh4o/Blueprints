import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  author: string;
  avatar: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    author: { type: String, required: true },
    avatar: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export interface IThread extends Document {
  author: string;
  avatar: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  upvotes: number;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const threadSchema = new Schema<IThread>(
  {
    author: { type: String, required: true },
    avatar: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    tags: [{ type: String }],
    upvotes: { type: Number, default: 0 },
    comments: [commentSchema],
  },
  { timestamps: true }
);

export const Thread = mongoose.model<IThread>("Thread", threadSchema);

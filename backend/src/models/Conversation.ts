import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  constraints?: Array<{
    type: string;
    field: string;
    value: string;
  }>;
  agentActions?: Array<{
    agent: string;
    action: string;
    status: 'pending' | 'running' | 'done' | 'error';
    result?: string;
  }>;
  timestamp: Date;
}

export interface IConversation extends Document {
  jobId: string;
  userId?: mongoose.Types.ObjectId;
  molecule: string;
  messages: IMessage[];
  activeConstraints: Array<{
    type: string;
    field: string;
    value: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  constraints: [{
    type: { type: String },
    field: String,
    value: String,
  }],
  agentActions: [{
    agent: String,
    action: String,
    status: { type: String, enum: ['pending', 'running', 'done', 'error'], default: 'pending' },
    result: String,
  }],
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const ConversationSchema = new Schema<IConversation>({
  jobId: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  molecule: { type: String, required: true },
  messages: [MessageSchema],
  activeConstraints: [{
    type: { type: String },
    field: String,
    value: String,
  }],
}, { timestamps: true });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

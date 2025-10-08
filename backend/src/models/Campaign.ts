import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  _id: mongoose.Types.ObjectId; // Add explicit _id type
  userId: mongoose.Types.ObjectId;
  subject: string;
  htmlContent: string;
  fromEmail: string;
  fromName: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  sendingMethod?: 'ses' | 'gmail';
  sentCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  templateId?: mongoose.Types.ObjectId;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    htmlContent: {
      type: String,
      required: [true, 'HTML content is required'],
    },
    fromEmail: {
      type: String,
      required: [true, 'From email is required'],
      lowercase: true,
      trim: true,
    },
    fromName: {
      type: String,
      required: [true, 'From name is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sending', 'sent', 'failed'],
      default: 'draft',
      index: true,
    },
    sendingMethod: {
      type: String,
      enum: ['ses', 'gmail'],
      default: 'ses',
    },
    sentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    openCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bounceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
CampaignSchema.index({ userId: 1, createdAt: -1 });
CampaignSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);


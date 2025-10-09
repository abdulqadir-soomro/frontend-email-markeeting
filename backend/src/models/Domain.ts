import mongoose, { Document, Schema } from 'mongoose';

export interface IDomain extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  dkimTokens: string[];
  dkimStatus: 'pending' | 'verified' | 'failed';
  emails: string[];
  verificationMethod?: 'automatic' | 'manual';
  verifiedAt?: Date;
  lastCheckedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DomainSchema = new Schema<IDomain>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/, 'Please provide a valid domain'],
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
      index: true,
    },
    dkimTokens: [{
      type: String,
    }],
    dkimStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    emails: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    verificationMethod: {
      type: String,
      enum: ['automatic', 'manual', 'godaddy', 'hostinger', 'cloudflare', 'namecheap', 'other'],
      default: 'automatic',
    },
    verifiedAt: {
      type: Date,
    },
    lastCheckedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique domain per user
DomainSchema.index({ userId: 1, domain: 1 }, { unique: true });
DomainSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IDomain>('Domain', DomainSchema);


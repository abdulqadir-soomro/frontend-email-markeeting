import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  status: 'active' | 'inactive' | 'unsubscribed' | 'bounced';
  tags: string[];
  metadata: Map<string, any>;
  lastEngagementAt?: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    name: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'unsubscribed', 'bounced'],
      default: 'active',
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    lastEngagementAt: {
      type: Date,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique email per user
SubscriberSchema.index({ userId: 1, email: 1 }, { unique: true });
SubscriberSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);


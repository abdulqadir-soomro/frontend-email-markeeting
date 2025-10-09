import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailRecord extends Document {
  campaignId: mongoose.Types.ObjectId | string;
  subscriberId?: mongoose.Types.ObjectId;
  recipientEmail: string;
  opened: boolean;
  openedAt?: Date;
  openCount: number;
  clicked: boolean;
  clickedAt?: Date;
  clickCount: number;
  bounced: boolean;
  bouncedAt?: Date;
  bounceReason?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailRecordSchema = new Schema<IEmailRecord>(
  {
    campaignId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    subscriberId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscriber',
      required: false,
    },
    recipientEmail: {
      type: String,
      required: [true, 'Recipient email is required'],
      lowercase: true,
      trim: true,
    },
    opened: {
      type: Boolean,
      default: false,
      index: true,
    },
    openedAt: {
      type: Date,
    },
    openCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicked: {
      type: Boolean,
      default: false,
      index: true,
    },
    clickedAt: {
      type: Date,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bounced: {
      type: Boolean,
      default: false,
      index: true,
    },
    bouncedAt: {
      type: Date,
    },
    bounceReason: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for tracking queries
EmailRecordSchema.index({ campaignId: 1, recipientEmail: 1 }, { unique: true });
EmailRecordSchema.index({ campaignId: 1, opened: 1 });
EmailRecordSchema.index({ campaignId: 1, clicked: 1 });
EmailRecordSchema.index({ subscriberId: 1, sentAt: -1 });

export default mongoose.model<IEmailRecord>('EmailRecord', EmailRecordSchema);


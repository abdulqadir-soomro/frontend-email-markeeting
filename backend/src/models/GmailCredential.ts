import mongoose, { Document, Schema } from 'mongoose';

export interface IGmailCredential extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  appPassword: string;
  connected: boolean;
  connectedAt: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GmailCredentialSchema = new Schema<IGmailCredential>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Gmail address is required'],
      lowercase: true,
      trim: true,
      match: [/@gmail\.com$/, 'Only Gmail addresses are supported'],
    },
    appPassword: {
      type: String,
      required: [true, 'App password is required'],
      select: false, // Don't return password by default
    },
    connected: {
      type: Boolean,
      default: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGmailCredential>('GmailCredential', GmailCredentialSchema);


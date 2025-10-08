import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: 'marketing' | 'newsletter' | 'announcement' | 'promotional' | 'transactional';
  subject: string;
  htmlContent: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['marketing', 'newsletter', 'announcement', 'promotional', 'transactional'],
      required: [true, 'Category is required'],
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
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
TemplateSchema.index({ userId: 1, createdAt: -1 });
TemplateSchema.index({ userId: 1, category: 1 });

export default mongoose.model<ITemplate>('Template', TemplateSchema);


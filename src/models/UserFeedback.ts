import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserFeedback extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    category: 'bug' | 'feature_request' | 'usability' | 'performance' | 'other';
    rating: number; // 1-5
    title: string;
    description: string;
    page?: string; // which page/feature the feedback is about
    status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'closed';
    adminResponse?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserFeedbackSchema = new Schema<IUserFeedback>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userEmail: { type: String, required: true },
        category: {
            type: String,
            enum: ['bug', 'feature_request', 'usability', 'performance', 'other'],
            required: true,
        },
        rating: { type: Number, min: 1, max: 5, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        page: { type: String },
        status: {
            type: String,
            enum: ['new', 'reviewed', 'in_progress', 'resolved', 'closed'],
            default: 'new',
        },
        adminResponse: { type: String },
    },
    { timestamps: true }
);

const UserFeedback: Model<IUserFeedback> =
    mongoose.models.UserFeedback ||
    mongoose.model<IUserFeedback>('UserFeedback', UserFeedbackSchema);

export default UserFeedback;

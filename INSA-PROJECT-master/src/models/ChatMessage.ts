import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
    roomId: string; // e.g. 'director-divisionhead', 'director-staff-<userId>'
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    senderRole: string;
    recipientId?: mongoose.Types.ObjectId; // null = broadcast to room
    message: string;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        roomId: { type: String, required: true, index: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, required: true },
        recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        readAt: { type: Date },
    },
    { timestamps: true }
);

ChatMessageSchema.index({ roomId: 1, createdAt: -1 });

const ChatMessage: Model<IChatMessage> =
    mongoose.models.ChatMessage ||
    mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;

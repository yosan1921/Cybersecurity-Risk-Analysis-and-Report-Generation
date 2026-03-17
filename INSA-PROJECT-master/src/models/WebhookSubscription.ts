import mongoose, { Schema, Document, Model } from 'mongoose';

export type WebhookEvent =
    | 'analysis.completed'
    | 'risk.critical_detected'
    | 'incident.created'
    | 'report.generated'
    | 'questionnaire.received';

export interface IWebhookSubscription extends Document {
    url: string;
    events: WebhookEvent[];
    secret: string; // HMAC signing secret
    active: boolean;
    createdBy: mongoose.Types.ObjectId;
    lastTriggeredAt?: Date;
    failureCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const WebhookSubscriptionSchema = new Schema<IWebhookSubscription>(
    {
        url: { type: String, required: true },
        events: [{ type: String }],
        secret: { type: String, required: true },
        active: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        lastTriggeredAt: { type: Date },
        failureCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const WebhookSubscription: Model<IWebhookSubscription> =
    mongoose.models.WebhookSubscription ||
    mongoose.model<IWebhookSubscription>('WebhookSubscription', WebhookSubscriptionSchema);

export default WebhookSubscription;

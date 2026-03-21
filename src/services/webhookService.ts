/**
 * Webhook delivery service (CSRARS §3.5.7).
 * Signs payloads with HMAC-SHA256 and delivers to registered endpoints.
 */
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import WebhookSubscription, { WebhookEvent } from '@/models/WebhookSubscription';

export interface WebhookPayload {
    event: WebhookEvent;
    timestamp: string;
    data: Record<string, any>;
}

/**
 * Sign a payload with HMAC-SHA256 using the webhook secret.
 */
function signPayload(secret: string, body: string): string {
    return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Deliver a webhook event to all active subscribers for that event type.
 */
export async function deliverWebhook(event: WebhookEvent, data: Record<string, any>): Promise<void> {
    try {
        await dbConnect();
        const subscribers = await WebhookSubscription.find({ active: true, events: event });

        const payload: WebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            data,
        };
        const body = JSON.stringify(payload);

        await Promise.allSettled(
            subscribers.map(async (sub) => {
                const signature = signPayload(sub.secret, body);
                try {
                    const res = await fetch(sub.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRARS-Signature': signature,
                            'X-CSRARS-Event': event,
                        },
                        body,
                        signal: AbortSignal.timeout(10_000),
                    });

                    await WebhookSubscription.updateOne(
                        { _id: sub._id },
                        {
                            $set: { lastTriggeredAt: new Date() },
                            ...(res.ok ? { $set: { failureCount: 0 } } : { $inc: { failureCount: 1 } }),
                        }
                    );

                    // Disable after 5 consecutive failures
                    if (!res.ok) {
                        const updated = await WebhookSubscription.findById(sub._id);
                        if (updated && updated.failureCount >= 5) {
                            await WebhookSubscription.updateOne({ _id: sub._id }, { $set: { active: false } });
                        }
                    }
                } catch (err) {
                    console.error(`[Webhook] Delivery failed to ${sub.url}:`, err);
                    await WebhookSubscription.updateOne({ _id: sub._id }, { $inc: { failureCount: 1 } });
                }
            })
        );
    } catch (err) {
        console.error('[Webhook] deliverWebhook error:', err);
    }
}

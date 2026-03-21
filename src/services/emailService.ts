/**
 * Email notification service (CSRARS §3.4.6).
 * Uses nodemailer-compatible approach. Configure SMTP in .env.local.
 *
 * Required env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

export interface EmailPayload {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email. Falls back to console.log if SMTP is not configured.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.warn('[EmailService] SMTP not configured. Email would have been sent:', {
            to: payload.to,
            subject: payload.subject,
        });
        return;
    }

    // Dynamic import to avoid bundling nodemailer on the client
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
        from: SMTP_FROM ?? SMTP_USER,
        to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
    });
}

/** Notify about a new critical risk detected */
export async function sendCriticalRiskAlert(
    recipientEmail: string,
    company: string,
    riskCount: number,
    analysisId: string
): Promise<void> {
    await sendEmail({
        to: recipientEmail,
        subject: `[CSRARS ALERT] ${riskCount} Critical Risk(s) Detected – ${company}`,
        html: `
      <h2 style="color:#dc2626;">Critical Risk Alert</h2>
      <p><strong>${riskCount} critical risk(s)</strong> were identified for <strong>${company}</strong>.</p>
      <p>Analysis ID: <code>${analysisId}</code></p>
      <p>Please log in to the CSRARS system to review and take immediate action.</p>
    `,
    });
}

/** Notify about a new questionnaire received */
export async function sendNewQuestionnaireNotification(
    recipientEmail: string,
    company: string,
    filledBy: string
): Promise<void> {
    await sendEmail({
        to: recipientEmail,
        subject: `[CSRARS] New Questionnaire Received from ${company}`,
        html: `
      <h2>New Questionnaire Received</h2>
      <p>A new risk assessment questionnaire has been submitted by <strong>${filledBy}</strong> from <strong>${company}</strong>.</p>
      <p>Log in to CSRARS to review and process the assessment.</p>
    `,
    });
}

/** Notify about a completed analysis */
export async function sendAnalysisCompleteNotification(
    recipientEmail: string,
    company: string,
    analysisId: string
): Promise<void> {
    await sendEmail({
        to: recipientEmail,
        subject: `[CSRARS] Risk Analysis Completed – ${company}`,
        html: `
      <h2>Risk Analysis Complete</h2>
      <p>The automated risk analysis for <strong>${company}</strong> has been completed.</p>
      <p>Analysis ID: <code>${analysisId}</code></p>
      <p>Log in to CSRARS to view the results and generate reports.</p>
    `,
    });
}

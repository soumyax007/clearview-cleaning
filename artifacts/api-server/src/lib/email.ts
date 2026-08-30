import { Resend } from "resend";
import { logger } from "./logger";
import type { QuoteDocument } from "./mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let resendClient: Resend | undefined;

function getResendClient(): Resend | undefined {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return undefined;
  resendClient ??= new Resend(apiKey);
  return resendClient;
}

function isEmailAddress(contact: string): boolean {
  return EMAIL_REGEX.test(contact.trim());
}

// Resend's shared test sender. Works out of the box with no domain setup,
// but delivery is best-effort for testing only. Verify a real domain in
// Resend and swap this before relying on it for real customer traffic.
const DEFAULT_FROM = "Clearview Cleaning Co. <onboarding@resend.dev>";

function fromAddress(): string {
  return process.env["EMAIL_FROM"] || DEFAULT_FROM;
}

export async function sendOwnerNotification(quote: QuoteDocument): Promise<void> {
  const ownerEmail = process.env["OWNER_EMAIL"];
  if (!ownerEmail) {
    logger.warn("OWNER_EMAIL is not configured; skipping owner notification email");
    return;
  }

  const client = getResendClient();
  if (!client) {
    logger.warn("RESEND_API_KEY is not configured; skipping owner notification email");
    return;
  }

  const modeLabel = quote.mode === "commercial" ? "Commercial" : "Residential";

  await client.emails.send({
    from: fromAddress(),
    to: ownerEmail,
    subject: `New ${modeLabel} Quote Request from ${quote.name}`,
    html: `
      <h2>New ${modeLabel} Quote Request</h2>
      <p><strong>Name:</strong> ${escapeHtml(quote.name)}</p>
      <p><strong>Contact:</strong> ${escapeHtml(quote.contact)}</p>
      <p><strong>Message:</strong> ${escapeHtml(quote.message)}</p>
      <p><strong>Submitted:</strong> ${quote.createdAt.toISOString()}</p>
    `,
  });
}

export async function sendCustomerAutoReply(quote: QuoteDocument): Promise<void> {
  if (!isEmailAddress(quote.contact)) {
    logger.info(
      { contact: quote.contact },
      "Quote contact is not an email address; skipping customer auto-reply (phone-only submission)",
    );
    return;
  }

  const client = getResendClient();
  if (!client) {
    logger.warn("RESEND_API_KEY is not configured; skipping customer auto-reply email");
    return;
  }

  await client.emails.send({
    from: fromAddress(),
    to: quote.contact,
    subject: "We received your cleaning quote request",
    html: `
      <p>Hi ${escapeHtml(quote.name)},</p>
      <p>Thanks for reaching out to Clearview Cleaning Co.! We've received your request and
      will follow up within 1 business day.</p>
      <p>Here's a copy of what you sent us:</p>
      <blockquote>${escapeHtml(quote.message)}</blockquote>
      <p>Talk soon,<br />Clearview Cleaning Co.</p>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

import { Resend } from 'resend';
import { config } from '../config/env.js';

let resendClient;

function emailDeliveryError() {
  return Object.assign(new Error('Email delivery is temporarily unavailable.'), {
    status: 503,
    publicCode: 'EMAIL_DELIVERY_UNAVAILABLE',
    publicMessage: 'Email delivery is temporarily unavailable. Please try again later.',
  });
}

export async function sendTransactionalEmail({ to, subject, html, text, replyTo }) {
  const senderAddress = config.resendFromEmail.match(/<([^>]+)>/)?.[1] || config.resendFromEmail;
  if (!config.resendApiKey || !config.resendFromEmail || !to || !/@luciantechhub\.jo3\.org$/i.test(senderAddress.trim())) {
    throw emailDeliveryError();
  }
  resendClient ??= new Resend(config.resendApiKey);

  try {
    const { error } = await resendClient.emails.send({
      from: config.resendFromEmail,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) throw error;
  } catch {
    console.error('[email] Transactional email delivery failed.');
    throw emailDeliveryError();
  }
}
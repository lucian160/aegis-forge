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

function getSafeDeliveryErrorDetails(error) {
  if (!error || typeof error !== 'object') {
    return { message: String(error ?? 'Unknown email delivery error') };
  }

  const safeDetails = {
    name: error.name ?? 'UnknownError',
    message: error.message ?? 'Unknown email delivery error',
    statusCode: error.statusCode ?? null,
    code: error.code ?? null,
  };

  if (error.response) {
    safeDetails.response = {
      status: error.response.status ?? null,
      statusText: error.response.statusText ?? null,
    };
  }

  return safeDetails;
}

export async function sendTransactionalEmail({ to, subject, html, text, replyTo }) {
  if (!config.resendApiKey || !config.resendFromEmail || !to) {
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
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(
      '[email] Transactional email delivery failed.',
      getSafeDeliveryErrorDetails(error),
    );
    throw emailDeliveryError();
  }
}
import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = [
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
];

function getEnvironmentVariable(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Required environment variable is missing: ${name}`);
  }
  return value;
}

function getPositiveInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] || String(fallback), 10);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '5000', 10),
  mongoUri: getEnvironmentVariable('MONGODB_URI', ''),
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || '',
  publicAppUrl: (process.env.PUBLIC_APP_URL || 'http://localhost:5173').replace(/\/$/, ''),
  contactRecipients: {
    general: process.env.CONTACT_GENERAL_TO || '',
    UI_UX: process.env.CONTACT_UI_UX_TO || '',
    WEB_DEV: process.env.CONTACT_WEB_DEVELOPMENT_TO || '',
    MOBILE: process.env.CONTACT_MOBILE_DEVELOPMENT_TO || '',
    HARDWARE: process.env.CONTACT_HARDWARE_TO || '',
    QA_TESTING: process.env.CONTACT_QUALITY_ASSURANCE_TO || '',
    DEVOPS: process.env.CONTACT_DEVOPS_INFRASTRUCTURE_TO || '',
    R_AND_D: process.env.CONTACT_RESEARCH_DEVELOPMENT_TO || '',
    PRODUCT: process.env.CONTACT_PRODUCT_PROJECT_MANAGEMENT_TO || '',
    MARKETING: process.env.CONTACT_MARKETING_SOCIAL_MEDIA_TO || '',
    BUSINESS: process.env.CONTACT_BUSINESS_CLIENT_RELATIONS_TO || '',
  },
  emailVerificationTtlMinutes: getPositiveInteger('EMAIL_VERIFICATION_TTL_MINUTES', 30),
  passwordResetTtlMinutes: getPositiveInteger('PASSWORD_RESET_TTL_MINUTES', 30),
};

export function validateProductionEnvironment() {
  const missing = requiredInProduction.filter((name) => !process.env[name]);
  if (config.nodeEnv === 'production' && missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

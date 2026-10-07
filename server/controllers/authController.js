import crypto from 'node:crypto';
import { config } from '../config/env.js';
import {
  authenticateUser,
  issueEmailVerificationToken,
  issuePasswordResetToken,
  issueSession,
  registerUser,
  resetPasswordWithToken,
  rotateRefreshToken,
  sanitizeUser,
  verifyEmailToken,
} from '../services/authService.js';
import { recordAudit } from '../services/auditService.js';
import { passwordResetEmailTemplate, verificationEmailTemplate } from '../services/emailTemplates.js';
import { sendTransactionalEmail } from '../services/emailService.js';

function setRefreshCookie(response, refreshToken) {
  response.cookie('aegis_refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
}

export async function register(request, response) {
  const user = await registerUser(request.body);
  await recordAudit({ actorId: user.id, action: 'user_registered', targetType: 'user', result: 'success', details: 'Account registered; email verification required', ipAddress: request.ip, userAgent: request.get('user-agent') });
  const { token } = await issueEmailVerificationToken(user);
  const verificationUrl = new URL('/verify-email', config.publicAppUrl);
  verificationUrl.searchParams.set('token', token);

  try {
    const email = verificationEmailTemplate({ name: user.name, verificationUrl: verificationUrl.toString(), expiresInMinutes: config.emailVerificationTtlMinutes });
    await sendTransactionalEmail({ to: user.email, ...email });
  } catch (error) {
    await recordAudit({ actorId: user.id, action: 'email_verification_failed', targetType: 'user', result: 'failure', details: 'Verification email delivery failed', department: user.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });
    throw error;
  }

  response.status(201).json({ message: 'Account created. Check your email for a verification link before signing in.' });
}

export async function verifyEmail(request, response) {
  try {
    const { status, user } = await verifyEmailToken(request.query.token);
    if (status === 'verified') {
      await recordAudit({ actorId: user.id, action: 'email_verified', targetType: 'user', result: 'success', details: 'Email address verified', department: user.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });
      return response.json({ status, message: 'Your email is verified. You can now sign in.' });
    }
    return response.json({ status, message: 'This email address is already verified. You can sign in.' });
  } catch (error) {
    await recordAudit({ actorId: null, action: 'email_verification_failed', targetType: 'user', result: 'failure', details: 'Verification link was invalid or expired', ipAddress: request.ip, userAgent: request.get('user-agent') });
    throw error;
  }
}

const genericVerificationResponse = { message: 'If an unverified account exists for that email, a verification link will be sent.' };

export async function resendVerification(request, response) {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(202).json(genericVerificationResponse);
  }

  const { default: User } = await import('../models/User.js');
  const user = await User.findOne({ email, isActive: true, isVerified: false });
  await recordAudit({ actorId: user?.id || null, action: 'verification_email_requested', targetType: 'user', result: 'success', details: 'Verification email request processed', department: user?.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });

  if (user) {
    try {
      const { token } = await issueEmailVerificationToken(user);
      const verificationUrl = new URL('/verify-email', config.publicAppUrl);
      verificationUrl.searchParams.set('token', token);
      const emailMessage = verificationEmailTemplate({ name: user.name, verificationUrl: verificationUrl.toString(), expiresInMinutes: config.emailVerificationTtlMinutes });
      await sendTransactionalEmail({ to: user.email, ...emailMessage });
    } catch {
      console.error('[auth] Verification email request could not be completed.');
      await recordAudit({ actorId: user.id, action: 'email_verification_failed', targetType: 'user', result: 'failure', details: 'Verification email delivery failed', department: user.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });
    }
  }

  response.status(202).json(genericVerificationResponse);
}

const genericResetResponse = { message: 'If an account exists for that email, password reset instructions will be sent.' };

export async function requestPasswordReset(request, response) {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const { default: User } = await import('../models/User.js');
  const user = email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? await User.findOne({ email, isActive: true, isVerified: true })
    : null;
  await recordAudit({ actorId: user?.id || null, action: 'password_reset_requested', targetType: 'user', result: 'success', details: 'Password reset request processed', department: user?.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });

  if (user) {
    try {
      const { token } = await issuePasswordResetToken(user);
      const resetUrl = new URL('/reset-password', config.publicAppUrl);
      resetUrl.searchParams.set('token', token);
      const emailMessage = passwordResetEmailTemplate({ resetUrl: resetUrl.toString(), expiresInMinutes: config.passwordResetTtlMinutes });
      await sendTransactionalEmail({ to: user.email, ...emailMessage });
    } catch {
      console.error('[auth] Password reset email request could not be completed.');
      await recordAudit({ actorId: user.id, action: 'password_reset_failed', targetType: 'user', result: 'failure', details: 'Password reset email delivery failed', department: user.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });
    }
  }

  response.status(202).json(genericResetResponse);
}

export async function resetPassword(request, response) {
  try {
    const user = await resetPasswordWithToken(request.body?.token, request.body?.password);
    await recordAudit({ actorId: user.id, action: 'password_reset', targetType: 'user', result: 'success', details: 'Password reset completed; refresh session revoked', department: user.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });
    response.clearCookie('aegis_refresh_token', { path: '/api/v1/auth', httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    response.json({ message: 'Your password has been updated. Sign in with your new password.' });
  } catch (error) {
    await recordAudit({ actorId: null, action: 'password_reset_failed', targetType: 'user', result: 'failure', details: 'Password reset attempt was invalid or expired', ipAddress: request.ip, userAgent: request.get('user-agent') });
    throw error;
  }
}

export async function login(request, response) {
  const { email, password } = request.body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return response.status(400).json({ error: 'Email and password are required.' });
  }
  if (email.length > 254 || password.length > 4096) return response.status(400).json({ error: 'Invalid authentication request.' });

  try {
    const user = await authenticateUser(email.trim().toLowerCase(), password);
    const session = await issueSession(user);
    setRefreshCookie(response, session.refreshToken);
    await recordAudit({ actorId: user.id, action: 'login', targetType: 'session', result: 'success', details: 'User authenticated', department: user.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });
    response.json({ user: session.user, accessToken: session.accessToken });
  } catch (error) {
    await recordAudit({ actorId: null, action: 'login_failed', targetType: 'user', result: 'failure', details: 'Authentication failed', ipAddress: request.ip, userAgent: request.get('user-agent') }).catch(() => {});
    throw error;
  }
}

export async function refresh(request, response) {
  const refreshToken = request.cookies.aegis_refresh_token;
  if (!refreshToken) return response.status(401).json({ error: 'Refresh session is missing.' });

  const session = await rotateRefreshToken(refreshToken);
  setRefreshCookie(response, session.refreshToken);
  await recordAudit({ actorId: session.user.id, action: 'session_refreshed', targetType: 'session', result: 'success', department: session.user.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });
  response.json({ user: session.user, accessToken: session.accessToken });
}

export async function logout(request, response) {
  const refreshToken = request.cookies.aegis_refresh_token;
  if (refreshToken) {
    const { default: User } = await import('../models/User.js');
    const { verifyRefreshToken } = await import('../services/authService.js');
    const decoded = verifyRefreshToken(refreshToken);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const actor = await User.findById(decoded.sub).select('departmentId');
    await User.findOneAndUpdate({ _id: decoded.sub, refreshTokenHash }, { $unset: { refreshTokenHash: 1 } });
    await recordAudit({ actorId: decoded.sub, action: 'logout', targetType: 'session', result: 'success', department: actor?.departmentId, ipAddress: request.ip, userAgent: request.get('user-agent') });
  }
  response.clearCookie('aegis_refresh_token', {
    path: '/api/v1/auth',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  response.status(204).send();
}

export async function getProfile(request, response) {
  response.json({ user: sanitizeUser(request.user) });
}

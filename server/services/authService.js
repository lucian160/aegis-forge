import crypto from 'node:crypto';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { requirePrivacyConsent } from './privacyConsent.js';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || (config.nodeEnv === 'production' ? '' : 'development-only-access-token-secret-change-me');
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || (config.nodeEnv === 'production' ? '' : 'development-only-refresh-token-secret-change-me');
const accessTokenTtl = process.env.ACCESS_TOKEN_TTL || '15m';
const refreshTokenTtl = process.env.REFRESH_TOKEN_TTL || '7d';

if (config.nodeEnv === 'production' && (!accessTokenSecret || !refreshTokenSecret)) {
  throw new Error('ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are required in production.');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, hash) => {
      if (error) return reject(error);
      resolve({ salt: salt.toString('hex'), hash: hash.toString('hex') });
    });
  });
}

function verifyPassword(password, saved) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, Buffer.from(saved.salt, 'hex'), 64, (error, hash) => {
      if (error) return reject(error);
      resolve(crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(saved.hash, 'hex')));
    });
  });
}

function createAccessToken(user) {
  return jwt.sign({ sub: user.id, roleId: user.roleId }, accessTokenSecret, { expiresIn: accessTokenTtl });
}

function createRefreshToken(user) {
  return jwt.sign({ sub: user.id }, refreshTokenSecret, { expiresIn: refreshTokenTtl });
}

function createTokenPair(user) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  return { accessToken, refreshToken };
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createOneTimeToken() {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, tokenHash: crypto.createHash('sha256').update(token).digest('hex') };
}

function authError(message, status, publicCode) {
  return Object.assign(new Error(message), { status, publicCode });
}

export function normalizeDepartmentId(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return null;
    if (mongoose.isValidObjectId(normalized)) return new mongoose.Types.ObjectId(normalized);
  }
  return null;
}

export async function registerUser({ name, email, password, departmentId = '', privacyConsent }) {
  const consent = requirePrivacyConsent(privacyConsent);
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof departmentId !== 'string') {
    throw Object.assign(new Error('Name, email, and password are required.'), { status: 400 });
  }
  if (!name.trim() || !email.trim() || !password) throw Object.assign(new Error('Name, email, and password are required.'), { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw Object.assign(new Error('A valid email address is required.'), { status: 400 });
  if (password.length < 8) throw Object.assign(new Error('Password must be at least 8 characters.'), { status: 400 });
  if (name.length > 100 || email.length > 254 || departmentId.length > 60) throw Object.assign(new Error('Invalid registration details.'), { status: 400 });

  const normalizedDepartmentId = normalizeDepartmentId(departmentId);
  if (departmentId && !normalizedDepartmentId) {
    throw Object.assign(new Error('Department identifier is invalid.'), { status: 400 });
  }
  if (normalizedDepartmentId) {
    throw Object.assign(new Error('Department assignment is managed by an administrator.'), { status: 400 });
  }

  const passwordData = await hashPassword(password);
  const User = (await import('../models/User.js')).default;
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: `${passwordData.salt}:${passwordData.hash}`,
    roleId: 'member',
    departmentId: null,
    ...consent,
  });

  return user;
}

export async function issueEmailVerificationToken(user) {
  const { token, tokenHash } = createOneTimeToken();
  const expiresAt = new Date(Date.now() + config.emailVerificationTtlMinutes * 60 * 1000);
  user.verificationTokenHash = tokenHash;
  user.verificationExpiresAt = expiresAt;
  await user.save();
  return { token, expiresAt };
}

export async function verifyEmailToken(token) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 128) {
    throw authError('This verification link is invalid or has expired.', 400, 'INVALID_VERIFICATION_TOKEN');
  }
  const User = (await import('../models/User.js')).default;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ verificationTokenHash: tokenHash })
    .select('+verificationTokenHash +verificationExpiresAt');
  if (!user) throw authError('This verification link is invalid or has expired.', 400, 'INVALID_VERIFICATION_TOKEN');
  if (user.isVerified) {
    await User.updateOne({ _id: user._id, verificationTokenHash: tokenHash }, { $unset: { verificationTokenHash: 1, verificationExpiresAt: 1 } });
    return { status: 'already_verified', user };
  }
  if (!user.verificationExpiresAt || user.verificationExpiresAt <= new Date()) {
    await User.updateOne({ _id: user._id, verificationTokenHash: tokenHash }, { $unset: { verificationTokenHash: 1, verificationExpiresAt: 1 } });
    throw authError('This verification link has expired. Request a new verification email.', 400, 'EXPIRED_VERIFICATION_TOKEN');
  }

  const verificationUpdate = await User.updateOne(
    { _id: user._id, verificationTokenHash: tokenHash, verificationExpiresAt: { $gt: new Date() }, isVerified: false },
    { $set: { isVerified: true }, $unset: { verificationTokenHash: 1, verificationExpiresAt: 1 } },
  );
  if (!verificationUpdate.modifiedCount) {
    throw authError('This verification link is invalid or has already been used.', 400, 'INVALID_VERIFICATION_TOKEN');
  }
  user.isVerified = true;
  return { status: 'verified', user };
}

export async function issuePasswordResetToken(user) {
  const { token, tokenHash } = createOneTimeToken();
  const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();
  return { token, expiresAt };
}

export async function resetPasswordWithToken(token, password) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 128) {
    throw authError('This password reset link is invalid or has expired.', 400, 'INVALID_RESET_TOKEN');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 4096) {
    throw authError('Password must be between 8 and 4096 characters.', 400, 'INVALID_PASSWORD');
  }

  const User = (await import('../models/User.js')).default;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ passwordResetTokenHash: tokenHash })
    .select('+passwordResetTokenHash +passwordResetExpiresAt');
  if (!user) throw authError('This password reset link is invalid or has expired.', 400, 'INVALID_RESET_TOKEN');
  if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt <= new Date()) {
    await User.updateOne({ _id: user._id, passwordResetTokenHash: tokenHash }, { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } });
    throw authError('This password reset link has expired. Request a new one.', 400, 'EXPIRED_RESET_TOKEN');
  }

  const passwordData = await hashPassword(password);
  const resetUpdate = await User.updateOne(
    { _id: user._id, passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } },
    {
      $set: { passwordHash: `${passwordData.salt}:${passwordData.hash}` },
      $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1, refreshTokenHash: 1 },
    },
  );
  if (!resetUpdate.modifiedCount) {
    throw authError('This password reset link is invalid or has expired.', 400, 'INVALID_RESET_TOKEN');
  }
  return user;
}

export async function authenticateUser(email, password) {
  const User = (await import('../models/User.js')).default;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) throw authError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');

  const [savedSalt, savedHash] = user.passwordHash.split(':');
  const passwordMatches = await verifyPassword(password, { salt: savedSalt, hash: savedHash }).catch(() => false);
  if (!passwordMatches) throw authError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  if (!user.isVerified) throw authError('Please verify your email address before signing in.', 403, 'EMAIL_NOT_VERIFIED');

  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

export async function issueSession(user) {
  const { accessToken, refreshToken } = createTokenPair(user);
  const refreshTokenHash = hashRefreshToken(refreshToken);
  user.refreshTokenHash = refreshTokenHash;
  await user.save();
  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessTokenSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshTokenSecret);
}

export async function rotateRefreshToken(token) {
  const User = (await import('../models/User.js')).default;
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || !user.isActive || user.refreshTokenHash !== hashRefreshToken(token)) {
    throw Object.assign(new Error('Invalid or expired session.'), { status: 401 });
  }

  const { accessToken, refreshToken } = createTokenPair(user);
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

export function sanitizeUser(user) {
  const departmentId = user.departmentId && mongoose.isValidObjectId(user.departmentId) ? user.departmentId.toString() : null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    departmentId,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

export function getJwtConfig() {
  return { accessTokenSecret, refreshTokenSecret, accessTokenTtl, refreshTokenTtl };
}

export { config };

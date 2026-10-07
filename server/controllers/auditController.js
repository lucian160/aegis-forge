import { findAuditEntries } from '../services/auditService.js';

function queryForActor(request) {
  const { actor, action, targetType, result, from, to } = request.query;
  const query = {};
  if (actor && actor !== 'all') query.user = actor;
  if (action && action !== 'all') query.action = action;
  if (targetType && targetType !== 'all') query.targetType = targetType;
  if (result && result !== 'all') query.result = result;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  return query;
}

export async function listAuditEntries(request, response) {
  const query = queryForActor(request);
  const entries = await findAuditEntries(query, request.query.limit, request.user);
  response.json({ auditEntries: entries });
}

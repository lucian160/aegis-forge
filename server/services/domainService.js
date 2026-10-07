import mongoose from 'mongoose';
import { canManageResource } from '../middleware/authorizationMiddleware.js';

export function parseId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw Object.assign(new Error('Invalid resource identifier.'), { status: 400 });
  }
  return id;
}

export async function findOneAllowed(Model, id, request, allowedQuery = {}) {
  const resource = await Model.findById(parseId(id));
  if (!resource) throw Object.assign(new Error('Resource not found.'), { status: 404 });
  if (Object.hasOwn(allowedQuery, '_id') && resource._id.toString() !== allowedQuery._id?.toString()) {
    throw Object.assign(new Error('Resource not found.'), { status: 404 });
  }
  if (allowedQuery.department && resource.department?.toString() !== allowedQuery.department.toString()) {
    throw Object.assign(new Error('Resource not found.'), { status: 404 });
  }
  if (allowedQuery.owner && resource.owner?.toString() !== allowedQuery.owner) {
    throw Object.assign(new Error('Resource not found.'), { status: 404 });
  }
  request.resource = resource;
  return resource;
}

export function populateRelations(value) {
  const populate = (document) => document.populate([
    { path: 'owner', select: 'name email' },
    { path: 'department', select: 'name code' },
    { path: 'assignee', select: 'name email' },
    { path: 'author', select: 'name email' },
    { path: 'uploadedBy', select: 'name email' },
    { path: 'organizer', select: 'name email' },
    { path: 'entries', populate: { path: 'author', select: 'name email' } },
  ].filter(({ path }) => document.schema.path(path) || document.schema.virtuals[path]));

  if (Array.isArray(value)) {
    return Promise.all(value.map(populate));
  }
  return populate(value);
}

export async function createResource(Model, body, request) {
  const data = { ...body };
  data.owner = request.user.id;
  data.author = request.user.id;
  data.uploadedBy = request.user.id;
  data.organizer = request.user.id;
  const resource = await Model.create(data);
  await recordAudit({ actorId: request.user.id, action: 'resource_created', targetType: Model.modelName.toLowerCase(), targetId: resource.id, department: resource.department, details: `Created ${Model.modelName}`, ipAddress: request.ip, userAgent: request.get('user-agent') });
  return resource;
}

export async function updateResource(Model, id, body, request) {
  const resource = await findOneAllowed(Model, id, request);
  if (!canManageResource(request, resource)) {
    throw Object.assign(new Error('You do not have permission to update this resource.'), { status: 403 });
  }
  const safeBody = { ...body };
  delete safeBody.owner;
  delete safeBody.author;
  delete safeBody.uploadedBy;
  delete safeBody.organizer;
  Object.assign(resource, safeBody);
  await resource.save();
  await recordAudit({ actorId: request.user.id, action: 'resource_updated', targetType: Model.modelName.toLowerCase(), targetId: resource.id, department: resource.department, details: `Updated ${Model.modelName}`, ipAddress: request.ip, userAgent: request.get('user-agent') });
  return resource;
}

export async function deleteResource(Model, id, request) {
  const resource = await findOneAllowed(Model, id, request);
  if (!canManageResource(request, resource)) {
    throw Object.assign(new Error('You do not have permission to delete this resource.'), { status: 403 });
  }
  await resource.deleteOne();
  await recordAudit({ actorId: request.user.id, action: 'resource_deleted', targetType: Model.modelName.toLowerCase(), targetId: resource.id, department: resource.department, details: `Deleted ${Model.modelName}`, ipAddress: request.ip, userAgent: request.get('user-agent') });
  return resource;
}

export function normalizeBody(body) {
  const normalized = { ...body };
  delete normalized._id;
  delete normalized.__v;
  delete normalized.createdAt;
  delete normalized.updatedAt;
  return normalized;
}

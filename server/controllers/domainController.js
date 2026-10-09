import Department from '../models/Department.js';
import mongoose from 'mongoose';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import Document from '../models/Document.js';
import KnowledgeArticle from '../models/KnowledgeArticle.js';
import ResearchProject from '../models/ResearchProject.js';
import ResearchEntry from '../models/ResearchEntry.js';
import RecruitmentApplication from '../models/RecruitmentApplication.js';
import Meeting from '../models/Meeting.js';
import { recordAudit } from '../services/auditService.js';
import {
  createResource,
  deleteResource,
  findOneAllowed,
  normalizeBody,
  populateRelations,
  updateResource,
} from '../services/domainService.js';

const resources = {
  departments: { model: Department, scope: 'departments', name: 'department', departmentScoped: true },
  roles: { model: Role, scope: 'roles', name: 'role' },
  permissions: { model: Permission, scope: 'permissions', name: 'permission' },
  projects: { model: Project, scope: 'projects', name: 'project', departmentScoped: true },
  tasks: { model: Task, scope: 'tasks', name: 'task', departmentScoped: true },
  comments: { model: Comment, scope: 'comments', name: 'comment' },
  announcements: { model: Announcement, scope: 'announcements', name: 'announcement', departmentScoped: true },
  notifications: { model: Notification, scope: 'notifications', name: 'notification' },
  activities: { model: Activity, scope: 'activities', name: 'activity', listKey: 'activities' },
  documents: { model: Document, scope: 'documents', name: 'document', departmentScoped: true },
  knowledge: { model: KnowledgeArticle, scope: 'knowledge', name: 'knowledgeArticle', listKey: 'knowledgeArticles', departmentScoped: true },
  researchProjects: { model: ResearchProject, scope: 'research', name: 'researchProject', listKey: 'researchProjects', departmentScoped: true },
  researchEntries: { model: ResearchEntry, scope: 'research', name: 'researchEntry', listKey: 'researchEntries' },
  applications: { model: RecruitmentApplication, scope: 'applications', name: 'application', listKey: 'applications', departmentScoped: true },
  meetings: { model: Meeting, scope: 'meetings', name: 'meeting', departmentScoped: true },
};

function resourceFor(path) {
  return resources[path];
}

function departmentFilter(request, resource) {
  if (!resource.departmentScoped) return {};
  if (request.user.roleId === 'super_admin' || request.user.roleId === 'organization_leader') return {};
  if (resource.model === Department) return { _id: request.user.departmentId || new mongoose.Types.ObjectId() };
  return { department: request.user.departmentId || new mongoose.Types.ObjectId() };
}

async function canMutateDepartmentRecord(request, resource, response) {
  if (resource.model !== Department || request.user.roleId !== 'department_leader') return true;
  await recordAudit({ actorId: request.user.id, action: 'role_change_denied', targetType: 'department', targetId: request.params.id, result: 'failure', department: request.user.departmentId, details: 'Department Leader attempted to modify department structure', ipAddress: request.ip, userAgent: request.get('user-agent') }).catch(() => {});
  response.status(403).json({ error: 'Department structure and leadership can only be changed by organizational administrators.' });
  return false;
}

function rejectDepartmentMembershipFields(resource, body, response) {
  if (resource.model !== Department || (!Object.hasOwn(body, 'lead') && !Object.hasOwn(body, 'members'))) return false;
  response.status(400).json({ error: 'Manage department leads and membership through user management.' });
  return true;
}

export async function listResources(request, response) {
  const resource = resourceFor(request.params.resource);
  const query = { ...departmentFilter(request, resource) };
  if (resource.scope === 'notifications') query.user = request.user.id;
  if (resource.scope === 'activities') query.user = request.user.id;
  const documents = await resource.model.find(query).sort({ createdAt: -1 });
  const populated = await populateRelations(documents);
  response.json({ [resource.listKey || `${resource.name}s`]: populated });
}

export async function getResource(request, response) {
  const resource = resourceFor(request.params.resource);
  const allowedQuery = resource.scope === 'notifications'
    ? { user: request.user.id }
    : departmentFilter(request, resource);
  const document = await findOneAllowed(resource.model, request.params.id, request, allowedQuery);
  const populated = await populateRelations(document);
  response.json({ [resource.name]: populated });
}

export async function createResourceHandler(request, response) {
  const resource = resourceFor(request.params.resource);
  if (!await canMutateDepartmentRecord(request, resource, response)) return;
  const body = normalizeBody(request.body);
  if (rejectDepartmentMembershipFields(resource, body, response)) return;
  const document = await createResource(resource.model, body, request);
  response.status(201).json({ [resource.name]: await populateRelations(document).exec() });
}

export async function updateResourceHandler(request, response) {
  const resource = resourceFor(request.params.resource);
  if (!await canMutateDepartmentRecord(request, resource, response)) return;
  const body = normalizeBody(request.body);
  if (rejectDepartmentMembershipFields(resource, body, response)) return;
  if (resource.model === Notification) {
    const existingNotification = await findOneAllowed(Notification, request.params.id, request, { user: request.user.id });
    if (body.user && body.user !== request.user.id.toString()) {
      return response.status(403).json({ error: 'You cannot assign a notification to another user.' });
    }
    if (body.department && body.department !== existingNotification.department?.toString()) {
      return response.status(403).json({ error: 'You cannot change another user\'s department notification.' });
    }
  }
  const document = await updateResource(resource.model, request.params.id, body, request);
  const populated = await populateRelations(document);
  response.json({ [resource.name]: populated });
}

export async function deleteResourceHandler(request, response) {
  const resource = resourceFor(request.params.resource);
  if (!await canMutateDepartmentRecord(request, resource, response)) return;
  const document = resource.scope === 'notifications'
    ? await findOneAllowed(resource.model, request.params.id, request, { user: request.user.id })
    : await deleteResource(resource.model, request.params.id, request);
  if (resource.scope === 'notifications') {
    await Notification.deleteOne({ _id: document.id, user: request.user.id });
    return response.json({ deleted: resource.name, id: document.id });
  }
  response.json({ deleted: resource.name, id: document.id });
}

export function getResourceDefinitions() {
  return Object.entries(resources).map(([key, resource]) => ({ key, ...resource }));
}

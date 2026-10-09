import mongoose from 'mongoose';
import Meeting from '../models/Meeting.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Project from '../models/Project.js';
import { createNotificationsForUsers } from '../services/notificationService.js';
import { canManageResource, filterByDepartment } from '../middleware/authorizationMiddleware.js';

function meetingPayload(body, organizerId) {
  const payload = { ...body, organizer: organizerId };
  if (payload.attendees && !Array.isArray(payload.attendees)) payload.attendees = [];
  if (payload.agenda && !Array.isArray(payload.agenda)) payload.agenda = [];
  if (payload.decisions && !Array.isArray(payload.decisions)) payload.decisions = [];
  if (payload.actionItems && !Array.isArray(payload.actionItems)) payload.actionItems = [];
  return payload;
}

function normalizeUserIds(ids) {
  return [...new Set(ids.filter((id) => mongoose.isValidObjectId(id)))];
}

async function recordMeetingActivity(request, meeting, action, details) {
  await Activity.create({
    user: request.user.id,
    department: meeting.department,
    action,
    targetType: 'meeting',
    targetId: meeting.id,
    details,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  });
}

async function notifyAttendees(request, meeting, title, message) {
  const attendeeIds = meeting.attendees.map((attendee) => attendee.toString());
  await createNotificationsForUsers({
    userIds: attendeeIds,
    departmentId: meeting.department?.toString ? meeting.department.toString() : undefined,
    type: 'meeting',
    title,
    message,
    related: meeting.id,
  });
}

export async function listMeetings(request, response) {
  const query = filterByDepartment({}, request);
  const meetings = await Meeting.find(query).sort({ startsAt: 1 }).populate('organizer', 'name email roleId').populate('attendees', 'name email roleId department').populate('department', 'name code').populate('project', 'name status');
  response.json({ meetings });
}

export async function getMeeting(request, response) {
  const meeting = await Meeting.findById(request.params.id)
    .populate('organizer', 'name email roleId')
    .populate('attendees', 'name email roleId department')
    .populate('department', 'name code')
    .populate('project', 'name status');
  if (!meeting) return response.status(404).json({ error: 'Meeting not found.' });
  const query = filterByDepartment({}, request);
  if (query.department && meeting.department?.toString() !== query.department.toString()) return response.status(404).json({ error: 'Meeting not found.' });
  response.json({ meeting });
}

export async function createMeeting(request, response) {
  const body = meetingPayload(request.body, request.user.id);
  const department = body.department ? await Department.findById(body.department) : null;
  if (body.department && !department) return response.status(404).json({ error: 'Department not found.' });
  if (body.project && !mongoose.isValidObjectId(body.project)) return response.status(400).json({ error: 'Project identifier is invalid.' });
  if (body.project) {
    const project = await Project.findById(body.project);
    if (!project) return response.status(404).json({ error: 'Project not found.' });
    if (request.user.roleId !== 'super_admin' && request.user.roleId !== 'organization_leader' && project.department?.toString() !== request.user.departmentId?.toString()) return response.status(403).json({ error: 'You cannot schedule this project meeting.' });
  }
  if (request.user.roleId !== 'super_admin' && request.user.roleId !== 'organization_leader' && department && department.id !== request.user.departmentId?.toString()) return response.status(403).json({ error: 'You cannot create meetings for this department.' });
  if (body.startsAt && body.endsAt && new Date(body.endsAt) <= new Date(body.startsAt)) return response.status(400).json({ error: 'End time must be after start time.' });

  const meeting = await Meeting.create({
    ...body,
    attendees: normalizeUserIds(body.attendees || []),
    organizer: request.user.id,
  });
  await recordMeetingActivity(request, meeting, 'created', `Created ${meeting.title}`);
  await notifyAttendees(request, meeting, 'Meeting created', `${meeting.title} was created for ${department?.name || 'your team'}.`);
  response.status(201).json({ meeting: await meeting.populate('organizer', 'name email roleId').populate('attendees', 'name email roleId department').populate('department', 'name code').populate('project', 'name status') });
}

export async function updateMeeting(request, response) {
  const meeting = await Meeting.findById(request.params.id);
  if (!meeting) return response.status(404).json({ error: 'Meeting not found.' });
  if (!canManageResource(request, meeting)) return response.status(403).json({ error: 'You do not have permission to update this meeting.' });
  const previousStatus = meeting.status;
  const previousAttendees = [...meeting.attendees];
  const body = meetingPayload(request.body, meeting.organizer);
  if (body.startsAt && body.endsAt && new Date(body.endsAt) <= new Date(body.startsAt)) return response.status(400).json({ error: 'End time must be after start time.' });
  if (body.department && !mongoose.isValidObjectId(body.department)) return response.status(400).json({ error: 'Department identifier is invalid.' });
  if (body.project && !mongoose.isValidObjectId(body.project)) return response.status(400).json({ error: 'Project identifier is invalid.' });
  if (body.attendees) body.attendees = normalizeUserIds(body.attendees);

  Object.assign(meeting, body);
  await meeting.save();
  await recordMeetingActivity(request, meeting, 'updated', `Updated ${meeting.title}`);
  if (meeting.status !== previousStatus) await recordMeetingActivity(request, meeting, `marked ${meeting.status.toLowerCase()}`, `Meeting status changed from ${previousStatus} to ${meeting.status}`);
  if (meeting.attendees.length !== previousAttendees.length || meeting.attendees.some((attendee, index) => attendee.toString() !== previousAttendees[index]?.toString())) {
    await notifyAttendees(request, meeting, 'Meeting participants updated', `${meeting.title} participant details were updated.`);
  }
  response.json({ meeting: await meeting.populate('organizer', 'name email roleId').populate('attendees', 'name email roleId department').populate('department', 'name code').populate('project', 'name status') });
}

export async function cancelMeeting(request, response) {
  const meeting = await Meeting.findById(request.params.id);
  if (!meeting) return response.status(404).json({ error: 'Meeting not found.' });
  if (!canManageResource(request, meeting)) return response.status(403).json({ error: 'You do not have permission to cancel this meeting.' });
  meeting.status = 'Cancelled';
  await meeting.save();
  await recordMeetingActivity(request, meeting, 'cancelled', `Cancelled ${meeting.title}`);
  await notifyAttendees(request, meeting, 'Meeting cancelled', `${meeting.title} was cancelled.`);
  response.json({ meeting: await meeting.populate('organizer', 'name email roleId').populate('attendees', 'name email roleId department').populate('department', 'name code').populate('project', 'name status') });
}

export async function updateMeetingStatus(request, response) {
  const meeting = await Meeting.findById(request.params.id);
  if (!meeting) return response.status(404).json({ error: 'Meeting not found.' });
  if (!canManageResource(request, meeting)) return response.status(403).json({ error: 'You do not have permission to update this meeting.' });
  const allowedStatuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
  if (!allowedStatuses.includes(request.body.status)) return response.status(400).json({ error: 'Invalid meeting status.' });
  meeting.status = request.body.status;
  await meeting.save();
  await recordMeetingActivity(request, meeting, `marked ${meeting.status.toLowerCase()}`, `Meeting status changed to ${meeting.status}`);
  response.json({ meeting: await meeting.populate('organizer', 'name email roleId').populate('attendees', 'name email roleId department').populate('department', 'name code').populate('project', 'name status') });
}

export async function addMeetingParticipant(request, response) {
  const meeting = await Meeting.findById(request.params.id);
  if (!meeting) return response.status(404).json({ error: 'Meeting not found.' });
  if (!canManageResource(request, meeting)) return response.status(403).json({ error: 'You do not have permission to update this meeting.' });
  const user = await User.findById(request.body.userId);
  if (!user) return response.status(404).json({ error: 'User not found.' });
  if (!meeting.attendees.some((attendee) => attendee.toString() === user.id)) meeting.attendees.push(user.id);
  await meeting.save();
  await recordMeetingActivity(request, meeting, 'participant added', `Added ${user.name} to ${meeting.title}`);
  await createNotificationsForUsers({
    userIds: [user.id],
    departmentId: meeting.department?.toString ? meeting.department.toString() : undefined,
    type: 'meeting',
    title: 'Meeting invitation',
    message: `${meeting.title} was scheduled for ${meeting.startsAt.toLocaleString()}.`,
    related: meeting.id,
  });
  response.json({ meeting: await meeting.populate('attendees', 'name email roleId department') });
}

export async function removeMeetingParticipant(request, response) {
  const meeting = await Meeting.findById(request.params.id);
  if (!meeting) return response.status(404).json({ error: 'Meeting not found.' });
  if (!canManageResource(request, meeting)) return response.status(403).json({ error: 'You do not have permission to update this meeting.' });
  const user = await User.findById(request.body.userId);
  if (!user) return response.status(404).json({ error: 'User not found.' });
  meeting.attendees = meeting.attendees.filter((attendee) => attendee.toString() !== user.id);
  await meeting.save();
  await recordMeetingActivity(request, meeting, 'participant removed', `Removed ${user.name} from ${meeting.title}`);
  await createNotificationsForUsers({
    userIds: [user.id],
    departmentId: meeting.department?.toString ? meeting.department.toString() : undefined,
    type: 'meeting',
    title: 'Meeting update',
    message: `${meeting.title} has been updated and you are no longer listed as a participant.`,
    related: meeting.id,
  });
  response.json({ meeting: await meeting.populate('attendees', 'name email roleId department') });
}

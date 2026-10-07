import mongoose from 'mongoose';
import { config } from './env.js';

function departmentLookupKey(value) {
  return String(value || '').trim().toLowerCase();
}

export async function normalizeLegacyDepartmentReferences() {
  const departments = await mongoose.connection.collection('departments').find({}, { projection: { _id: 1, code: 1, name: 1 } }).toArray();
  const departmentByLegacyValue = new Map();
  for (const department of departments) {
    for (const value of [department._id.toString(), department.code, department.name]) {
      if (value) departmentByLegacyValue.set(departmentLookupKey(value), department._id);
    }
  }

  const userCollection = mongoose.connection.collection('users');
  const legacyUsers = await userCollection.find({ departmentId: { $type: 'string' } }, { projection: { _id: 1, departmentId: 1 } }).toArray();
  let mappedUsers = 0;
  let clearedUsers = 0;
  for (const user of legacyUsers) {
    const departmentId = departmentByLegacyValue.get(departmentLookupKey(user.departmentId));
    await userCollection.updateOne(
      { _id: user._id },
      departmentId ? { $set: { departmentId } } : { $unset: { departmentId: '' } },
    );
    if (departmentId) mappedUsers += 1;
    else clearedUsers += 1;
  }

  const activityCollection = mongoose.connection.collection('activities');
  const legacyActivities = await activityCollection.find({ department: { $type: 'string' } }, { projection: { _id: 1, department: 1 } }).toArray();
  let mappedActivities = 0;
  let clearedActivities = 0;
  for (const activity of legacyActivities) {
    const departmentId = departmentByLegacyValue.get(departmentLookupKey(activity.department));
    await activityCollection.updateOne(
      { _id: activity._id },
      departmentId ? { $set: { department: departmentId } } : { $unset: { department: '' } },
    );
    if (departmentId) mappedActivities += 1;
    else clearedActivities += 1;
  }

  if (legacyUsers.length || legacyActivities.length) {
    console.warn(`[database] Normalized legacy department references: users mapped=${mappedUsers}, cleared=${clearedUsers}; audit entries mapped=${mappedActivities}, cleared=${clearedActivities}.`);
  }
}

export async function connectDatabase() {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is required to start the backend.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.info(`MongoDB connected: ${mongoose.connection.name}`);
  await normalizeLegacyDepartmentReferences();
}

export async function disconnectDatabase() {
  if (!mongoose.connection.readyState) return;
  await mongoose.disconnect();
}

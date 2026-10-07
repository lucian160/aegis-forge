import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 5000, default: '' },
  meetingType: { type: String, enum: ['Team Meeting', 'Department Meeting', 'Project Meeting', 'Client Meeting', 'Review', 'Planning', 'Stand-up', 'Retrospective', 'One-on-one', 'Other'], default: 'Team Meeting', index: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
  location: { type: String, trim: true, maxlength: 500, default: '' },
  meetingLink: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled', index: true },
  agenda: [{ type: String, trim: true }],
  notes: { type: String, maxlength: 5000, default: '' },
  decisions: [{ type: String, trim: true }],
  actionItems: [{ type: String, trim: true }],
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
}, { timestamps: true });

meetingSchema.index({ startsAt: 1, status: 1 });
meetingSchema.index({ organizer: 1, startsAt: -1 });

export default mongoose.model('Meeting', meetingSchema);

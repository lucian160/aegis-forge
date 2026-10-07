import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { getDepartments, getMeetings, getProjects, createMeeting, updateMeeting } from '../services/domainsApi';
import { listUsers } from '../services/usersApi';
import { useAuth } from '../hooks/useAuth';

const meetingTypes = ['Team Meeting', 'Department Meeting', 'Project Meeting', 'Client Meeting', 'Review', 'Planning', 'Stand-up', 'Retrospective', 'One-on-one', 'Other'];
const statuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

function toInputDate(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toInputTime(value) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function MeetingForm({ editMode = false }) {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', meetingType: 'Team Meeting', startsAt: '', endsAt: '', location: '', meetingLink: '', department: '', project: '', status: 'Scheduled', attendees: [], agenda: '', notes: '', decisions: '', actionItems: '',
  });

  useEffect(() => {
    let active = true;
    Promise.all([getDepartments(), getProjects(), listUsers()])
      .then(([departmentResponse, projectResponse, userResponse]) => {
        if (!active) return;
        setDepartments(departmentResponse.departments || []);
        setProjects(projectResponse.projects || []);
        setTeam(userResponse.users || []);
        if (editMode && meetingId) return getMeetings().then(({ meetings }) => {
          const meeting = meetings.find((item) => item.id === meetingId);
          if (!meeting) throw new Error('Meeting not found.');
          setForm({
            title: meeting.title, description: meeting.description || '', meetingType: meeting.meetingType, startsAt: `${toInputDate(meeting.startsAt)}T${toInputTime(meeting.startsAt)}`, endsAt: `${toInputDate(meeting.endsAt)}T${toInputTime(meeting.endsAt)}`, location: meeting.location || '', meetingLink: meeting.meetingLink || '', department: meeting.department?.id || '', project: meeting.project?.id || '', status: meeting.status, attendees: meeting.attendees.map((attendee) => attendee.id), agenda: meeting.agenda.join('\n'), notes: meeting.notes || '', decisions: meeting.decisions.join('\n'), actionItems: meeting.actionItems.join('\n'),
          });
        });
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editMode, meetingId]);

  const visibleDepartments = useMemo(() => user?.roleId === 'super_admin' || user?.roleId === 'organization_leader' ? departments : departments.filter((department) => department.id === user?.departmentId), [departments, user]);
  const visibleProjects = useMemo(() => user?.roleId === 'super_admin' || user?.roleId === 'organization_leader' ? projects : projects.filter((project) => project.department?.id === user?.departmentId), [projects, user]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleAttendee = (attendeeId) => update('attendees', form.attendees.includes(attendeeId) ? form.attendees.filter((id) => id !== attendeeId) : [...form.attendees, attendeeId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.startsAt || !form.endsAt) return setError('Meeting title, start time, and end time are required.');
    if (new Date(form.endsAt) <= new Date(form.startsAt)) return setError('End time must be after start time.');
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      title: form.title.trim(), description: form.description.trim(), location: form.location.trim(), meetingLink: form.meetingLink.trim(), department: form.department || undefined, project: form.project || undefined,
      attendees: form.attendees, agenda: form.agenda.split('\n').map((item) => item.trim()).filter(Boolean), notes: form.notes.trim(), decisions: form.decisions.split('\n').map((item) => item.trim()).filter(Boolean), actionItems: form.actionItems.split('\n').map((item) => item.trim()).filter(Boolean),
      startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(),
    };
    try {
      if (editMode) await updateMeeting(meetingId, payload);
      else await createMeeting(payload);
      navigate('/meetings', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="auth-loading">Loading meeting editor…</div>;

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Schedule</p><h1>{editMode ? 'Edit meeting' : 'Schedule meeting'}</h1><p>Add the team, timing, context, decisions, and action items.</p></div></header>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <form className="meeting-form" onSubmit={submit}>
        <section className="card meeting-form-main">
          <div className="card-header"><h2>Meeting details</h2><span>{editMode ? 'Update scheduled event' : 'New internal event'}</span></div>
          <div className="card-body meeting-form-grid">
            <label className="form-field full"><span>Meeting title</span><input value={form.title} onChange={(event) => update('title', event.target.value)} required maxLength="200" placeholder="e.g. Product planning" /></label>
            <label className="form-field"><span>Meeting type</span><select value={form.meetingType} onChange={(event) => update('meetingType', event.target.value)}>{meetingTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="form-field"><span>Status</span><select value={form.status} onChange={(event) => update('status', event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="form-field"><span>Starts</span><input type="datetime-local" value={form.startsAt} onChange={(event) => update('startsAt', event.target.value)} required /></label>
            <label className="form-field"><span>Ends</span><input type="datetime-local" value={form.endsAt} onChange={(event) => update('endsAt', event.target.value)} required /></label>
            <label className="form-field"><span>Department</span><select value={form.department} onChange={(event) => update('department', event.target.value)}><option value="">Organization-wide</option>{visibleDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
            <label className="form-field"><span>Project</span><select value={form.project} onChange={(event) => update('project', event.target.value)}><option value="">No related project</option>{visibleProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
            <label className="form-field"><span>Location</span><input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Room or virtual location" maxLength="500" /></label>
            <label className="form-field"><span>Meeting link</span><input type="url" value={form.meetingLink} onChange={(event) => update('meetingLink', event.target.value)} placeholder="https://" /></label>
            <label className="form-field full"><span>Description</span><textarea value={form.description} onChange={(event) => update('description', event.target.value)} rows="4" maxLength="5000" placeholder="What should the team prepare for?" /></label>
            <label className="form-field full"><span>Agenda</span><textarea value={form.agenda} onChange={(event) => update('agenda', event.target.value)} rows="3" placeholder="One agenda item per line" /></label>
            <label className="form-field full"><span>Notes</span><textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows="3" placeholder="Additional context or follow-up notes" /></label>
            <label className="form-field full"><span>Decisions</span><textarea value={form.decisions} onChange={(event) => update('decisions', event.target.value)} rows="3" placeholder="One decision per line" /></label>
            <label className="form-field full"><span>Action items</span><textarea value={form.actionItems} onChange={(event) => update('actionItems', event.target.value)} rows="3" placeholder="One action item per line" /></label>
          </div>
        </section>

        <section className="card meeting-participant-form">
          <div className="card-header"><h2>Participants</h2><span>{form.attendees.length} selected</span></div>
          <div className="card-body participant-picker">{team.map((member) => <label key={member.id} className={form.attendees.includes(member.id) ? 'selected' : ''}><input type="checkbox" checked={form.attendees.includes(member.id)} onChange={() => toggleAttendee(member.id)} /><span className="avatar small">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{member.name}</strong><small>{member.roleId.replaceAll('_', ' ')} · {member.department?.name || 'Unassigned'}</small></span></label>)}</div>
        </section>

        <div className="meeting-form-actions"><Button type="button" variant="secondary" onClick={() => navigate(editMode ? `/meetings/${meetingId}` : '/meetings')}>Cancel</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : editMode ? 'Save changes' : 'Create meeting'}</Button></div>
      </form>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { cancelMeeting, getMeeting } from '../services/domainsApi';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../data/permissions';

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function MeetingDetail() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const canManage = meeting && hasPermission(user?.roleId, 'manage', 'meetings') && (meeting.organizer?.id === user?.id || ['super_admin', 'organization_leader', 'department_leader', 'project_manager'].includes(user?.roleId));

  useEffect(() => {
    let active = true;
    getMeeting(meetingId)
      .then(({ meeting: liveMeeting }) => { if (active) setMeeting(liveMeeting); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [meetingId]);

  const cancel = async () => {
    if (!window.confirm('Cancel this meeting?')) return;
    setCancelling(true);
    try {
      const response = await cancelMeeting(meetingId);
      setMeeting(response.meeting);
      navigate('/meetings', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="auth-loading">Loading meeting details…</div>;
  if (error) return <section className="empty-state"><div><span className="empty-state-icon">M</span><h3>Meeting unavailable</h3><p>{error}. The meeting could not be loaded.</p><Link to="/meetings"><Button variant="primary">Back to meetings</Button></Link></div></section>;
  if (!meeting) return <section className="empty-state"><div><span className="empty-state-icon">M</span><h3>Meeting not found</h3><p>The requested meeting may no longer exist.</p><Link to="/meetings"><Button variant="primary">Back to meetings</Button></Link></div></section>;

  return (
    <>
      <header className="page-header meeting-detail-header"><div><p className="eyebrow">Meeting details</p><h1>{meeting.title}</h1><p>{formatDate(meeting.startsAt)} – {new Date(meeting.endsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p></div><div className="meeting-detail-actions"><span className={`status meeting-status-${meeting.status.toLowerCase().replaceAll(' ', '-')}`}>{meeting.status}</span>{canManage && <><Link to={`/meetings/${meeting.id}/edit`}><Button variant="secondary">Edit</Button></Link><Button variant="danger" onClick={cancel} disabled={cancelling}>{cancelling ? 'Cancelling…' : 'Cancel'}</Button></>}</div></header>

      <section className="meeting-detail-grid">
        <article className="card meeting-detail-main">
          <div className="card-header"><h2>Meeting information</h2><span>{meeting.meetingType}</span></div>
          <div className="card-body meeting-detail-body">
            <div className="meeting-detail-summary"><div><span>Organizer</span><strong><span className="avatar small">{initials(meeting.organizer?.name)}</span>{meeting.organizer?.name || 'Unknown organizer'}</strong></div><div><span>Department</span><strong>{meeting.department?.name || 'Organization-wide'}</strong></div><div><span>Project</span><strong>{meeting.project?.name || 'No related project'}</strong></div><div><span>Location</span><strong>{meeting.location || 'Not specified'}</strong></div><div><span>Meeting link</span><strong>{meeting.meetingLink ? <a href={meeting.meetingLink} target="_blank" rel="noreferrer">Open meeting</a> : 'Not provided'}</strong></div></div>
            <section className="meeting-detail-section"><h3>Description</h3><p>{meeting.description || 'No description was added.'}</p></section>
            <section className="meeting-detail-section"><h3>Agenda</h3>{meeting.agenda.length ? <ol className="meeting-agenda">{meeting.agenda.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol> : <p className="empty-state-copy">No agenda items were added.</p>}</section>
            <section className="meeting-detail-section"><h3>Notes</h3><p>{meeting.notes || 'No notes were added.'}</p></section>
            <section className="meeting-detail-section"><h3>Decisions</h3>{meeting.decisions.length ? <ul className="meeting-checklist">{meeting.decisions.map((decision, index) => <li key={`${decision}-${index}`}>{decision}</li>)}</ul> : <p className="empty-state-copy">No decisions were recorded.</p>}</section>
            <section className="meeting-detail-section"><h3>Action items</h3>{meeting.actionItems.length ? <ul className="meeting-checklist">{meeting.actionItems.map((action, index) => <li key={`${action}-${index}`}>{action}</li>)}</ul> : <p className="empty-state-copy">No action items were added.</p>}</section>
          </div>
        </article>

        <aside className="meeting-detail-sidebar">
          <article className="card"><div className="card-header"><h2>Participants</h2><span>{meeting.attendees.length} people</span></div><div className="card-body participant-list">{meeting.attendees.length ? meeting.attendees.map((attendee) => <div key={attendee.id}><span className="avatar small">{initials(attendee.name)}</span><div><strong>{attendee.name}</strong><span>{attendee.roleId?.replaceAll('_', ' ') || 'Team member'}</span><small>{attendee.department?.name || 'Unassigned'}</small></div></div>) : <p className="empty-state-copy">No participants have been added.</p>}</div></article>
          <article className="card"><div className="card-header"><h2>Timeline</h2></div><div className="card-body meeting-timeline"><div><span>Created</span><strong>{new Date(meeting.createdAt).toLocaleDateString()}</strong></div><div><span>Updated</span><strong>{new Date(meeting.updatedAt).toLocaleDateString()}</strong></div></div></article>
        </aside>
      </section>
    </>
  );
}

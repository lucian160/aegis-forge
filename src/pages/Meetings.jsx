import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { getMeetings } from '../services/domainsApi';

function meetingDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function meetingTime(value) {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    getMeetings()
      .then((meetingResponse) => {
        if (!active) return;
        setMeetings(meetingResponse.meetings || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filters = useMemo(() => ['All', ...new Set(meetings.map((meeting) => meeting.status))], [meetings]);
  const visibleMeetings = useMemo(() => meetings.filter((meeting) => {
    const matchesStatus = filter === 'All' || meeting.status === filter;
    const matchesSearch = !search || `${meeting.title} ${meeting.meetingType} ${meeting.department?.name || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [filter, meetings, search]);

  const upcoming = meetings.filter((meeting) => meeting.status !== 'Cancelled' && new Date(meeting.startsAt) >= new Date()).length;
  const completed = meetings.filter((meeting) => meeting.status === 'Completed').length;

  return (
    <>
      <header className="page-header meeting-page-header">
        <div><p className="eyebrow">Team operations</p><h1>Meetings</h1><p>Plan, attend, review, and track internal team events.</p></div>
        <Link to="/meetings/new"><Button variant="primary" icon="plus">Schedule meeting</Button></Link>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load meetings: {error}. Refresh the page or try again.</p>}
      {loading ? <div className="auth-loading">Loading meetings…</div> : (
        <>
          <section className="meeting-summary-grid">
            <article className="meeting-summary-card"><span>Upcoming</span><strong>{upcoming}</strong><small>Scheduled or active</small></article>
            <article className="meeting-summary-card"><span>Completed</span><strong>{completed}</strong><small>Closed meetings</small></article>
            <article className="meeting-summary-card"><span>Meetings</span><strong>{meetings.length}</strong><small>Records in this view</small></article>
          </section>

          <section className="meeting-list-toolbar">
            <label className="meeting-search"><span className="sr-only">Search meetings</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search meetings, types, or departments" /></label>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter meetings by status"><option>All</option>{filters.filter((status) => status !== 'All').map((status) => <option key={status}>{status}</option>)}</select>
          </section>

          <section className="meeting-list">
            {visibleMeetings.length === 0 ? <div className="card empty-state"><span className="empty-state-icon">M</span><h3>No meetings found</h3><p>{meetings.length === 0 ? 'No meetings have been scheduled yet.' : 'No meetings match the selected filters.'}</p>{meetings.length === 0 && <Link to="/meetings/new"><Button variant="primary">Schedule meeting</Button></Link>}</div> : visibleMeetings.map((meeting) => (
              <article className="card meeting-list-card" key={meeting.id}>
                <div className="meeting-list-main">
                  <div className="meeting-date-block"><span>{new Date(meeting.startsAt).toLocaleDateString(undefined, { month: 'short' })}</span><strong>{new Date(meeting.startsAt).getDate()}</strong><small>{new Date(meeting.startsAt).toLocaleDateString(undefined, { weekday: 'short' })}</small></div>
                  <div className="meeting-list-copy">
                    <div className="meeting-list-top"><span className={`status meeting-status-${meeting.status.toLowerCase().replaceAll(' ', '-')}`}>{meeting.status}</span><span className="meeting-type">{meeting.meetingType}</span></div>
                    <Link to={`/meetings/${meeting.id}`}><h2>{meeting.title}</h2></Link>
                    <p>{meeting.description || 'No meeting description has been added.'}</p>
                    <div className="meeting-list-meta"><span>{meetingDate(meeting.startsAt)} · {meetingTime(meeting.startsAt)}–{meetingTime(meeting.endsAt)}</span><span>{meeting.department?.name || 'Organization'}</span></div>
                  </div>
                </div>
                <div className="meeting-list-attendees">
                  <div className="meeting-organizer"><span className="avatar small">{initials(meeting.organizer?.name)}</span><div><strong>{meeting.organizer?.name || 'Unknown organizer'}</strong><span>{meeting.organizer?.roleId.replaceAll('_', ' ') || 'Team member'}</span></div></div>
                  <span className="meeting-attendee-count">{meeting.attendees.length} attendees</span>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </>
  );
}

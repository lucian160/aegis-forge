import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { getMeetings } from '../services/domainsApi';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function MeetingCalendar() {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState('month');
  const [visibleDate, setVisibleDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getMeetings()
      .then(({ meetings: liveMeetings }) => { if (active) setMeetings(liveMeetings || []); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const monthDays = useMemo(() => {
    const year = visibleDate.getFullYear();
    const month = visibleDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let index = 0; index < firstDay.getDay(); index += 1) days.push({ date: new Date(year, month, -firstDay.getDay() + index + 1), outside: true });
    for (let day = 1; day <= lastDay.getDate(); day += 1) days.push({ date: new Date(year, month, day), outside: false });
    while (days.length < 42) days.push({ date: new Date(year, month + 1, days.length - firstDay.getDay() - lastDay.getDate() + 1), outside: true });
    return days;
  }, [visibleDate]);

  const weekDays = useMemo(() => {
    const start = new Date(visibleDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleDate]);

  const selectedDay = useMemo(() => dateKey(visibleDate), [visibleDate]);
  const calendarMeetings = useMemo(() => meetings.filter((meeting) => {
    const key = dateKey(new Date(meeting.startsAt));
    return view === 'month' || key === selectedDay || view === 'day';
  }), [meetings, selectedDay, view]);

  const changeDate = (direction) => {
    setVisibleDate((current) => {
      const next = new Date(current);
      if (view === 'month') next.setMonth(next.getMonth() + direction, 1);
      if (view === 'week') next.setDate(next.getDate() + direction * 7);
      if (view === 'day') next.setDate(next.getDate() + direction);
      return next;
    });
  };

  const renderCalendarMeetings = (date) => meetings.filter((meeting) => dateKey(new Date(meeting.startsAt)) === dateKey(date)).slice(0, 3);
  const upcomingMeetings = meetings.filter((meeting) => meeting.status !== 'Cancelled' && new Date(meeting.startsAt) >= new Date()).slice(0, 5);

  return (
    <>
      <header className="page-header calendar-page-header">
        <div><p className="eyebrow">Schedule</p><h1>Calendar</h1><p>Plan meetings across the organization and review upcoming work.</p></div>
        <Link to="/meetings/new"><Button variant="primary" icon="plus">Schedule meeting</Button></Link>
      </header>

      <section className="calendar-controls card">
        <div className="calendar-view-switch" role="group" aria-label="Calendar view">{['month', 'week', 'day'].map((option) => <button type="button" key={option} className={view === option ? 'active' : ''} onClick={() => setView(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}</div>
        <div className="calendar-navigation"><button type="button" onClick={() => changeDate(-1)}>←</button><button type="button" className="today-button" onClick={() => setVisibleDate(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button><button type="button" onClick={() => changeDate(1)}>→</button></div>
        <h2>{view === 'month' ? `${monthNames[visibleDate.getMonth()]} ${visibleDate.getFullYear()}` : view === 'week' ? `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : visibleDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
      </section>

      {error && <p className="auth-error" role="alert">Unable to load calendar events: {error}</p>}
      {loading ? <div className="auth-loading">Loading calendar…</div> : (
        <section className="calendar-layout">
          <article className="card calendar-main-card">
            {view === 'month' && <div className="month-calendar"><div className="calendar-weekdays">{dayNames.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{monthDays.map(({ date, outside }) => {
              const dayMeetings = renderCalendarMeetings(date);
              return <div className={`calendar-day ${outside ? 'outside' : ''} ${dateKey(date) === dateKey(today) ? 'today' : ''}`} key={dateKey(date)}><span className="calendar-day-number">{date.getDate()}</span><div className="calendar-day-events">{dayMeetings.map((meeting) => <Link to={`/meetings/${meeting.id}`} key={meeting.id} className={`calendar-event calendar-event-${meeting.status.toLowerCase().replaceAll(' ', '-')}`}><strong>{meeting.title}</strong><span>{formatTime(meeting.startsAt)}</span></Link>)}</div></div>;
            })}</div></div>}
            {view === 'week' && <div className="week-calendar"><div className="week-calendar-header">{weekDays.map((date) => <div key={dateKey(date)} className={dateKey(date) === dateKey(today) ? 'today' : ''}><span>{dayNames[date.getDay()]}</span><strong>{date.getDate()}</strong></div>)}</div><div className="week-calendar-body">{weekDays.map((date) => <div className="week-day-column" key={dateKey(date)}>{renderCalendarMeetings(date).map((meeting) => <Link to={`/meetings/${meeting.id}`} className="week-event" key={meeting.id}><span>{formatTime(meeting.startsAt)}</span><strong>{meeting.title}</strong><small>{meeting.department?.name || 'Organization'}</small></Link>)}{renderCalendarMeetings(date).length === 0 && <span className="calendar-empty">No meetings</span>}</div>)}</div></div>}
            {view === 'day' && <div className="day-calendar"><div className="day-calendar-heading"><span>{dayNames[visibleDate.getDay()]}</span><strong>{visibleDate.getDate()}</strong><small>{monthNames[visibleDate.getMonth()]}</small></div><div className="day-calendar-events">{renderCalendarMeetings(visibleDate).length ? renderCalendarMeetings(visibleDate).map((meeting) => <Link to={`/meetings/${meeting.id}`} className="day-event" key={meeting.id}><span className="day-event-time">{formatTime(meeting.startsAt)} – {formatTime(meeting.endsAt)}</span><strong>{meeting.title}</strong><small>{meeting.meetingType} · {meeting.department?.name || 'Organization'} · {meeting.location || 'Location not set'}</small><p>{meeting.description || 'No meeting description added.'}</p></Link>) : <div className="empty-state compact"><h3>No meetings scheduled</h3><p>This day is available for focused work.</p></div>}</div></div>}
          </article>

          <aside className="card calendar-sidebar">
            <div className="card-header"><h2>Upcoming</h2><span>{upcomingMeetings.length} events</span></div>
            <div className="card-body upcoming-list">{upcomingMeetings.length ? upcomingMeetings.map((meeting) => <Link to={`/meetings/${meeting.id}`} key={meeting.id}><span>{new Date(meeting.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><div><strong>{meeting.title}</strong><small>{formatTime(meeting.startsAt)} · {meeting.department?.name || 'Organization'}</small></div></Link>) : <p className="empty-state-copy">No upcoming meetings.</p>}</div>
            <div className="card-header calendar-legend"><h2>Statuses</h2></div><div className="card-body calendar-legend-list"><span><i className="scheduled" /> Scheduled</span><span><i className="in-progress" /> In progress</span><span><i className="completed" /> Completed</span><span><i className="cancelled" /> Cancelled</span></div>
          </aside>
        </section>
      )}
    </>
  );
}

import { useAuth } from '../hooks/useAuth';
import { canViewForRole, inboxMessages } from '../data/communications';

export default function MessagesPage() {
  const { user } = useAuth();
  const visibleMessages = inboxMessages.filter((item) => canViewForRole(user?.roleId, item.audience));

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Internal messaging</p>
          <h1>Inbox</h1>
          <p>Team conversations, reviews, and action requests across the organization.</p>
        </div>
      </header>

      <section className="card">
        <div className="card-header"><h2>Messages</h2><span>{visibleMessages.filter((item) => item.unread).length} unread</span></div>
        <div className="card-body message-list">
          {visibleMessages.map((message) => (
            <article key={message.id} className={`message-item ${message.unread ? 'unread' : 'read'}`}>
              <div className="message-item-top">
                <div className="message-sender">
                  <span className="avatar small">{message.from.split(' ').map((part) => part[0]).join('')}</span>
                  <div>
                    <strong>{message.from}</strong>
                    <span>{message.category}</span>
                  </div>
                </div>
                <span className="meta-text">{message.time}</span>
              </div>

              <h3>{message.subject}</h3>
              <p>{message.preview}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

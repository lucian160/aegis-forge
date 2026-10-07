export default function MessagesPage() {
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
        <div className="card-header"><h2>Messages</h2></div>
        <div className="card-body">
          <p className="empty-state">No message records are available from the current API.</p>
        </div>
      </section>
    </>
  );
}

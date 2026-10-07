export default function TaskCard({ task, onDragStart, onDragEnd, onSelect }) {
  return (
    <article
      className="task-card"
      draggable
      onDragStart={(event) => onDragStart?.(event, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect?.(task)}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect?.(task);
      }}
    >
      <div className="task-card-top"><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span><span className="task-id">#{task.id.split('-')[1]}</span></div>
      <h3>{task.title}</h3>
      <div className="task-labels">{task.labels.map((label) => <span key={label}>{label}</span>)}</div>
      <div className="task-card-footer">
        <span className="avatar small">{task.assignee.split(' ').map((part) => part[0]).join('')}</span>
        <span>{task.dueDate}</span>
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { taskStatuses } from '../data/projects';
import Button from '../components/Button';
import ProjectCard from '../components/ProjectCard';
import TaskCard from '../components/TaskCard';
import { createComment, getComments, getProjects, getTasks, updateTask } from '../services/domainsApi';

function mapProject(project) {
  return {
    ...project,
    owner: project.owner?.name || project.owner,
    department: project.department?.name || project.department,
  };
}

function mapTask(task) {
  return {
    ...task,
    project: task.project?.name || task.project,
    assignee: task.assignee?.name || task.assignee || 'Unassigned',
    department: task.department?.name || task.department,
    labels: task.labels || [],
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
  };
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getProjects(), getTasks()])
      .then(([projectResponse, taskResponse]) => {
        if (!active) return;
        setProjects((projectResponse.projects || []).map(mapProject));
        setTasks((taskResponse.tasks || []).map(mapTask));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const moveTask = async (status, taskId) => {
    if (!taskId || !draggedTask || draggedTask === taskId) return;
    const previousTask = tasks.find((task) => task.id === taskId);
    setTasks((currentTasks) => currentTasks.map((task) => task.id === taskId ? { ...task, status } : task));
    setDraggedTask(null);
    try {
      await updateTask(taskId, { status });
    } catch (requestError) {
      setTasks((currentTasks) => currentTasks.map((task) => task.id === taskId ? previousTask : task));
      setError(requestError.message);
    }
  };

  const selectTask = async (task) => {
    setSelectedTask(task);
    setCommentLoading(true);
    try {
      const response = await getComments(task.id);
      setComments(response.comments || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!selectedTask || !commentText.trim()) return;
    try {
      const response = await createComment({ task: selectedTask.id, project: selectedTask.projectId, content: commentText.trim() });
      setComments((items) => [response.comment, ...items]);
      setCommentText('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <>
      <header className="page-header">
        <div><p className="eyebrow">Delivery workspace</p><h1>Projects & tasks</h1><p>Track work, priorities, owners, and delivery progress.</p></div>
        <Button variant="primary" icon="plus">New project</Button>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load or update project data: {error}</p>}
      {loading ? <div className="auth-loading">Loading projects and tasks…</div> : (
        <>
          <section className="project-list-section">
            <div className="section-heading"><h2>Active projects</h2><span>{projects.length} projects</span></div>
            <div className="project-grid-large">{projects.length ? projects.map((project) => <ProjectCard key={project.id} project={project} />) : <p className="empty-state">No live projects are available.</p>}</div>
          </section>

          <section className="kanban-section">
            <div className="section-heading"><h2>Task board</h2><span>Drag cards to update status</span></div>
            <div className="kanban-board">
              {taskStatuses.map((status) => {
                const columnTasks = tasks.filter((task) => task.status === status);
                return (
                  <section className="kanban-column" key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveTask(status, draggedTask); }}>
                    <header><h3>{status}</h3><span>{columnTasks.length}</span></header>
                    <div className="kanban-card-list">
                      {columnTasks.map((task) => <TaskCard key={task.id} task={task} onDragStart={(event, taskId) => { event.dataTransfer.effectAllowed = 'move'; setDraggedTask(taskId); }} onDragEnd={() => setDraggedTask(null)} onSelect={selectTask} />)}
                      {columnTasks.length === 0 && <p className="empty-state">No tasks</p>}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          {selectedTask && (
            <section className="card task-comments">
              <div className="card-header"><div><p className="eyebrow">Task discussion</p><h2>{selectedTask.title}</h2></div><button type="button" className="icon-button" onClick={() => setSelectedTask(null)} aria-label="Close comments">×</button></div>
              <div className="card-body">
                {commentLoading ? <p className="auth-loading">Loading comments…</p> : comments.length === 0 ? <p className="empty-state">No comments yet. Add the first update.</p> : comments.map((comment) => (
                  <div className="comment-row" key={comment.id}>
                    <span className="avatar small">{comment.author?.name?.split(' ').map((part) => part[0]).join('') || 'U'}</span>
                    <div><strong>{comment.author?.name || 'Team member'}</strong><p>{comment.content}</p><small>{new Date(comment.createdAt).toLocaleDateString()}</small></div>
                  </div>
                ))}
                <form className="comment-form" onSubmit={submitComment}>
                  <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a task update…" rows="3" required maxLength="5000" />
                  <Button type="submit" variant="primary">Post comment</Button>
                </form>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

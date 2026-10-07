import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function DocumentCard({ document }) {
  return (
    <article className="content-card">
      <div className="content-card-top">
        <span className="content-icon"><Icon name="file" /></span>
        <span className={`status ${document.status.toLowerCase()}`}>{document.status}</span>
      </div>
      <Link to={`/documents/${document.id}`} className="content-card-link">
        <h3>{document.title}</h3>
        <p>{document.description}</p>
      </Link>
      <div className="content-card-meta">
        <span>{document.category}</span>
        <span>{document.updated}</span>
      </div>
      <div className="content-card-footer">
        <span className="avatar small">{document.owner.split(' ').map((part) => part[0]).join('')}</span>
        <span>{document.owner}</span>
        <span className="content-stat"><Icon name="search" />{document.views}</span>
      </div>
    </article>
  );
}

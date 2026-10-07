import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function KnowledgeCard({ article }) {
  return (
    <article className="content-card">
      <div className="content-card-top">
        <span className="content-icon"><Icon name="file" /></span>
        <span className="knowledge-category">{article.category}</span>
      </div>
      <Link to={`/knowledge-base/${article.id}`} className="content-card-link">
        <h3>{article.title}</h3>
        <p>{article.description}</p>
      </Link>
      <div className="content-card-meta">
        <span>{article.department}</span>
        <span>{article.readTime}</span>
      </div>
      <div className="content-card-footer">
        <span className="avatar small">{article.owner.split(' ').map((part) => part[0]).join('')}</span>
        <span>{article.owner}</span>
        <span className="content-stat"><Icon name="search" />{article.updated}</span>
      </div>
    </article>
  );
}

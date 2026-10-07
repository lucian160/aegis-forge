import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { getKnowledgeArticle, getKnowledgeArticles } from '../services/domainsApi';

export default function KnowledgeDetail() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedError, setRelatedError] = useState('');

  useEffect(() => {
    let active = true;
    getKnowledgeArticle(articleId)
      .then((response) => {
        if (active) setArticle(response.knowledgeArticle);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    getKnowledgeArticles()
      .then((response) => {
        if (active) setRelatedArticles(response.knowledgeArticles || []);
      })
      .catch((requestError) => {
        if (active) setRelatedError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [articleId]);

  if (loading) return <div className="auth-loading">Loading knowledge article…</div>;
  if (error) return <section className="empty-state"><div><span className="empty-state-icon">KB</span><h3>Article unavailable</h3><p>{error}. The existing knowledge library remains available.</p><Link to="/knowledge-base"><Button variant="primary">Back to knowledge</Button></Link></div></section>;

  const resolvedArticle = article;
  if (!resolvedArticle) {
    return <section className="empty-state"><div><span className="empty-state-icon">KB</span><h3>Article not found</h3><p>The requested article may have moved or no longer exists.</p><Link to="/knowledge-base"><Button variant="primary">Back to knowledge</Button></Link></div></section>;
  }

  const content = [{ title: 'Overview', body: resolvedArticle.content || 'No content is available for this article.' }];
  const related = relatedArticles.filter((item) => item.id !== articleId && item.category === resolvedArticle.category).slice(0, 4);

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Knowledge base</p><h1>{resolvedArticle.title}</h1><p>{resolvedArticle.description}</p></div></header>
      <section className="detail-layout"><article className="card document-reader"><div className="card-header"><h2>Article</h2><span>{resolvedArticle.status}</span></div><div className="card-body article-body">{content.map((section) => <section key={section.title}><h3>{section.title}</h3><p>{section.body}</p></section>)}</div></article><aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Details</h2></div><div className="card-body detail-list"><div><span>Owner</span><strong>{resolvedArticle.author?.name || 'Unknown author'}</strong></div><div><span>Department</span><strong>{resolvedArticle.department?.name || 'Unassigned'}</strong></div><div><span>Category</span><strong>{resolvedArticle.category}</strong></div><div><span>Last updated</span><strong>{resolvedArticle.updatedAt ? new Date(resolvedArticle.updatedAt).toLocaleDateString() : 'Date unavailable'}</strong></div><div><span>Read time</span><strong>{`${Math.max(1, Math.ceil((resolvedArticle.content || '').split(/\s+/).length / 200))} min read`}</strong></div></div></article><article className="card"><div className="card-header"><h2>Related articles</h2></div><div className="card-body related-list">{relatedError && <p className="auth-error" role="alert">Unable to load related articles: {relatedError}</p>}{related.map((item) => <Link key={item.id} to={`/knowledge-base/${item.id}`}>{item.title}<span>→</span></Link>)}{!related.length && !relatedError && <p className="empty-state-copy">No related articles are available.</p>}</div></article></aside></section>
    </>
  );
}

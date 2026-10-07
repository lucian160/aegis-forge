import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { knowledgeArticles as demoArticles } from '../data/knowledgeBase';
import { getKnowledgeArticle } from '../services/domainsApi';

export default function KnowledgeDetail() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getKnowledgeArticle(articleId)
      .then((response) => {
        if (active) setArticle(response.knowledge);
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
  }, [articleId]);

  if (loading) return <div className="auth-loading">Loading knowledge article…</div>;
  if (error) return <section className="empty-state"><div><span className="empty-state-icon">KB</span><h3>Article unavailable</h3><p>{error}. The existing knowledge library remains available.</p><Link to="/knowledge-base"><Button variant="primary">Back to knowledge</Button></Link></div></section>;

  const resolvedArticle = article || demoArticles.find((item) => item.id === articleId);
  if (!resolvedArticle) {
    return <section className="empty-state"><div><span className="empty-state-icon">KB</span><h3>Article not found</h3><p>The requested article may have moved or no longer exists.</p><Link to="/knowledge-base"><Button variant="primary">Back to knowledge</Button></Link></div></section>;
  }

  const content = article?.content ? [{ title: 'Overview', body: article.content }] : [{ title: 'Overview', body: 'Article content is not available for this record.' }];
  const related = demoArticles.filter((item) => item.id !== articleId && item.category === resolvedArticle.category).slice(0, 4);

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Knowledge base</p><h1>{resolvedArticle.title}</h1><p>{resolvedArticle.description}</p></div><Button variant="primary">Edit article</Button></header>
      <section className="detail-layout"><article className="card document-reader"><div className="card-header"><h2>Article</h2><span>{resolvedArticle.status}</span></div><div className="card-body article-body">{content.map((section) => <section key={section.title}><h3>{section.title}</h3><p>{section.body}</p></section>)}</div></article><aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Details</h2></div><div className="card-body detail-list"><div><span>Owner</span><strong>{resolvedArticle.owner || resolvedArticle.author?.name}</strong></div><div><span>Department</span><strong>{resolvedArticle.department?.name || resolvedArticle.department}</strong></div><div><span>Category</span><strong>{resolvedArticle.category}</strong></div><div><span>Last updated</span><strong>{resolvedArticle.updatedAt ? new Date(resolvedArticle.updatedAt).toLocaleDateString() : resolvedArticle.updated}</strong></div><div><span>Read time</span><strong>{resolvedArticle.readTime || `${Math.max(1, Math.ceil((resolvedArticle.content || '').split(/\s+/).length / 200))} min read`}</strong></div></div></article><article className="card"><div className="card-header"><h2>Related articles</h2></div><div className="card-body related-list">{related.map((item) => <Link key={item.id} to={`/knowledge-base/${item.id}`}>{item.title}<span>→</span></Link>)}</div></article></aside></section>
    </>
  );
}

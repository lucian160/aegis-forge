import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { documents as demoDocuments } from '../data/documents';
import { getDocument } from '../services/domainsApi';

export default function DocumentDetail() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDocument(documentId)
      .then((response) => {
        if (active) setDocument(response.document);
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
  }, [documentId]);

  if (loading) return <div className="auth-loading">Loading document…</div>;
  if (error) return <section className="empty-state"><div><span className="empty-state-icon">DOC</span><h3>Document unavailable</h3><p>{error}. The existing document library remains available.</p><Link to="/documents"><Button variant="primary">Back to documents</Button></Link></div></section>;

  const resolvedDocument = document || demoDocuments.find((item) => item.id === documentId);
  if (!resolvedDocument) {
    return <section className="empty-state"><div><span className="empty-state-icon">DOC</span><h3>Document not found</h3><p>The requested document may have moved or no longer exists.</p><Link to="/documents"><Button variant="primary">Back to documents</Button></Link></div></section>;
  }

  const content = document?.content ? [{ title: 'Overview', body: document.content }] : [{ title: 'Overview', body: 'Document content is not available for this record.' }];
  const related = demoDocuments.filter((item) => item.id !== documentId && item.category === resolvedDocument.category).slice(0, 4);

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Document workspace</p><h1>{resolvedDocument.title}</h1><p>{resolvedDocument.description}</p></div><Button variant="primary">Edit document</Button></header>
      <section className="detail-layout">
        <article className="card document-reader"><div className="card-header"><h2>Document</h2><span>{resolvedDocument.status}</span></div><div className="card-body article-body">{content.map((section) => <section key={section.title}><h3>{section.title}</h3><p>{section.body}</p></section>)}</div></article>
        <aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Details</h2></div><div className="card-body detail-list"><div><span>Owner</span><strong>{resolvedDocument.owner || resolvedDocument.uploadedBy?.name}</strong></div><div><span>Department</span><strong>{resolvedDocument.department?.name || resolvedDocument.department}</strong></div><div><span>Category</span><strong>{resolvedDocument.category}</strong></div><div><span>Last updated</span><strong>{resolvedDocument.updatedAt ? new Date(resolvedDocument.updatedAt).toLocaleDateString() : resolvedDocument.updated}</strong></div><div><span>Access</span><strong>{resolvedDocument.shared === false ? 'Private' : 'Shared'}</strong></div><div><span>Views</span><strong>{resolvedDocument.views || 0}</strong></div></div></article><article className="card"><div className="card-header"><h2>Related documents</h2></div><div className="card-body related-list">{related.map((item) => <Link key={item.id} to={`/documents/${item.id}`}>{item.title}<span>→</span></Link>)}</div></article></aside>
      </section>
    </>
  );
}

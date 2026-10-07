import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { getDocument, getDocuments } from '../services/domainsApi';

export default function DocumentDetail() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedError, setRelatedError] = useState('');

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
    getDocuments()
      .then((response) => {
        if (active) setRelatedDocuments(response.documents || []);
      })
      .catch((requestError) => {
        if (active) setRelatedError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [documentId]);

  if (loading) return <div className="auth-loading">Loading document…</div>;
  if (error) return <section className="empty-state"><div><span className="empty-state-icon">DOC</span><h3>Document unavailable</h3><p>{error}. The existing document library remains available.</p><Link to="/documents"><Button variant="primary">Back to documents</Button></Link></div></section>;

  const resolvedDocument = document;
  if (!resolvedDocument) {
    return <section className="empty-state"><div><span className="empty-state-icon">DOC</span><h3>Document not found</h3><p>The requested document may have moved or no longer exists.</p><Link to="/documents"><Button variant="primary">Back to documents</Button></Link></div></section>;
  }

  const content = [{ title: 'Overview', body: resolvedDocument.description || 'No description is available for this document.' }];
  const related = relatedDocuments.filter((item) => item.id !== documentId && item.category === resolvedDocument.category).slice(0, 4);

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Document workspace</p><h1>{resolvedDocument.title}</h1><p>{resolvedDocument.description}</p></div></header>
      <section className="detail-layout">
        <article className="card document-reader"><div className="card-header"><h2>Document</h2><span>{resolvedDocument.status}</span></div><div className="card-body article-body">{content.map((section) => <section key={section.title}><h3>{section.title}</h3><p>{section.body}</p></section>)}</div></article>
        <aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Details</h2></div><div className="card-body detail-list"><div><span>Owner</span><strong>{resolvedDocument.uploadedBy?.name || 'Unknown owner'}</strong></div><div><span>Department</span><strong>{resolvedDocument.department?.name || 'Unassigned'}</strong></div><div><span>Category</span><strong>{resolvedDocument.category}</strong></div><div><span>Last updated</span><strong>{resolvedDocument.updatedAt ? new Date(resolvedDocument.updatedAt).toLocaleDateString() : 'Date unavailable'}</strong></div></div></article><article className="card"><div className="card-header"><h2>Related documents</h2></div><div className="card-body related-list">{relatedError && <p className="auth-error" role="alert">Unable to load related documents: {relatedError}</p>}{related.map((item) => <Link key={item.id} to={`/documents/${item.id}`}>{item.title}<span>→</span></Link>)}{!related.length && !relatedError && <p className="empty-state-copy">No related documents are available.</p>}</div></article></aside>
      </section>
    </>
  );
}

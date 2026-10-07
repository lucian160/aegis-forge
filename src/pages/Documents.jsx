import { useEffect, useMemo, useState } from 'react';
import DocumentCard from '../components/DocumentCard';
import StatCard from '../components/StatCard';
import { getDocuments } from '../services/domainsApi';

function mapDocument(document) {
  return {
    ...document,
    owner: document.uploadedBy?.name || document.owner || 'Unknown owner',
    department: document.department?.name || document.department || 'Unassigned',
    updated: document.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : 'Date unavailable',
  };
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [category, setCategory] = useState('All documents');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDocuments()
      .then((response) => {
        if (active) setDocuments((response.documents || []).map(mapDocument));
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

  const categories = useMemo(() => {
    const names = [...new Set(documents.map((document) => document.category))];
    return [{ name: 'All documents', count: documents.length }, ...names.map((name) => ({ name, count: documents.filter((document) => document.category === name).length }))];
  }, [documents]);

  const filteredDocuments = useMemo(() => documents.filter((document) => {
    const matchesCategory = category === 'All documents' || document.category === category;
    const matchesStatus = status === 'All statuses' || document.status === status;
    const searchable = `${document.title} ${document.description} ${document.owner} ${document.department}`.toLowerCase();
    return matchesCategory && matchesStatus && searchable.includes(query.toLowerCase());
  }), [category, documents, query, status]);

  const documentStats = [
    { label: 'Total documents', value: documents.length, trend: 'Across teams' },
    { label: 'Draft', value: documents.filter((document) => document.status === 'Draft').length, trend: 'Live document status' },
    { label: 'Recently updated', value: documents.filter((document) => document.updatedAt && new Date(document.updatedAt).getTime() > Date.now() - 3 * 60 * 60 * 1000).length, trend: 'Within 3 hours' },
  ];

  return (
    <>
      <header className="page-header">
        <div><p className="eyebrow">Knowledge workspace</p><h1>Documents</h1><p>Find, organize, and share project and team documentation.</p></div>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load documents: {error}</p>}
      {loading ? <div className="auth-loading">Loading documents…</div> : (
        <>
          <section className="stat-grid" aria-label="Document summary">{documentStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

          <section className="section-grid">
        <article className="card">
          <div className="card-header"><h2>Recent documents</h2><span>Recently updated</span></div>
          <div className="card-body list-stack">
            {documents.filter((document) => document.updatedAt).slice(0, 5).map((document) => (
              <div className="list-row" key={document.id}><span className="content-icon"><span className="file-icon">DOC</span></span><div className="list-main"><strong>{document.title}</strong><span>{document.owner} · {document.updated}</span></div><span className={`status ${document.status.toLowerCase()}`}>{document.status}</span></div>
            ))}
            {documents.filter((document) => document.updatedAt).length === 0 && <p className="empty-state">No recent documents are available.</p>}
          </div>
        </article>
        <article className="card">
          <div className="card-header"><h2>Document categories</h2><span>{categories.length - 1} categories</span></div>
          <div className="card-body list-stack">
            {categories.slice(1).map((item) => (
              <div className="list-row" key={item.name}><span className="content-icon"><span className="file-icon">DOC</span></span><div className="list-main"><strong>{item.name}</strong><span>Documents in this category</span></div><span className="status">{item.count}</span></div>
            ))}
            {categories.length === 1 && <p className="empty-state">No document categories are available.</p>}
          </div>
        </article>
      </section>

      <section className="knowledge-section">
        <div className="section-heading"><h2>Document library</h2><span>{filteredDocuments.length} results</span></div>
        <div className="filter-bar">
          <label className="search-box"><span className="sr-only">Search documents</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents..." /></label>
          <select className="filter-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select>
          <select className="filter-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All statuses</option><option>Draft</option><option>Approved</option><option>Rejected</option><option>Archived</option></select>
        </div>
        <div className="content-grid">{filteredDocuments.map((document) => <DocumentCard key={document.id} document={document} />)}{filteredDocuments.length === 0 && <p className="empty-state">No documents match this view.</p>}</div>
      </section>

      <section className="section-grid">
        <article className="card"><div className="card-header"><h2>Department documents</h2><span>By team</span></div><div className="card-body department-tag-list">{[...new Set(documents.map((document) => document.department))].map((department) => <span key={department}>{department}<strong>{documents.filter((document) => document.department === department).length}</strong></span>)}{documents.length === 0 && <p className="empty-state">No department documents are available.</p>}</div></article>
        <article className="card"><div className="card-header"><h2>Document status</h2><span>Current workflow</span></div><div className="card-body status-summary">{['Draft', 'Approved', 'Rejected', 'Archived'].map((item) => <span key={item}><i className={`status-${item.toLowerCase()}`} />{item}<strong>{documents.filter((document) => document.status === item).length}</strong></span>)}</div></article>
      </section>
        </>
      )}
    </>
  );
}

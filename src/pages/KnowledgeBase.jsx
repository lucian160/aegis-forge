import { useEffect, useMemo, useState } from 'react';
import KnowledgeCard from '../components/KnowledgeCard';
import StatCard from '../components/StatCard';
import { knowledgeCategories } from '../data/knowledgeBase';
import { getKnowledgeArticles } from '../services/domainsApi';

function mapArticle(article) {
  return {
    ...article,
    owner: article.author?.name || article.owner || 'Unknown owner',
    department: article.department?.name || article.department || 'Organization',
    description: article.content?.slice(0, 180) || article.description || '',
    readTime: `${Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 200))} min read`,
    updated: article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'Recently',
    tags: article.tags || [],
  };
}

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('All knowledge');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const departments = useMemo(() => ['All departments', ...new Set(articles.map((article) => article.department))], [articles]);
  const categories = useMemo(() => ['All knowledge', ...new Set([...knowledgeCategories, ...articles.map((article) => article.category)].filter(Boolean))], [articles]);

  useEffect(() => {
    let active = true;
    getKnowledgeArticles()
      .then((response) => {
        if (active) setArticles((response.knowledgeArticles || []).map(mapArticle));
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

  const filteredArticles = useMemo(() => articles.filter((article) => {
    const matchesCategory = category === 'All knowledge' || article.category === category;
    const matchesDepartment = department === 'All departments' || article.department === department;
    const searchable = `${article.title} ${article.description} ${article.owner} ${article.tags.join(' ')}`.toLowerCase();
    return matchesCategory && matchesDepartment && searchable.includes(query.toLowerCase());
  }), [articles, category, department, query]);

  const knowledgeStats = [
    { label: 'Knowledge articles', value: articles.length, trend: 'Live API records' },
    { label: 'Published', value: articles.filter((article) => article.status === 'Published').length, trend: 'Live article status' },
    { label: 'Departments', value: departments.length - 1, trend: 'Departments with articles' },
    { label: 'Updated this week', value: articles.filter((article) => article.updatedAt && new Date(article.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length, trend: 'Recent changes' },
  ];

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Internal knowledge</p><h1>Knowledge Base</h1><p>Find team guidance, operating knowledge, and reusable documentation.</p></div></header>
      {error && <p className="auth-error" role="alert">Unable to load knowledge articles: {error}</p>}
      {loading ? <div className="auth-loading">Loading knowledge base…</div> : (
        <>
          <section className="stat-grid" aria-label="Knowledge base summary">{knowledgeStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

          <section className="knowledge-section"><div className="section-heading"><h2>Knowledge library</h2><span>{filteredArticles.length} articles</span></div><div className="filter-bar"><label className="search-box"><span className="sr-only">Search knowledge</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search knowledge..." /></label><select className="filter-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</select><select className="filter-select" value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">{departments.map((item) => <option key={item}>{item}</option>)}</select></div><div className="content-grid">{filteredArticles.map((article) => <KnowledgeCard key={article.id} article={article} />)}{filteredArticles.length === 0 && <p className="empty-state">No knowledge articles are available for this view.</p>}</div></section>

          <section className="section-grid"><article className="card"><div className="card-header"><h2>Knowledge categories</h2><span>Live article counts</span></div><div className="card-body department-tag-list">{categories.slice(1).map((item) => <span key={item}>{item}<strong>{articles.filter((article) => article.category === item).length}</strong></span>)}{articles.length === 0 && <p className="empty-state">No category data is available.</p>}</div></article><article className="card"><div className="card-header"><h2>Recently updated</h2><span>Latest API records</span></div><div className="card-body list-stack">{articles.filter((article) => article.updatedAt).slice(0, 5).map((article) => <div className="list-row" key={article.id}><span className="content-icon"><span className="file-icon">DOC</span></span><div className="list-main"><strong>{article.title}</strong><span>{article.author?.name || 'Unknown author'} · {article.updated}</span></div><span className="status">{article.status}</span></div>)}{articles.filter((article) => article.updatedAt).length === 0 && <p className="empty-state">No recently updated articles are available.</p>}</div></article></section>
        </>
      )}
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import KnowledgeCard from '../components/KnowledgeCard';
import StatCard from '../components/StatCard';
import { knowledgeArticles as demoArticles, knowledgeCategories } from '../data/knowledgeBase';
import { getKnowledgeArticles } from '../services/domainsApi';

function mapArticle(article) {
  return {
    ...article,
    owner: article.author?.name || article.owner || 'Unknown owner',
    department: article.department?.name || article.department || 'Organization',
    description: article.content?.slice(0, 180) || article.description || '',
    readTime: `${Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 200))} min read`,
    updated: article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'Recently',
  };
}

export default function KnowledgeBase() {
  const [articles, setArticles] = useState(demoArticles);
  const [category, setCategory] = useState('All knowledge');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const departments = ['All departments', ...new Set(articles.map((article) => article.department))];

  useEffect(() => {
    let active = true;
    getKnowledgeArticles()
      .then((response) => {
        if (active && response.knowledge?.length) setArticles(response.knowledge.map(mapArticle));
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
    { label: 'Knowledge articles', value: articles.length, trend: 'Published and maintained' },
    { label: 'Featured', value: articles.filter((article) => article.featured).length, trend: 'Recommended resources' },
    { label: 'Departments', value: departments.length - 1, trend: 'Across the organization' },
    { label: 'Updated this week', value: articles.filter((article) => article.updatedAt && new Date(article.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length, trend: 'Recent changes' },
  ];

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Internal knowledge</p><h1>Knowledge Base</h1><p>Find team guidance, operating knowledge, and reusable documentation.</p></div><Button variant="primary" icon="plus">New article</Button></header>
      {error && <p className="auth-error" role="alert">Unable to load knowledge articles: {error}. Showing the existing library.</p>}
      {loading ? <div className="auth-loading">Loading knowledge base…</div> : (
        <>
          <section className="stat-grid" aria-label="Knowledge base summary">{knowledgeStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

          <section className="card featured-card"><div className="card-header"><h2>Featured knowledge</h2><span>Recommended for teams</span></div><div className="card-body featured-list">{articles.filter((article) => article.featured).map((article) => <a href={`/knowledge-base/${article.id}`} key={article.id}><span className="content-icon"><span className="file-icon">DOC</span></span><div><strong>{article.title}</strong><span>{article.department} · {article.readTime}</span></div><span>→</span></a>)}</div></section>

          <section className="knowledge-section"><div className="section-heading"><h2>Knowledge library</h2><span>{filteredArticles.length} articles</span></div><div className="filter-bar"><label className="search-box"><span className="sr-only">Search knowledge</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search knowledge..." /></label><select className="filter-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{knowledgeCategories.map((item) => <option key={item.name}>{item.name}</option>)}</select><select className="filter-select" value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">{departments.map((item) => <option key={item}>{item}</option>)}</select></div><div className="content-grid">{filteredArticles.map((article) => <KnowledgeCard key={article.id} article={article} />)}</div></section>

          <section className="section-grid"><article className="card"><div className="card-header"><h2>Knowledge categories</h2><span>Organized by topic</span></div><div className="card-body department-tag-list">{knowledgeCategories.slice(1).map((item) => <span key={item.name}>{item.name}<strong>{item.count}</strong></span>)}</div></article><article className="card"><div className="card-header"><h2>Recently updated</h2><span>Latest changes</span></div><div className="card-body list-stack">{articles.slice(0, 5).map((article) => <div className="list-row" key={article.id}><span className="content-icon"><span className="file-icon">DOC</span></span><div className="list-main"><strong>{article.title}</strong><span>{article.owner} · {article.updated}</span></div><span className="status published">Updated</span></div>)}</div></article></section>
        </>
      )}
    </>
  );
}

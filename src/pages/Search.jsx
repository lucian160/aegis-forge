import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchWorkspace } from '../services/searchApi';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'members', label: 'Members' },
  { id: 'departments', label: 'Departments' },
  { id: 'projects', label: 'Projects' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'documents', label: 'Documents' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'research', label: 'R&D' },
  { id: 'recruitment', label: 'Recruitment' },
];

const typeLabels = {
  members: 'Member', departments: 'Department', projects: 'Project', tasks: 'Task',
  meetings: 'Meeting', documents: 'Document', knowledge: 'Knowledge', research: 'R&D', recruitment: 'Recruitment',
};

function normalize(value) {
  return String(value || '').trim();
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = normalize(searchParams.get('q'));
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState('');
  const [partial, setPartial] = useState(false);
  const [category, setCategory] = useState('all');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const currentRequestId = ++requestIdRef.current;
    const timeout = window.setTimeout(() => {
      const normalizedQuery = normalize(query);
      if (!normalizedQuery) {
        setLoading(false);
        setError('');
        setPartial(false);
        setResults([]);
        return;
      }

      setLoading(true);
      setError('');
      searchWorkspace(normalizedQuery)
        .then((response) => {
          if (controller.signal.aborted || currentRequestId !== requestIdRef.current) return;
          setResults(response.results);
          setPartial(response.partial);
          if (response.errors.length) setError(response.errors.slice(0, 1).join(' '));
        })
        .catch((requestError) => {
          if (!controller.signal.aborted && currentRequestId === requestIdRef.current) setError(requestError.message);
        })
        .finally(() => {
          if (!controller.signal.aborted && currentRequestId === requestIdRef.current) setLoading(false);
        });
    }, 300);

    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [query]);

  const categoriesWithResults = useMemo(() => categories.map((item) => ({ ...item, count: item.id === 'all' ? results.length : results.filter((result) => result.type === item.id).length })), [results]);
  const visibleResults = useMemo(() => results.filter((result) => {
    const categoryMatches = category === 'all' || result.type === category;
    const departmentMatches = !department || result.secondary.toLowerCase().includes(department.toLowerCase());
    const statusMatches = !status || result.status.toLowerCase() === status.toLowerCase();
    return categoryMatches && departmentMatches && statusMatches;
  }), [category, department, results, status]);

  const departments = useMemo(() => [...new Set(results.filter((result) => result.type === 'departments').map((result) => result.title))], [results]);
  const statuses = useMemo(() => [...new Set(results.filter((result) => result.status).map((result) => result.status))], [results]);

  const updateQuery = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    if (nextQuery.trim()) setSearchParams({ q: nextQuery.trim() });
    else setSearchParams({});
  };

  const submit = (event) => event.preventDefault();

  return (
    <>
      <header className="page-header search-page-header"><div><p className="eyebrow">Workspace discovery</p><h1>Global search</h1><p>Find people, projects, tasks, meetings, documents, and more.</p></div><span className="search-result-count">{visibleResults.length} results</span></header>

      <section className="card search-shell">
        <form className="search-input-large" onSubmit={submit}>
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input autoFocus value={query} onChange={updateQuery} placeholder="Search across AEGIS FORGE…" aria-label="Global search query" />
          {query && <button type="button" onClick={() => { setQuery(''); setSearchParams({}); }} aria-label="Clear search">×</button>}
          <kbd>Esc</kbd>
        </form>

        <div className="search-category-tabs" role="tablist" aria-label="Search result categories">
          {categoriesWithResults.map((item) => <button type="button" key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}>{item.label}{item.count > 0 && <span>{item.count}</span>}</button>)}
        </div>

        <div className="search-filters">
          <label>Department<select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">All departments</option>{departments.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((name) => <option key={name}>{name}</option>)}</select></label>
        </div>
      </section>

      {error && <p className="auth-error" role="alert">Search is partially unavailable: {error}</p>}
      {loading ? <section className="card search-loading"><div className="search-spinner" /><h2>Searching workspace…</h2><p>Checking authorized resources.</p></section> : !query.trim() ? (
        <section className="search-prompt card"><span className="search-prompt-icon">⌕</span><h2>Start with a name, project, task, or document</h2><p>Search is limited to resources available to your current role.</p><div className="search-prompt-suggestions"><span>Projects</span><span>Tasks</span><span>Department</span><span>Meeting</span></div></section>
      ) : visibleResults.length === 0 ? (
        <section className="card search-empty"><span>⌕</span><h2>No results found</h2><p>Try a broader term or change the selected filters.</p></section>
      ) : (
        <section className="search-results">
          {partial && <p className="search-partial">Some resources could not be checked. Available results are shown.</p>}
          {visibleResults.map((result) => (
            <article className="card search-result" key={`${result.type}-${result.id}`}>
              <div className="search-result-icon">{typeLabels[result.type][0]}</div>
              <div className="search-result-copy"><span className={`search-result-type search-result-${result.type}`}>{typeLabels[result.type]}</span><Link to={result.route}><h2>{result.title}</h2></Link><p>{result.description || 'No additional description available.'}</p><div className="search-result-meta">{result.secondary && <span>{result.secondary}</span>}{result.status && <span className={`status search-status-${result.status.toLowerCase().replaceAll(' ', '-')}`}>{result.status}</span>}</div></div>
              <Link className="search-result-link" to={result.route} aria-label={`Open ${typeLabels[result.type]} ${result.title}`}>→</Link>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

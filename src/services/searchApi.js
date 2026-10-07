import { apiClient } from './apiClient.js';

const searchEndpoints = [
  ['members', '/users', 'users'],
  ['departments', '/domains/departments', 'departments'],
  ['projects', '/domains/projects', 'projects'],
  ['tasks', '/domains/tasks', 'tasks'],
  ['meetings', '/meetings', 'meetings'],
  ['documents', '/domains/documents', 'documents'],
  ['knowledge', '/domains/knowledge', 'knowledgeArticles'],
  ['research', '/domains/researchProjects', 'researchProjects'],
  ['recruitment', '/domains/applications', 'applications'],
];

const RESULT_LIMIT = 10;

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function matchesSearch(record, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return false;
  const searchable = [
    record.name, record.candidateName, record.candidateEmail, record.position,
    record.title, record.description, record.summary, record.status,
    record.priority, record.category, record.meetingType, record.role?.title,
    record.role?.name, record.department?.name, record.project?.name,
    record.assignee?.name, record.owner?.name,
  ].filter(Boolean).join(' ').toLowerCase();
  return searchable.includes(normalizedQuery);
}

function resultFrom(record, type, route, secondary, status) {
  const title = record.name || record.candidateName || record.title || record.description || record.summary || 'Untitled';
  const description = record.description || record.summary || record.title || record.name || '';
  return {
    id: record.id,
    type,
    title,
    description: description.slice(0, 160),
    route,
    secondary,
    status,
  };
}

function mapRecords(records, type, route, metadata) {
  return records
    .filter((record) => matchesSearch(record, metadata.query))
    .slice(0, RESULT_LIMIT)
    .map((record) => resultFrom(
      record,
      type,
      route,
      metadata.secondary(record),
      record.status || '',
    ));
}

export async function searchWorkspace(query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return { results: [], partial: false, errors: [] };

  const requests = searchEndpoints.map(([type, path, responseKey]) => apiClient.request(path).then((response) => {
    const records = response[responseKey] || [];
    const definitions = {
      members: { route: '/team', secondary: (record) => record.department?.name || record.departmentId || '' },
      departments: { route: '/departments', secondary: (record) => record.code || '' },
      projects: { route: '/projects', secondary: (record) => record.department?.name || '' },
      tasks: { route: '/projects', secondary: (record) => `${record.project?.name || 'Project'} · ${record.priority || ''}` },
      meetings: { route: '/meetings', secondary: (record) => record.department?.name || '' },
      documents: { route: '/documents', secondary: (record) => record.category || record.owner?.name || '' },
      knowledge: { route: '/knowledge-base', secondary: (record) => record.department?.name || record.category || '' },
      research: { route: '/research', secondary: (record) => record.status || '' },
      recruitment: { route: '/recruitment', secondary: (record) => `${record.position || 'Position unavailable'} · ${record.status || ''}` },
    };
    const definition = definitions[type];
    return mapRecords(records, type, definition.route, { query: normalizedQuery, secondary: definition.secondary });
  }).catch((error) => ({ error })));

  const settled = await Promise.allSettled(requests);
  const results = [];
  const errors = [];
  let partial = false;

  settled.forEach((result) => {
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        partial = true;
        errors.push(result.value.error.message);
      } else {
        results.push(...result.value);
      }
    } else {
      partial = true;
      errors.push(result.reason?.message || 'Search request failed.');
    }
  });

  results.sort((first, second) => first.type.localeCompare(second.type) || first.title.localeCompare(second.title));
  return { results: results.slice(0, 100), partial, errors };
}

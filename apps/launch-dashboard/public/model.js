export const demo = [
  { title: 'Example: finish the onboarding walkthrough', owner: 'Alex', priority: 'P0', status: 'In progress', blocker: true, category: 'First experience', notes: 'Illustrative blocker. Confirm the walkthrough scope and acceptance criteria.' },
  { title: 'Example: confirm the notification experience', owner: 'Sam', priority: 'P1', status: 'Open', blocker: true, category: 'Experience', notes: 'Illustrative decision. Choose the delivery experience before implementation.' },
  { title: 'Example: assign the launch checklist', owner: 'Unassigned', priority: 'P1', status: 'Open', blocker: true, category: 'Launch readiness', notes: 'Illustrative ownership gap. Name a directly responsible owner.' },
  { title: 'Example: review the welcome screen', owner: 'Alex', priority: 'P1', status: 'In review', category: 'First experience' },
  { title: 'Example: polish empty states', owner: 'Jordan', priority: 'P2', status: 'Open', category: 'Experience' },
  { title: 'Example: check the workspace layout', owner: 'Sam', priority: 'P2', status: 'In progress', category: 'Workspace' },
  { title: 'Example: refresh help copy', owner: 'Unassigned', priority: 'P3', status: 'Open', category: 'Content' },
  { title: 'Example: verify keyboard navigation', owner: 'Jordan', priority: 'P2', status: 'Done', category: 'Experience' },
].map((row, id) => ({ notes: '', url: '', blocker: false, ...row, owners: [row.owner], id: String(id) }));

export function safeNotionUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (['notion.so', 'www.notion.so', 'app.notion.com', 'notion.site'].includes(url.hostname) || url.hostname.endsWith('.notion.site')) ? url.href : '';
  } catch { return ''; }
}

export function csvRows(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || cell === '') quoted = !quoted;
      else throw new Error('Unexpected quote in CSV. Export the view as CSV and try again.');
    } else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('The CSV has an unclosed quote.');
  row.push(cell); if (row.some(Boolean)) rows.push(row);
  return rows;
}

const value = (row, names) => names.map(name => row[name]).find(v => v !== undefined && v !== null && v !== '') ?? '';
const string = input => Array.isArray(input) ? input.join(', ') : String(input ?? '').trim();
export const isDone = row => ['done', 'complete', 'completed', 'canceled', 'cancelled', 'archived'].includes(row.status.toLowerCase());
export const highPriority = row => ['P0', 'P1', 'Urgent', 'High'].includes(row.priority);
export const priorityRank = row => ({ P0: 0, Urgent: 0, P1: 1, High: 1, P2: 2, Medium: 2, P3: 3, Low: 3 })[row.priority] ?? 4;

export function parseSnapshot(text, filename) {
  const content = text.replace(/^\uFEFF/, '');
  let raw, snapshotAt = '';
  if (filename.toLowerCase().endsWith('.json')) {
    const json = JSON.parse(content);
    raw = Array.isArray(json) ? json : json.items;
    if (json.snapshotAt) {
      if (!Number.isFinite(Date.parse(json.snapshotAt))) throw new Error('snapshotAt must be a valid timestamp.');
      snapshotAt = new Date(json.snapshotAt).toISOString();
    }
  } else {
    const [headers, ...rows] = csvRows(content);
    if (!headers) throw new Error('The file is empty.');
    if (new Set(headers.map(h => h.trim().toLowerCase())).size !== headers.length) throw new Error('CSV headers must be unique.');
    raw = rows.map(row => {
      if (row.length !== headers.length) throw new Error('A CSV row has the wrong number of columns.');
      return Object.fromEntries(headers.map((header, i) => [header, row[i]]));
    });
  }
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('No items found. Use a CSV with an Item or Name column, or JSON with an items array.');
  if (raw.length > 5000) throw new Error('Please import 5,000 items or fewer.');
  const items = raw.map((input, i) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error(`Row ${i + 1} is not an object.`);
    const row = Object.fromEntries(Object.entries(input).map(([k, v]) => [k.trim().toLowerCase(), v]));
    const title = string(value(row, ['item', 'name', 'title']));
    if (!title) throw new Error(`Row ${i + 1} is missing an Item, Name, or title.`);
    const owner = string(value(row, ['owner', 'owners', 'assignee', 'assigned', 'assigned to'])) || 'Unassigned';
    const owners = owner.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const sourcePriority = string(value(row, ['priority', 'prio']));
    const priorityMatch = sourcePriority.match(/^P[0-3]\b/i);
    const named = ['Urgent', 'High', 'Medium', 'Low'].find(p => p.toLowerCase() === sourcePriority.toLowerCase());
    const priority = priorityMatch ? priorityMatch[0].toUpperCase() : named || sourcePriority || 'Not set';
    const blocker = string(value(row, ['launch blocker', 'blocker']));
    return { id: String(i), title, owner, owners, priority,
      status: string(value(row, ['status'])) || 'Unknown',
      category: string(value(row, ['category', 'area'])) || 'Uncategorized',
      blocker: /^(true|yes|1|checked|✓)$/i.test(blocker),
      notes: string(value(row, ['notes', 'description', 'blocked on'])),
      url: safeNotionUrl(string(value(row, ['url', 'link', 'notion url', 'source']))),
    };
  });
  return { items, snapshotAt };
}

export function selectItems(items, filters) {
  return items.filter(row => {
    if (filters.owner && !row.owners.includes(filters.owner)) return false;
    if (filters.priority && row.priority !== filters.priority) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.scope !== 'all' && isDone(row)) return false;
    if (filters.scope === 'blockers' && !row.blocker) return false;
    if (filters.scope === 'high' && !highPriority(row)) return false;
    if (filters.scope === 'unassigned' && row.owner !== 'Unassigned') return false;
    return [row.title, row.owner, row.notes, row.category].join(' ').toLowerCase().includes(filters.search.toLowerCase());
  }).sort((a, b) => Number(isDone(a)) - Number(isDone(b)) || Number(b.blocker) - Number(a.blocker) || priorityRank(a) - priorityRank(b) || a.title.localeCompare(b.title));
}

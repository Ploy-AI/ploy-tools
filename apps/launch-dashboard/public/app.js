import { demo, parseSnapshot, selectItems, isDone, highPriority, priorityRank } from './model.js';

const $ = id => document.getElementById(id);
let items = demo, scope = 'remaining', board = false;
const labels = { remaining: 'Remaining work', blockers: 'Launch blockers', high: 'High priority', unassigned: 'Needs an owner', all: 'All items' };
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const pill = (text, type = '') => el('span', `pill ${type}`, text);
function setScope(next) { scope = next; render(); }
function clearFilters() { ['search', 'owner', 'priority', 'status'].forEach(id => { $(id).value = ''; }); }
function options() {
  for (const [id, values] of [['owner', items.flatMap(row => row.owners)], ['priority', items.map(row => row.priority)], ['status', items.map(row => row.status)]]) {
    const select = $(id);
    while (select.options.length > 1) select.remove(1);
    [...new Set(values)].sort().forEach(value => select.add(new Option(value, value)));
  }
}
function openItem(row) {
  const content = $('detailContent'); content.replaceChildren();
  content.append(el('p', 'eyebrow', row.category), el('h2', '', row.title));
  const badges = el('div', 'badges');
  badges.append(pill(row.priority, highPriority(row) ? 'urgent' : ''), pill(row.status));
  if (row.blocker) badges.append(pill('Launch blocker', 'urgent'));
  content.append(badges, el('h3', '', 'Owner'), el('p', '', row.owner), el('h3', '', 'Context'), el('p', 'notes', row.notes || 'No notes in this snapshot.'));
  if (row.url) {
    const link = el('a', 'source-link', 'Open original in Notion ↗');
    link.href = row.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.append(link);
  } else content.append(el('p', 'muted', 'No original link in this snapshot.'));
  $('detail').showModal();
}
function titleCell(row) {
  const wrapper = el('div', 'item-title');
  const button = el('button', 'item-link', row.title);
  button.addEventListener('click', () => openItem(row));
  wrapper.append(button, el('small', '', `${row.blocker ? 'Launch blocker · ' : ''}${row.category}`));
  return wrapper;
}
function render() {
  document.querySelectorAll('[data-scope]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scope === scope)));
  const remaining = items.filter(row => !isDone(row));
  const blockers = remaining.filter(row => row.blocker).length;
  $('navBlockers').textContent = String(blockers);
  $('metrics').replaceChildren();
  for (const [name, count, next, caption] of [
    ['Remaining', remaining.length, 'remaining', 'Open, in progress & in review'],
    ['Launch blockers', blockers, 'blockers', 'Explicitly marked in the snapshot'],
    ['High priority', remaining.filter(highPriority).length, 'high', 'Unfinished P0 / P1 / Urgent / High'],
    ['Needs an owner', remaining.filter(row => row.owner === 'Unassigned').length, 'unassigned', 'Unfinished & unassigned'],
  ]) {
    const button = el('button', `metric ${next === scope ? 'active' : ''}`);
    button.setAttribute('aria-pressed', String(next === scope));
    button.append(el('span', 'metric-label', name), el('strong', '', String(count)), el('small', '', caption));
    button.addEventListener('click', () => { clearFilters(); setScope(next); }); $('metrics').append(button);
  }
  $('viewTitle').textContent = labels[scope];
  const rows = selectItems(items, { owner: $('owner').value, priority: $('priority').value, status: $('status').value, search: $('search').value, scope });
  $('count').textContent = `${rows.length} of ${items.length} items · ${labels[scope].toLowerCase()}`;
  const results = $('results'); results.replaceChildren();
  $('listMode').setAttribute('aria-pressed', String(!board)); $('boardMode').setAttribute('aria-pressed', String(board));
  if (!rows.length) {
    const empty = el('div', 'empty');
    empty.append(el('h3', '', 'No matching items'), el('p', '', 'Try another view or reset your filters.'));
    results.append(empty); return;
  }
  if (board) {
    const grid = el('div', 'board');
    const statuses = [...new Set(rows.map(row => row.status))];
    statuses.forEach(status => {
      const column = el('section', 'board-column'); const grouped = rows.filter(row => row.status === status);
      column.append(el('h3', '', `${status} · ${grouped.length}`));
      grouped.forEach(row => {
        const card = el('article', `board-card ${row.blocker ? 'blocker-card' : ''}`);
        card.append(pill(row.priority, highPriority(row) ? 'urgent' : ''), titleCell(row), el('p', 'muted', row.owner)); column.append(card);
      }); grid.append(column);
    }); results.append(grid); return;
  }
  const wrap = el('div', 'table-wrap'); const table = el('table');
  const caption = el('caption', 'sr-only', 'Launch items sorted by completion, blockers, then priority'); table.append(caption);
  const head = el('thead'); const tr = el('tr');
  ['Work item', 'Priority', 'Status', 'Owner'].forEach(label => { const th = el('th', '', label); th.scope = 'col'; tr.append(th); }); head.append(tr); table.append(head);
  const body = el('tbody');
  rows.forEach(row => {
    const tr = el('tr', row.blocker && !isDone(row) ? 'blocker-row' : '');
    const title = el('td'); title.append(titleCell(row));
    const priority = el('td'); priority.append(pill(row.priority, highPriority(row) ? 'urgent' : ''));
    const status = el('td'); status.append(pill(row.status, isDone(row) ? 'done' : ''));
    tr.append(title, priority, status, el('td', 'owner-cell', row.owner)); body.append(tr);
  }); table.append(body); wrap.append(table); results.append(wrap);
}
document.querySelectorAll('#views button').forEach(button => button.addEventListener('click', () => setScope(button.dataset.scope)));
['search', 'owner', 'priority', 'status'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
$('clear').addEventListener('click', () => { clearFilters(); render(); });
$('listMode').addEventListener('click', () => { board = false; render(); });
$('boardMode').addEventListener('click', () => { board = true; render(); });
$('about').addEventListener('click', () => $('help').showModal());
document.querySelectorAll('.dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$('import').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  $('error').hidden = true;
  try {
    if (file.size > 2 * 1024 * 1024) throw new Error('Choose a CSV or JSON file smaller than 2 MB.');
    if (!/\.(csv|json)$/i.test(file.name)) throw new Error('Choose a CSV or JSON file.');
    const snapshot = parseSnapshot(await file.text(), file.name);
    items = snapshot.items; clearFilters(); scope = 'remaining'; options(); render();
    $('mode').textContent = 'Your local snapshot · visible in this tab only';
    $('provenance').textContent = 'Imported rows stay in browser memory. No upload, live sync, or Notion writes. Reload or clear local data to discard.';
    const format = time => new Date(time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZoneName: undefined });
    $('timestamp').textContent = `Source snapshot: ${snapshot.snapshotAt ? format(snapshot.snapshotAt) : 'unknown (not supplied by CSV)'} · Imported: ${format(new Date())} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
    $('footerMode').textContent = 'Local snapshot · totals cover imported rows only'; $('resetDemo').hidden = false;
  } catch (error) { $('error').textContent = `Import failed: ${error.message}`; $('error').hidden = false; }
  event.target.value = '';
});
$('resetDemo').addEventListener('click', () => window.location.reload());
options(); render();

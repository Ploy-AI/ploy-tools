import test from 'node:test';
import assert from 'node:assert/strict';
import { csvRows, parseSnapshot, safeNotionUrl, selectItems, demo, isDone } from './public/model.js';

const filters = { scope: 'remaining', owner: '', priority: '', status: '', search: '' };
test('remaining and blocker views exclude completed records, while all preserves them', () => {
  assert.equal(selectItems(demo, filters).length, 7);
  assert.equal(selectItems(demo, { ...filters, scope: 'blockers' }).length, 3);
  assert.equal(selectItems(demo, { ...filters, scope: 'all' }).length, 8);
  assert.equal(isDone({ status: 'Canceled' }), true);
});
test('combined filters match individual co-owners and search context', () => {
  const { items } = parseSnapshot('Item,Owner,Priority,Status,Notes\r\nOne,"Alex, Sam",P1,Open,"Needs scope"', 'x.csv');
  assert.equal(selectItems(items, { ...filters, owner: 'Sam', priority: 'P1', search: 'scope' }).length, 1);
  assert.equal(selectItems(items, { ...filters, owner: 'Jordan' }).length, 0);
});
test('CSV preserves escaped quotes, quoted newlines and Unicode BOM', () => {
  assert.deepEqual(csvRows('a,b\r\n"a, b","c""d\ne"'), [['a', 'b'], ['a, b', 'c"d\ne']]);
  const { items } = parseSnapshot('\uFEFFItem,Launch blocker\nExample,Yes', 'x.csv');
  assert.equal(items[0].blocker, true);
});
test('malformed CSV, duplicate headers, missing titles and invalid dates are rejected', () => {
  for (const text of ['Item,Status\na', 'Item,Item\na,b', 'Item\n"bad']) assert.throws(() => parseSnapshot(text, 'x.csv'));
  assert.throws(() => parseSnapshot('[{"title":""}]', 'x.json'));
  assert.throws(() => parseSnapshot('{"snapshotAt":"nonsense","items":[{"title":"One"}]}', 'x.json'));
});
test('unrecognized priorities survive without being promoted to high priority or blockers', () => {
  const { items } = parseSnapshot('[{"title":"One","priority":"Custom","status":"Design QA"}]', 'x.json');
  assert.equal(items[0].priority, 'Custom');
  assert.equal(selectItems(items, { ...filters, scope: 'high' }).length, 0);
  assert.equal(selectItems(items, { ...filters, scope: 'blockers' }).length, 0);
});
test('only HTTPS Notion links without credentials can be opened', () => {
  for (const url of ['javascript:alert(1)', 'https://notion.so.evil.test/a', 'http://notion.so/a', 'https://a:b@notion.so/a', 'https://example.com']) assert.equal(safeNotionUrl(url), '');
  assert.equal(safeNotionUrl('https://app.notion.com/p/example'), 'https://app.notion.com/p/example');
});
test('unfinished blockers sort before more urgent non-blockers; completion sorts last', () => {
  const { items } = parseSnapshot(JSON.stringify([{ title: 'Urgent', priority: 'P0' }, { title: 'Blocker', priority: 'P2', blocker: true }, { title: 'Done blocker', blocker: true, status: 'Done' }]), 'x.json');
  assert.deepEqual(selectItems(items, { ...filters, scope: 'all' }).map(r => r.title), ['Blocker', 'Urgent', 'Done blocker']);
});

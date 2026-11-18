# Launch room

Standalone read-only Devin App. Not part of the Ploy product or its release pipeline.
Requires Node 22 or newer; no dependencies, install step, build step, or credentials.

```sh
cd apps/launch-dashboard
npm start # PORT defaults to 3080
npm test
```

Deploy only through the official Devin App mechanism, never public hosting. The
server exposes an explicit allowlist of static assets and rejects all writes.
No analytics, network data fetching, service worker, browser persistence, or API.
The manifest supports adding it to a phone home screen; it does not work offline.

## Privacy and data

The default dataset is fictional, including owners and counts. Source visibility
could not be established for all Devin org members, so no actual Notion records,
private URLs, or source counts are bundled. Do not replace the demo with real data
without verifying every App viewer's source access or implementing appropriate
per-viewer authorization. The Devin org gate is not a Notion authorization check.

Each viewer can import their own authorized Notion CSV or JSON export. Data stays
in that tab's memory and is cleared by reload. Imports are never uploaded; CSP
blocks outgoing connections. Other viewers continue to see the safe preview.
Screenshots, screen sharing, or browser extensions can still expose viewed data.
Original links open Notion and remain subject to Notion's own access controls.

CSV requires Item/Name/title. Optional columns: Owner/Assigned to, Priority,
Status, Launch blocker, Category, Notes, URL. JSON supports the same fields,
case-insensitively, as an array or `{ "snapshotAt": "ISO timestamp", "items": [] }`.
Source time is unknown for CSV; import time is labeled separately. Source URLs
must be HTTPS Notion URLs. No links are fabricated when an export lacks them.
Exported views may include rows beyond visible filters: review the export.

Only explicit Launch blocker values (true, yes, 1, checked, ✓) set blockers.
P0/P1/Urgent/High mean high priority, not necessarily blockers. Completed and
canceled items are excluded from remaining-work metrics. Unknown statuses and
priorities stay visible, never silently treated as completed or high priority.
Metrics cover the entire imported set; the result count covers active filters.
The App makes no independent launch-readiness or deployment claims.

## Visual basis

Workbench layout using Ploy's fog, carbon, and sun palette, based on the official
`ploy-brand-scales.css` and `ploy-tokens.css` in the Ploy design system. System
sans fallback is used when Geist/Inter is not installed. The drawn launch icon
is an App icon, not a substitute for the Ploy logo.

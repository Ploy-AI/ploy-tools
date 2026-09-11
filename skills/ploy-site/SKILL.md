---
name: ploy-site
description: Build or migrate a website from an existing GitHub or local codebase into Ploy's Astro starter, then sync local edits with Ploy using the Ploy CLI. Use for whole-site or selected-page migration, continued editing of a Ploy checkout, or publishing when requested.
---

# Build and migrate with Ploy

Work as the local coding agent. Use the Ploy CLI for account/site operations
and Git for source changes. Ploy hosts the destination as Astro on Cloudflare
Workers; connecting a generic repository does not make it compatible.

Read [the migration guide](references/migration.md) before setup, importing,
porting code, or syncing. It owns the command sequence and runtime constraints.
All paths in that guide describe the source or destination checkout, not this
installed skill directory.

1. Inspect the source and destination state. For an existing bound Ploy
   checkout, reuse it and follow the guide's edit/verify/sync workflow.
2. For a migration, assess compatibility and show the routes, behavior, and
   backend replacements involved. Offer whole-site or selected-page migration
   unless the user already chose. Resolve blockers that change scope before
   porting. Preserve the source checkout.
3. Use direct import only for an already Ploy-compatible committed tree.
   Otherwise create one destination, clone its starter, and port the agreed
   scope. For a new build, use the same destination workflow without a source
   port. Follow the destination's `AGENTS.md`.
4. Verify its build and scoped behavior, push reviewed changes, then verify
   the commit in Ploy and inspect the restarted preview. Report failed or
   unavailable checks as incomplete. Sync success alone is not preview health.
5. Continue local development in that destination. Publish only when requested,
   following the guide's site-selection check and publish verification.

Finish with the site/preview URL, source and verified commit IDs where applicable,
build and browser evidence, and remaining behavior gaps. Keep the original
GitHub repo's role explicit: a migration source, not automatic cross-framework
synchronization.

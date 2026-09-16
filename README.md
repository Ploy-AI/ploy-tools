# Ploy tools

Public home for Ploy user tools.

## Ploy CLI release assets

Immutable release assets for the Ploy CLI are published under
[Releases](https://github.com/Ploy-AI/ploy-tools/releases).

## Agent skills

Agent skills for [Ploy](https://ploy.ai). Install them into any repository and
run them with your own Codex, Claude, or Cursor subscription; no Ploy account is needed
to install, and the skills tell the agent when a Ploy login is required.

| Skill | Purpose |
| --- | --- |
| [`ploy-site`](skills/ploy-site/SKILL.md) | Build or migrate a website into Ploy, sync local edits, or copy a Ploy site and its dependencies between workspaces. |

### Install

**Ploy CLI** (required to run the skill’s site operations)

```sh
curl -fsSL https://ploy.ai/install.sh | sh
```

Install the public skill separately with one of the methods below.

**skills.sh**

```sh
npx skills add Ploy-AI/ploy-tools
```

**Claude Code plugin**

```text
/plugin marketplace add Ploy-AI/ploy-tools
/plugin install ploy@ploy
```

**Codex plugin**

```sh
codex plugin marketplace add Ploy-AI/ploy-tools
```

Then install `ploy` from the `ploy` marketplace in `/plugins`. Codex also
installs the bare skill with `$skill-installer` from
`https://github.com/Ploy-AI/ploy-tools/tree/main/skills/ploy-site`.

**Cursor**

This repository is an [Agent Plugins](https://agent-plugins.org) package
(`plugin.json` at the root), so it loads in Cursor unchanged: add it to a team
marketplace with "Import from Repo", or clone it into `~/.cursor/plugins/local`.
`npx skills add` above also writes `.cursor/skills/`.

**Manual**

```sh
mkdir -p .agents/skills .claude/skills
git clone --depth 1 https://github.com/Ploy-AI/ploy-tools.git /tmp/ploy-tools
cp -R /tmp/ploy-tools/skills/ploy-site .agents/skills/ploy-site
cp -R /tmp/ploy-tools/skills/ploy-site .claude/skills/ploy-site
rm -rf /tmp/ploy-tools
```

Each skill is a self-contained folder: `SKILL.md` plus a `references/`
directory. Codex reads `.agents/skills/`, Claude Code reads `.claude/skills/`,
Cursor reads `.cursor/skills/`.

### Workflow with the Ploy CLI

Install the CLI with the command above, then install this public skill with
`npx skills add Ploy-AI/ploy-tools` or one of the plugin methods. Open your
coding agent and ask it to use `ploy-site`. The skill tells you when to run
`ploy login`; workspace transfers require CLI 0.12.0 or newer.

CLI 0.12.0's `ploy skills init` and `ploy skills sync` manage the authenticated
Ploy site skill bundle, including user-wide directories with `--user`. They do
not install this repository's public skill, and `skills bootstrap` is not a
command in that release. Use the public skill's installer to update it.

### Use

Ask the agent to migrate the site, for example:

> Use the ploy-site skill to migrate this site into Ploy.

The agent inspects the source, offers a whole-site or selected-page migration,
builds into a Ploy Astro destination, verifies it, and pushes with the
[Ploy CLI](https://ploy.ai/docs/cli). Publishing only happens when you ask.

To copy a site between Ploy workspaces:

> Use the ploy-site skill to copy my site into another workspace. Verify the
> destination and let me review it before moving traffic or deleting the source.

The [workspace transfer procedure](skills/ploy-site/references/workspace-transfer.md)
covers source code, databases, assets, environment, forms and documents, then
separately handles domain cutover and approved cleanup. These operations require
both workspaces in the same organization and admin/owner access.

### Layout

- `skills/<id>/` - one folder per skill, the format read by Codex, Claude Code,
  and skills.sh
- `manifest.json` - explicit file list per skill for bundle consumers
- `.claude-plugin/` - Claude Code plugin and marketplace metadata; Codex reads
  the same `marketplace.json`
- `plugin.json` - Agent Plugins manifest read by Cursor and other
  standard-conformant clients

Add a skill by creating `skills/<id>/SKILL.md` with `name` and `description`
frontmatter and listing every file in `manifest.json`. Editing a published
file publishes an update on `main`; use `npx skills update ploy-site` to update
the installed public skill.

### License

Skills are [MIT](LICENSE) licensed.

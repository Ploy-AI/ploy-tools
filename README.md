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
| [`ploy-site`](skills/ploy-site/SKILL.md) | Build or migrate an existing GitHub or local website into Ploy's Astro runtime, then sync local edits with the Ploy CLI. |

### Install

Run one of these in the repository you want the agent to work on.

**Ploy CLI**

```sh
curl -fsSL https://ploy.ai/install.sh | sh
ploy skills bootstrap
```

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

### Use

Ask the agent to migrate the site, for example:

> Use the ploy-site skill to migrate this site into Ploy.

The agent inspects the source, offers a whole-site or selected-page migration,
builds into a Ploy Astro destination, verifies it, and pushes with the
[Ploy CLI](https://ploy.ai/docs/cli). Publishing only happens when you ask.

### Layout

- `skills/<id>/` - one folder per skill, the format read by Codex, Claude Code,
  and skills.sh
- `manifest.json` - file list per skill, read by `ploy skills bootstrap`
- `.claude-plugin/` - Claude Code plugin and marketplace metadata; Codex reads
  the same `marketplace.json`
- `plugin.json` - Agent Plugins manifest read by Cursor and other
  standard-conformant clients

Add a skill by creating `skills/<id>/SKILL.md` with `name` and `description`
frontmatter and listing every file in `manifest.json`.

### License

Skills are [MIT](LICENSE) licensed.

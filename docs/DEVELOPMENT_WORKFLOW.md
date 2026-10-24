# Development workflow

## Three workstreams

| Workstream | Ownership and responsibilities |
| --- | --- |
| Research Codex | The independent research repository: graph construction, terminology normalization, evidence integrity, convergence and validation, scientific documentation, and future approved public exports. |
| Website Codex | Frontend architecture and integration: repository architecture, data contracts and loading, routing, graph visualization integration, tests, GitHub deployment, and performance. |
| Claude Design | Bounded visual tasks after design references and file scope are supplied: visual identity, typography and layout, navigation, homepage tetrahedron design, animation and interaction design, and responsive and accessible components. |

Website work must never move, delete, edit, or commit research-repository files,
or alter its remote. The website cannot depend on that checkout. Public exports
cross the boundary only through the approval procedure in
[WEB_DATA_CONTRACT.md](WEB_DATA_CONTRACT.md).

## Before changing the website

Read [AGENTS.md](../AGENTS.md) and inspect the checkout:

```sh
pwd
git rev-parse --show-toplevel
git status --short --branch
git remote -v
```

The main checkout is `/home/min/Programming/MatDREAMS`; a task worktree must
belong to that repository. The website origin must be
`git@github.com:min-nium/MatDREAMS.git`. Preserve existing work and stop
to investigate unexpected changes or a different remote. Do not change global
Git settings, reset or clean the checkout, rewrite history, or force push.

## Parallel website work

No extra worktrees are created during initialization. Before future simultaneous
Website Codex and Claude Design work:

1. Review and commit an agreed baseline. A repository with no commits cannot
   supply the baseline for these worktrees. Creating that first commit requires
   a separate authorized Git action.
2. Agree on the task, acceptance criteria, integrator, branch names, and exact
   file ownership. Design references must be available before design begins.
3. Use a separate branch and worktree for each agent. Website Codex uses
   `codex/<task>`; Claude Design uses `claude/<task>`.
4. Give shared files to one owner at a time. The integrator coordinates changes
   to routing, shared tokens, `package.json`, `package-lock.json`, configuration,
   and contracts. Never edit the same files concurrently.

For example, after an agreed baseline exists and parallel work is requested:

```sh
git worktree add -b codex/graph-integration ../MatDREAMS-codex-graph HEAD
git worktree add -b claude/home-design ../MatDREAMS-claude-home HEAD
```

These create sibling checkouts from the current agreed commit. Run `npm ci`
inside each checkout. Do not use either branch name if it already belongs to
other work; inspect existing branches and worktrees first. Keep tasks and their
file scopes written in the handoff. Worktrees isolate files, but they do not
resolve overlapping ownership or make concurrent shared-file edits safe.

## Integration procedure

1. Each contributor reviews their diff and untracked files, verifies that no
   private inputs or research files are included, and runs `npm run check`.
   UI work also needs keyboard, narrow-screen, contrast, focus, landmark, and
   reduced-motion checks. Include results and limitations in the handoff.
2. The integrator reviews one branch at a time against its agreed scope and
   scientific-data boundary. Resolve shared-file changes serially with the
   responsible contributor.
3. With a clean integration checkout and authorized commits, merge the reviewed
   branch. Resolve conflicts deliberately; do not overwrite unrelated work.
   Install from the resulting lockfile when needed and run `npm run check`.
4. Repeat for the next branch, then review the combined behavior, public files,
   dependency changes, and documentation. Update the handoff for the next task.

Do not push or deploy without an explicit request. GitHub deployment belongs to
Website Codex, but initialization does not publish the site or configure a
deployment action. Do not delete branches or remove worktrees containing needed
work; review their status before any later cleanup.

## Completion handoff

Report changed files, behavior, commands and check results, Git status, known
limitations, and the next bounded task. A scaffold can support design work once
the supplied references and specific file scope are agreed; placeholder pages
do not approve scientific data or settle the final design.

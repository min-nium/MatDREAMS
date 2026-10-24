# MatDREAMS development instructions

## Purpose and ownership

MatDREAMS is a professional, interactive materials-science research website. This
repository owns the frontend, routing, interactions, visualization integration,
tests, documentation, and explicitly approved public graph exports. Initial work
is an application scaffold; design references and scientific releases arrive
separately. Do not invent scientific content or implement unrequested features.

The independent research repository is `/home/min/Research/5_LLMforCCAs`.
Research Codex owns its pipeline, terminology normalization, evidence integrity,
validation, convergence analysis, scientific documentation, and future exports.
Website work must never move, delete, edit, or commit files there, or alter its
remote. Do not add it as a submodule, symlink, workspace dependency, or build input.

## Scientific data integrity

- Do not copy research JSON, PDFs, caches, quotations, provenance records, local
  paths, or full graph exports into this repository or its build output.
- `public/data/` is reserved for separately reviewed public exports. Empty is
  intentional. A release name or audit count is metadata, not publication approval.
- Follow `docs/WEB_DATA_CONTRACT.md`. The frontend contract is provisional and
  must not force changes to the research pipeline.
- Preserve upstream IDs, labels, relation direction, units, uncertainty, and
  evidence status. Never silently merge or normalize concepts or infer relations.
- Validate public data before use. Fail visibly on unsupported contracts,
  mismatched release identity or SHA, malformed references, or absent approval.
- Publication approval and scientific verification are separate. Public data can
  remain uncertain; do not display unreviewed evidence as verified fact.
- Synthetic fixtures belong in `tests/fixtures/`, must say they are synthetic,
  and must never be presented as research results.

## Code conventions and architecture

- Use React, TypeScript with strict checking, Vite, npm, and ES modules.
- Use functional components, PascalCase component files, named exports, and
  explicit types at data boundaries. Keep dependencies minimal and compatible.
- Keep application/routing in `src/app/`, shared UI in `src/components/ui/`,
  pages in `src/pages/`, graph UI in `src/components/graph/`, loading/validation in
  `src/data/`, graph types in `src/types/`, and tokens/styles in `src/styles/`.
- Keep bundled static assets in `src/assets/`; files in `public/` are public and
  copied verbatim. Do not put secrets or private inputs in either location.
- Use Vite's base URL for public assets. Preserve the `/MatDREAMS/` base and hash
  routing so direct links work on GitHub Pages without a server rewrite.
- There is no backend. Do not add graph engines, animation libraries, or a final
  design system before their requirements are agreed.

## Parallel work

- Website Codex owns architecture, contracts/loading, routing, graph integration,
  tests, deployment configuration, performance, and integration review.
- Claude Design owns bounded visual identity, typography, layout, navigation,
  homepage tetrahedron, animation, and responsive/accessibility tasks after the
  design references and a specific file scope are supplied.
- Research Codex works only in the independent research repository. Public
  exports cross the boundary only through the documented approval procedure.
- When Website Codex and Claude both edit this repository, use separate
  `codex/<task>` and `claude/<task>` branches and separate Git worktrees. Agree on
  ownership of files first; never edit the same files concurrently.
- One integrator reviews changes, reconciles shared files serially, runs checks,
  and merges one branch at a time. See `docs/DEVELOPMENT_WORKFLOW.md`.
- Do not create extra worktrees until parallel development is actually requested.

## Tests and documentation

- Run `npm run check` for changed code: lint, type checking, tests, and build.
- Test meaningful behavior: route resolution, data rejection, identity checks,
  and failure states. Keep fixtures small and explicitly synthetic.
- For UI changes, check keyboard navigation, narrow screens, readable contrast,
  semantic landmarks, accessible names, focus visibility, and reduced motion.
- Update the relevant concise English documentation when commands, architecture,
  contracts, or collaboration responsibilities change.

## Git and delivery safety

- Confirm the Git root, current status, and remote before changes. The website
  remote is `git@github.com:min-nium/MatDREAMS.git`.
- Preserve existing and unrelated work. Do not reset, clean, force push, rewrite
  history, change global Git settings, or alter remotes without explicit direction.
- Keep dependencies, build artifacts, credentials, and private inputs ignored.
  `.gitignore` is an accident guard, not a substitute for publication review.
- Review the diff and untracked files before staging. Never commit secrets or
  private research material. Do not push or deploy unless explicitly requested.

## Accessibility and performance

- Use semantic HTML, labeled controls, keyboard access, a skip link, visible focus,
  and useful loading/error/empty states. Do not rely on color alone.
- Respect `prefers-reduced-motion`; future rotation must have pause controls.
- Keep the scaffold lightweight. Future graph code/data must load on demand;
  measure bundle size and interaction cost before adding heavy dependencies.
- Future graph views need a readable alternative to visual-only exploration.

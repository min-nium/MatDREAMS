# Architecture

MatDREAMS is a static React application using strict TypeScript, Vite, npm, and
ES modules. The initial scaffold establishes routes and a public-data boundary.
The approved homepage remains unchanged. Explicit local research mode now adapts
the existing scientific application into the seven scientific/support pages.

## Local faculty demonstration boundary

`npm run dev:research` starts one Vite process on `127.0.0.1:5177`. The
development-only plugin in `tools/local-research.ts` serves an exact-resource
allowlist beneath `/__matdreams_local__/`. It verifies the frozen production v4
graph SHA, built client SHA, manifests, release identity, record counts, and
references before accepting the existing derivative. Source documents have
their current source SHA; frozen analysis and figures are manifest checked.

The adapter reuses the existing `core.js` and `learning.js` as byte-verified
presentation code, without an iframe or scientific regeneration. Full concept,
role-node and family indexes load once; graph rendering is bounded and separate
from indexed coverage. Selected-family evidence loads on demand. A shared
research context avoids multiple data loads and withholds RHEA when Ni is selected.

`src/types/research.ts` describes this local legacy presentation boundary. It is
separate from the unchanged public v0.1 contract, types and approval checks.
`src/data/researchClient.ts` rejects requests outside explicit development mode.
Production and ordinary development never serve the private adapter. The server
restricts Host, Origin, fetch-site, socket address, resource keys and filesystem
access; it does not accept arbitrary paths, execute manual commands, or write
research files. No new production backend or dependencies were introduced.

See `LEGACY_FEATURE_INVENTORY.md` for exact source reuse and
`MATDREAMS_FACULTY_DEMO_20261026.md` for operating instructions and validation.

## Structure and ownership

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` | Browser entry point and application mounting. |
| `src/app/` | Application shell, navigation, and route resolution. |
| `src/components/ui/` | Shared semantic, accessible UI. |
| `src/components/graph/` | Future graph presentation and interaction components. |
| `src/pages/` | Home, Materials, Definition, Relations, Engineering, Analysis, Manual, Supports, and not-found pages. |
| `src/data/` | Public-data loading and validation boundary. |
| `src/types/` | Explicit graph and release types at data boundaries. |
| `src/styles/` | Shared tokens and application styles. |
| `src/assets/` | Assets imported and processed by the build. |
| `public/assets/` | Public static assets copied verbatim by Vite. |
| `public/data/` | Separately reviewed, explicitly approved public exports; initially empty. |
| `tests/` | Behavior tests; small synthetic inputs belong in `tests/fixtures/`. |
| `docs/` | Architecture, collaboration, and provisional data contract. |

Use functional components, PascalCase component files, and named exports. Keep
scientific data validation separate from rendering. Add dependencies only when
an agreed requirement justifies them.

## Routing and hosting

Vite's base path is `/MatDREAMS/`, matching the intended GitHub Pages project
site. Hash routing keeps direct links usable without server rewrites, such as
`/MatDREAMS/#/relations`. Unsupported routes show a useful not-found state.
Reference public assets through Vite's base URL rather than assuming the site
is hosted at `/`.

The shell preserves all eight routes and the approved homepage design. The seven
other sections provide the local scientific demonstration; public mode shows
explicit unavailable states for private data. RHEA is available locally. Ni
Superalloy has no validated integrated dataset or manual and never receives RHEA
records under its label.

## Scientific-data boundary

Research Codex owns graph construction, terminology normalization, evidence,
validation, convergence analysis, scientific documentation, and export
preparation in the independent research repository. It is not a submodule,
workspace dependency, symlink, or build input of this application.

Only a separately approved public export may enter `public/data/`. See
[WEB_DATA_CONTRACT.md](WEB_DATA_CONTRACT.md) for the provisional schema,
release identity and source-graph SHA checks, and approval/transfer procedure.
Frontend assumptions must not require changes to the research pipeline.

Preserve upstream identifiers, labels, relation direction, units, uncertainty,
and evidence status. The frontend must reject unsupported or inconsistent
data visibly, and must never silently normalize concepts or infer scientific
relationships. Publication approval and scientific verification are separate.
Synthetic test inputs are not research results.

## Interaction, accessibility, and performance

Use semantic landmarks, a skip link, labeled controls, visible keyboard focus,
and clear loading, error, and empty states. Verify narrow layouts, readable
contrast, keyboard navigation, and reduced-motion behavior when UI changes.
Future rotating views need pause controls, and graph exploration needs a
readable alternative to the visual view.

Keep the initial bundle lightweight. Future graph code and data should load on
demand; measure bundle size and interaction cost before selecting a graph engine
or animation library. No backend, graph engine, or animation dependency is
required for this scaffold.

## Verification

`npm run check` runs ESLint, strict TypeScript checks, Vitest, and the Vite
production build. Tests should cover meaningful behavior such as route
resolution, data rejection, release identity checks, and failure states. Keep
synthetic fixtures small and explicitly labeled. Build output is disposable and
must remain ignored.

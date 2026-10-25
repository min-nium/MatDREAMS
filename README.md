# MatDREAMS

MatDREAMS is a materials-science research website. This repository contains the
frontend scaffold, routing, shared UI, data-validation boundary, tests, and
documentation. The scientific research pipeline remains in the independent
`5_LLMforCCAs` repository.

The approved homepage is preserved. An explicit loopback-only research mode
provides Materials, Definition, Relations, Engineering, Analysis, Manual, and
Supports for the 26 October 2026 faculty demonstration. RHEA uses the existing
frozen production v4 research graph; Ni Superalloy is pending integration.
No research dataset is approved for public redistribution.

## Local faculty demonstration

```sh
npm ci
npm run dev:research
```

Open [http://127.0.0.1:5177/MatDREAMS/](http://127.0.0.1:5177/MatDREAMS/).
Stop with Ctrl+C. This single Vite process reads existing, checksum-pinned local
research artifacts without modifying them. It requires the existing authorized
research checkout and cached artifacts on this workstation. No scientific
pipeline or extraction is run. Optional port: `MATDREAMS_DEMO_PORT=5178 npm run
dev:research`. The adapter always binds to loopback.

Private records and original evidence are fetched only in this explicit mode.
They are never copied into frontend assets or production output. `npm run dev`
and `npm run preview` disable research access; `npm run build`, including a build
using `--mode local-research`, excludes the private adapter. Public export
validation remains unchanged. See the [meeting guide](docs/MATDREAMS_FACULTY_DEMO_20261026.md)
and [legacy reuse inventory](docs/LEGACY_FEATURE_INVENTORY.md).

## Requirements

- Node.js 24; `.nvmrc` pins the development version to `24.16.0`.
- npm 11.

The application uses React, strict TypeScript, Vite, ESLint, and Vitest with ES
modules. There is no backend.

## Local development

From the repository root:

```sh
nvm use
npm ci
npm run dev
```

`nvm use` is optional if the matching Node.js version is already active. The
initial dependency setup uses `npm install`; subsequent installs should use
`npm ci` to reproduce `package-lock.json`.

Open [http://localhost:5173/MatDREAMS/](http://localhost:5173/MatDREAMS/).
Vite uses another port if that port is occupied. Routes use the URL hash, for
example `http://localhost:5173/MatDREAMS/#/materials`.

## Checks and production build

```sh
npm run check
```

This runs linting, TypeScript checking, tests, and the production build. Individual
commands are available as `npm run lint`, `npm run typecheck`, `npm test`, and
`npm run build`.

```sh
npm run build
npm run preview
```

The production output is `dist/`. Preview serves that output locally; use the
address printed by Vite with the `/MatDREAMS/` base path. Building or previewing
does not deploy the website. GitHub Pages is the intended initial hosting target;
deployment configuration and publication are future work.

## Repository guide

- [Architecture](docs/ARCHITECTURE.md): source structure and responsibilities.
- [Web data contract](docs/WEB_DATA_CONTRACT.md): provisional public-data format,
  validation, and approval procedure.
- [Development workflow](docs/DEVELOPMENT_WORKFLOW.md): Research Codex, Website
  Codex, Claude Design, and integration rules.
- [Project instructions](AGENTS.md): development and Git safety requirements.

`public/data/` is intentionally empty. Existing research release metadata does
not grant permission to publish research files. Never copy research JSON, PDFs,
caches, quotations, provenance records, or full graph exports into this
repository or its build output. Test fixtures must be explicitly synthetic and
remain separate from public research data.

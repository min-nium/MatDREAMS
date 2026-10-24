# MatDREAMS

MatDREAMS is a materials-science research website. This repository contains the
frontend scaffold, routing, shared UI, data-validation boundary, tests, and
documentation. The scientific research pipeline remains in the independent
`5_LLMforCCAs` repository.

The initial application provides clearly labeled placeholders for Home,
Materials, Definition, Relations, Engineering, Analysis, Manual, and Supports.
RHEA and Ni Superalloy are the planned initial systems. Scientific content,
public graph exports, the homepage tetrahedron, and final visual design are
pending separate review and implementation.

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

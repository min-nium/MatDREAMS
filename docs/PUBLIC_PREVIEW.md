# Public presentation preview

The public website is an explanatory preview at the intended project-site URL:
`https://min-nium.github.io/MatDREAMS/`. Availability must be checked after an
actual deployment; a successful build alone does not establish a live website.

## Published scope

The approved conceptual homepage and all eight hash routes are preserved.
Materials, Definition, Relations, Engineering, Analysis and Manual explain the
research problem, construction workflow, terminology review, evidence navigation,
scenario limits and the distinction between technical and scientific validation.
Supports provides project and reporting guidance. The six scientific sections
explicitly identify the public preview and unavailable scientific data/tools.

Only authored explanatory copy and the existing approved interface assets are
included. No research statistics, record identities, graph exports, quotations,
paper records, private documents or analysis figures are approved by this task.
Those items are withheld pending a separate owner publication decision.
Software verification does not supply publication approval or scientific review.

## Production and local separation

Every Vite production build substitutes explanatory pages and a provider with
no research connection. The private module tree is excluded, rather than merely
hidden in the interface. A build guard rejects imports that bypass this boundary.
This also applies to a production build explicitly given the local mode name.
The production artifact has no private research API or server component.

The existing `npm run dev:research` command and private scientific pages remain
separate. This preview does not publish or tunnel that service. Ordinary Vite
development keeps research access disabled unless the explicit local mode is used.

## Checks and deployment

```sh
npm ci
npm run check
npm run audit:public
```

The audit inspects every production file. It permits only the built HTML,
JavaScript, CSS and byte-matched bundled fonts, with empty keep files. It rejects
data/documents/images, source maps, links, private paths/endpoints, research
identities and credential/evidence patterns. Human review of the explanatory
copy remains necessary; the scanner is not a general publication sanitizer.

`.github/workflows/pages.yml` runs the checks and audit on `main`, uploads only
`dist`, then deploys through GitHub Pages. It never uploads the repository root,
private server, tests, documentation, research checkout or local build caches.
Hash URLs such as `/MatDREAMS/#/relations` preserve direct links and reloads
without server rewrites. Vite retains the `/MatDREAMS/` asset base.

If Pages is not enabled, an owner must open the repository's **Settings → Pages**
and select **Build and deployment → Source → GitHub Actions**. Then run
**Actions → Deploy public MatDREAMS preview → Run workflow → main** if the
initial run failed before Pages was enabled. Do not switch to publishing the
repository root or `docs` folder. No custom domain is required.

Before calling the preview live, open its public URL in a browser, verify the
homepage and all section links, directly load/reload a hash route, and confirm
that private data remains unavailable. If availability is not verified, use
`https://github.com/min-nium/MatDREAMS` as the explicitly labeled repository
fallback in presentation materials.

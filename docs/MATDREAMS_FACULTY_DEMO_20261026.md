# MatDREAMS faculty demonstration — 26 October 2026

## Start and stop

Run in the website checkout:

```sh
cd /home/min/Programming/MatDREAMS
nvm use
npm ci
npm run dev:research
```

Open **http://127.0.0.1:5177/MatDREAMS/**. The first graph request verifies the
existing frozen files; subsequent page navigation shares the same in-memory
index. Keep one browser tab and one local research Vite process. The research
preview on port 8766 is not required and no extraction/build pipeline is run.
Stop the foreground server with **Ctrl+C**, then use the same command to restart.
Dependencies are already installed in this prepared checkout: normal restarts
need only `npm run dev:research`, without reinstalling packages or network access.
Use `npm ci` for a fresh or changed dependency installation.
For an occupied port, choose an explicit alternative:

```sh
MATDREAMS_DEMO_PORT=5178 npm run dev:research
```

Use the corresponding loopback URL. Never bind this private demonstration to
`0.0.0.0` or expose it through a tunnel. `npm run dev` disables research access.
`npm run build` and `npm run preview` are public modes and have no private data
service, including when the production build uses `--mode local-research`.

## Source and scientific boundary

- Release: `rhea-system-chart-20261024-v4`.
- Mapper: `conservative-context-v5`; source contract `system-chart-contract-v1.2`.
- Frozen graph SHA-256:
  `313d36d3adc4541c6d51e3f7086b47f12426513c91e46b461f125fb0815f4778`.
- Existing deterministic client SHA-256:
  `4366792b226bfd813db99cd42f862680c65126b0734961a24e65a99ae30b6dfb`.
- 1,561 selected **provisional paper IDs**, 3,297 claims, 6,073 concepts,
  6,130 role nodes and 3,194 families. No independently established study count
  is inferred from these identifiers.
- Experimental v6 is excluded. The old active-release Markdown/JSON pointer
  naming v3 is stale; the built client and verified frozen v4 select this demo.
- Publication approval remains absent, separately from scientific review and
  technical source consistency. Scientific pages carry a persistent
  **LOCAL RESEARCH DEMO** notice. The approved conceptual homepage is unchanged.

`tools/local-research.ts` is a development-only Vite middleware, not a public
data contract or production backend. It reads the existing artifact/client
manifests, verifies hashes/counts/references, and serves a narrow resource list.
The raw graph/client never enters tracked assets. Original evidence is fetched
only for selected families. Private paths and extraction internals are withheld
from graph responses. Authoritative Markdown is read live, has a source SHA
header, and remains local; its downloaded copy is also private.

The frozen analysis and PNG figures are checked against the artifact manifest.
Current research reports include exploratory diagnostics clearly separated from
registered results. Public v0.1 validation is unchanged and does not accept
this local graph as an approved public export.

## Five-minute walkthrough

| Time | Page | Demonstration |
| --- | --- | --- |
| 0:00–0:25 | Home | Show the approved conceptual tetrahedron and explain that it is not a research-derived graph. |
| 0:25–0:50 | Materials | Show production identity, five count categories, construction stages and scientific limits. |
| 0:50–1:20 | Definition | Search `tensile yield strength`. Distinguish an assigned definition, exact-match general textbook aid, qualifiers and paper-specific terminology. Open the exact identity in Relations. |
| 1:20–2:40 | Relations | Read full indexed totals versus the 30-node/107-family overview. Select tensile yield strength, use Fit graph, expand 14→28 families and fit again. Inspect the grain-size family and its original conditions/evidence/paper. Use the tested sequence below. |
| 2:40–3:20 | Analysis | Show 3,136 singleton-supported families, **not stable**, and **5/100 joint passes at 1,405 paper IDs**. Explain structural convergence versus scientific validity; open a saved figure. |
| 3:20–4:10 | Engineering | The initial boron-content → uniform-elongation pair has a one-family traversal. Remove its first ledger relation; original remains intact while modified reachability changes. Add an explicitly hypothetical relation, then reset. No physical property prediction is made. |
| 4:10–4:40 | Manual | Select `7. Reproduce the current frozen release`, inspect exact existing commands, and download Markdown. Do not execute reproduction during the meeting. |
| 4:40–5:00 | Supports / selector | Show external issue-reporting guidance and missing team-information state. Select Ni: scientific views explicitly show pending integration and withhold RHEA. Return to RHEA. |

## Implemented routes and reused code

- `#/`: approved homepage, unchanged.
- `#/relations`: complete canonical/role indexes, search, filtering, progressive
  neighborhoods, overview reset, SVG pan/zoom, keyboard/readable selection,
  concept/family details and local supporting evidence/paper navigation. The
  separate family index covers all 3,194 families; paste a `rel_…` ID directly.
  A selected family outside the overview receives its own bounded drawing.
  Use **Read labels** for readable zoom and **Fit graph** for the structural
  overview. Concept selection centers a readable neighborhood automatically.
- `#/definition`: full terminology search and role browse; original IDs,
  qualifiers, source usages, assigned definitions and distinct textbook aids.
- `#/materials`: actual release/counts, construction method, source documentation
  and links to the scientific instruments.
- `#/analysis`: actual corpus/support distributions, registered checkpoints,
  saved production figures, normalization and scientific-review limitations.
- `#/engineering`: directed traversal bounded to eight relations, temporary
  removal/addition/hiding/highlighting, original/modified comparison and reset.
- `#/manual`: six existing authoritative Markdown manuals/reports, section
  search, exact command blocks and local Markdown downloads.
- `#/supports`: project and external issue links; contribution, missing-paper
  and error-reporting guidance. No invented contact details or submission backend.

Legacy `core.js` and `learning.js` are served byte-exact and reused for indexing,
search, filters, neighborhoods, role-column ranking and exact-label definition
lookup. SVG role-column and curve geometry is adapted from `app.js:drawChart`.
No whole-site iframe is used. General directed BFS and temporary graph overlays
are new presentation logic because the old app has no general BFS. The legacy
quantitative observation comparison/model engine is not represented as reused
or implemented here. See `LEGACY_FEATURE_INVENTORY.md` for the full reuse table.

## Tested Relations sequence at normal browser zoom

Reset the **browser zoom to 100%** with Ctrl+0 before presenting. Browser zoom
scales the entire webpage. The percentage beside **Drag empty canvas to pan**
belongs only to the graph. The supplied zoomed-out screenshots do not establish
a page typography, density or layout defect.

1. Open `http://127.0.0.1:5177/MatDREAMS/#/relations`, select RHEA and the
   canonical projection, then **Clear filters**, **Return to overview**, and
   hide the full-coverage index if open. Read the two scopes: **6,073 canonical
   identities / 3,194 families indexed**, versus **30 nodes / 107 families
   drawn**. The default graph scale is approximately 66%.
2. Search `tensile yield strength`, then select **Concept index** (52 matching
   identities). The index selection persists between searches. Select the exact
   record with **117 paper IDs**, concept
   `concept_09a7c7267be47127c185c717`. Preserve the other distinct identities;
   the frontend does not merge them. Use **Hide full-coverage index** to give
   the drawing space without changing its contents.
3. Selection centers the concept at **200% internal graph zoom**. Cropped
   neighbors at this scale are a zoom state. Click **Fit graph**: all **14
   nodes / 14 families** fit, at about 91%. Click **Expand neighborhood** once,
   then **Fit graph** again: all **26 nodes / 28 families** fit, at about 48%.
   Fit graph already fits the currently rendered neighborhood, including its
   node labels; it does not draw the full indexed universe or remove families.
   Selection and expansion reset the canvas, so fit again after either action.
4. Use **Read labels** to magnify the selected concept, then +/−, directional
   pan buttons or a drag on empty canvas to inspect nearby nodes. Read labels
   deliberately trades simultaneous coverage for readable labels. **Fit graph**
   recovers the complete displayed subset. No additional Fit neighborhood
   control was needed after testing the existing controls.
5. In the concept's **Connected relation families (73)** list, select
   **average grain size — causal · Incoming · negative**, family
   `rel_b4185cef0145e02b3855ea6e`. This list includes incident families not yet
   drawn. This particular family receives a bounded **two-node / one-family**
   drawing. Its source is `concept_aaf95bb84728189f3b534772` (average grain
   size); its target is the selected tensile-yield-strength identity.
6. Expand **Original endpoints and supporting identifiers**, the original claim
   **average grain size → yield strength**, and the supporting paper titled
   *Enhanced strength-ductility synergy in single-phase Ti-V-Al-Zr-Nb lightweight
   refractory complex concentrated alloys via grain refinement*. Paper ID:
   `rhea_9b298f1c43ec00f7854b`; claim ID:
   `rhea_9b298f1c43ec00f7854b|e_28c1cd2e9ba96f659f3cfb20`.
   Show reported direction, negative polarity, conditions, original context,
   three source-block evidence entries and page-1 locator. The conditions
   compare fine and coarse states of one studied alloy. Explain negative
   polarity relative to **increasing grain size**; do not claim a universal
   continuous trend or independently established causality from this family.
7. Open the supporting paper disclosure to show its title, provisional ID,
   identity warning and **Open asserted DOI · unverified** link. Asserted DOI:
   `10.1016/j.mtcomm.2025.113383`. Browser testing reached ScienceDirect, which
   required a CAPTCHA; publisher content and article identity were not verified.
   The complete local evidence remains inspectable without that external page.
   Authors, year and a separate source URL are not supplied by this record;
   the figure locator is absent, the original PDF is unverified, and structured
   context fields may be null. Missing strain-rate units and yield-offset
   criteria remain explicit in the source context. Do not infer them.
8. **Return to overview** restores 30/107. **Clear filters** also clears the
   search text; overview reset alone retains search/filters. Hide the index if
   it is open. All research access remains local and unapproved for publication.

Keyboard alternative: Tab through the graph controls to its focusable concept
and relation buttons, then Enter or Space to select. The native disclosure
controls and readable relation list also support keyboard navigation.

To demonstrate access beyond the drawing, search
`rel_000ba1765daffe785da96a48`: the full relation-family index finds the boron
content / uniform elongation comparison and renders its two endpoints and one
family. Clear search while the **Relation-family index** is selected to see
**3,194 matching families** with progressive 50-record pages. Switch to
**Concept index** for all identities, including the **2,635 isolated concepts**.
For an exact isolated example, search and select
`concept_92af7a93fdda7d7da826b205`; its panel explicitly reports no incident
families and the drawing contains one node and zero families.

The empty **Performance** column is expected scientific content. Frozen v4 has
zero Performance role memberships, including outside the overview. Its 6,130
role memberships are Processing 590, Intermediate State 2,914, Property 2,377
and Testing/Service condition 249. Keep the inherited column and scientific
assignments; do not fabricate or reclassify nodes to fill it.

## Local checkpoint and static fallback

A reviewed source checkpoint was saved before this readiness pass, outside the
website repository:

```text
/home/min/.codex/visualizations/2026/10/24/01a16e89-3620-7450-ad32-67b43eaa90d0/matdreams-relations-checkpoint-20261025/
```

`source.tar.gz` contains 86 source/configuration/test/documentation files,
including existing untracked work. Its SHA-256 is
`c3bb39863943bedea1b0715fcfe64e057bed8139708e1bc4fb1cea718a60b2bf`.
The checkpoint includes a per-file hash manifest, tracked working-tree patch
and Git status, against HEAD `0c415455af38223681bd9f79a360afcb1a91e7d1`.
Archive contents were read back and verified. Dependencies, build output,
private graph payloads, PDFs, credentials and Git internals were excluded.
To inspect/recover safely, extract into a **new empty directory**; do not
overwrite the active checkout. The independent research artifacts are still
required for the private demo. No commit, stash, reset or branch was created.

Static screenshots are local/private, outside the tracked repository, in the
same parent directory as the checkpoint:

- `matdreams-overview-1440x900.jpg`
- `matdreams-neighborhood-1440x900.jpg`
- `matdreams-relation-evidence-1440x900.jpg`
- `matdreams-overview-1366x768.jpg`
- `matdreams-neighborhood-1366x768.jpg`
- `matdreams-relation-evidence-1366x768.jpg`

These are full-page captures at 100% browser zoom and the named viewport size;
the image pixels exclude the browser's 15 px vertical scrollbar.
The selected-neighborhood images use Fit graph with 28 families. An image
viewer may scale a tall capture down; that does not represent browser font size.
Keep screenshots local: they show unapproved scientific records and evidence.

The readiness pass changed only this guide. Application code, approved design,
typography, layout and existing graph controls were preserved.

## Limits and failure recovery

- Bounded rendering is deliberate: the full 6,073-concept/3,194-family universe
  remains indexed, including 2,635 isolated canonical concepts. Filters describe
  a drawing scope, not scientific negation. Context text is not compatibility.
- A graph path is reachability only. It does not validate material/specimen
  transfers, causality, recipe feasibility, strength, ductility or optimization.
- Publication identities and DOI assertions remain provisional where source
  confirmation is absent. Quotes/locators or definitions can be unavailable.
- Hypothetical edits are in-memory and disappear on page reload; no scenario is
  written to the research graph or submitted to a server. No scenario persistence,
  exhaustive path enumeration or quantitative prediction is implemented.
- Ni integration, verified team details and public data approval remain pending.
  All current private graph records, evidence, figures and manuals need a
  separately approved export before any public distribution.
- A 503 or identity failure is fail-closed. Confirm the authorized checkout and
  existing pinned artifacts are present; restart the website server after repair.
  Never change a checksum, regenerate a frozen release or switch to v6 to hide
  the error. An occupied port fails explicitly; select a free port as above.
- A missing document, image or definition is reported explicitly. Do not infer
  absent scientific data. The meeting UI never executes document commands.

## Validation record

The Relations readiness pass repeated the full concept → family → claim/paper
flow at **1440 × 900** and **1366 × 768**, at normal browser zoom. DOM viewport
dimensions, device-pixel ratio 1 and visual viewport scale 1 were checked.
Fit graph contained every rendered node and relation path at both sizes after
14→28 expansion, without dropping records. Read labels, +/−, directional pan,
empty-canvas drag, keyboard relation activation, local disclosures and overview
recovery worked. Grain size and sintering temperature were also fitted, and
isolated/off-overview access was verified. No horizontal document overflow or
application console warnings/errors were observed. Publisher CAPTCHA is the
external-navigation limitation described above. These checks sample actual
records; they do not constitute an exhaustive scientific review of every family.

During implementation, focused tests followed the local adapter, terminology,
scenario and content phases. Integrated `npm run check` passes lint, strict
TypeScript, **150 tests across nine files**, and the production build. These
website tests are distinct from saved research verification receipts and human
scientific review. No new dependencies were required.

Actual browser interactions verified full search (52 `tensile yield strength`
matches), canonical selection, 14→28-family expansion, pan/zoom, keyboard family
selection, local evidence, `no_effect` filtering (60 eligible families), an empty
context result, 6,130-role projection, terminology/reading aids, actual registered
Analysis results, scenario removal/addition/reset, Manual section selection and
Markdown download, Materials counts, Supports links and Ni withholding.
Direct relation-ID lookup and all 3,194 indexed families were also verified,
including an off-overview family rendered as its two endpoints and original
relation. Browser console had no warnings/errors. A 375 px effective viewport
had no horizontal document overflow. The approved homepage loaded with its
existing rotation control, and its source, shared navigation and design tokens
were checked byte-unchanged.

HTTP/security tests verified forged Host/foreign Origin →403, traversal/unknown
resource →404 and research `/@fs` access →403. Hash mismatches and disabled
public mode are covered by automated tests. Production preview was also checked
in the browser: Relations shows an explicit unavailable state with no scientific
canvas or local-demo banner. A production build using `--mode local-research`
was byte-identical to the ordinary production build. Both outputs were inspected
for private documents/data, local filesystem paths and actual graph record IDs;
none were present. `public/data/` still contains only `.gitkeep`.

Full upstream-outage recovery is
implemented but was not simulated by altering research files. Browser console,
assistive-technology behavior, hardware-wide memory pressure, exhaustive
scientific records and public deployment are not all fully validated by these
checks. The research repository fingerprint (HEAD, remote, status, tracked diff,
and untracked-file metadata) remained unchanged. The implementation is left
uncommitted on website `main` as requested; nothing was pushed or deployed.

Measured adapter graph transfer: approximately 31.4 MB decoded / 5.7 MB gzip;
first request about 1.69 seconds including verification, warm request about
0.086 seconds. Observed single-server RSS around 694 MiB after loading/HMR;
this is not a total workstation-memory benchmark. Avoid extra renderers,
research servers or many browser tabs during the meeting.

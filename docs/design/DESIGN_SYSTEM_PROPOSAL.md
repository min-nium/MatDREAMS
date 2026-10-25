# Design system proposal — "Instrument Plate"

The system for the approved direction in
[DESIGN_DIRECTIONS.md](DESIGN_DIRECTIONS.md).

> **Status: approved and implemented, 2026-10-25**, for the shell and the
> homepage. Tokens live in `src/styles/tokens.css`, the stylesheet in
> `src/styles/global.css`, and the self-hosted faces in
> `src/assets/fonts/`. Sections marked *Not yet built* describe surfaces
> (Relations, Engineering, Analysis, Definition) whose pages are future work;
> their tokens exist but no page consumes them yet.

Decisions carried in: IBM Plex Sans / Serif / Mono, the approved palette, the
MatDREAMS acrostic navigation, and the Dark Field tokens scoped to graph
canvases. English only for the initial release, so no CJK face is loaded.

Every contrast ratio quoted below was computed from the stated hex pairs using
the WCAG 2.x relative-luminance formula, not estimated.

---

## 1. Typography

### Families

All three are **IBM Plex**, SIL Open Font License 1.1, from `github.com/IBM/plex`
(also on Google Fonts). One superfamily gives a Sans, a Serif and a Mono drawn on
a shared skeleton with matching metrics — the pairings are siblings, which suits
a reference work, and it keeps the font budget to one vendor and one licence.

| Token | Family | Role |
| --- | --- | --- |
| `--font-sans` | `"IBM Plex Sans"` | Interface, headings, navigation, controls |
| `--font-serif` | `"IBM Plex Serif"` | Long-form definitions and documentation prose (Definition, Manual) |
| `--font-mono` | `"IBM Plex Mono"` | Every label, eyebrow, unit, identifier, count, numeric value, node ID |

Fallback stacks:

```css
--font-sans:  "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-serif: "IBM Plex Serif", Georgia, "Times New Roman", serif;
--font-mono:  "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;
```

**Why IBM Plex rather than Inter.** Inter is the default of generated software
and carries no character; Plex Sans was drawn for IBM Research and has genuine
engineering voice (the flared stems, the distinctive `a`, `g` and `1`) while
remaining neutral enough for dense data. It is also the only OFL superfamily that
covers sans, serif and mono at this quality.

**Korean support — decided: not for this release.** The initial release is
English only, so no CJK face is loaded. IBM Plex Sans KR (OFL, metrically
compatible) remains the option if Korean UI text is added later; retrofitting a
CJK face changes line heights, so it would need a type review.

**Resolved in implementation: static weights, five files.** Rather than depend
on unconfirmed variable builds, the shipped set is the Latin1 subset of static
weights: Sans 400/600, Serif 400, Mono 400/500 — **101 KB total**, self-hosted
under `src/assets/fonts/` with the OFL text beside them. The subset covers
U+0020–007E, U+00A0–00FF, U+2013–2014, U+2018–201A, U+201C–201E, U+2026 and
U+2212. Glyphs outside it (arrows, geometric shapes) are drawn as SVG or CSS
rather than set as text, which is why the system-selector marks are drawn boxes
and not `[x]` characters.

### Loading

Self-host as WOFF2 under `src/assets/` (bundled and hashed) rather than linking
Google Fonts: no third-party request, no layout shift from a blocked CDN, and no
external dependency on a static GitHub Pages site. Subset to Latin + Latin
Extended (+ Korean only if adopted). `font-display: swap`, with
`size-adjust`-tuned fallback metrics to limit reflow.

### Scale

A two-register scale: a tight, closely spaced band for labels and data, and wide
jumps for display. Uniform ratios are deliberately avoided — the brief asks for
hierarchy, and an even geometric scale produces the "uniform spacing that ignores
visual hierarchy" it warns against.

| Token | Size | Line height | Tracking | Family | Use |
| --- | --- | --- | --- | --- | --- |
| `--text-label-sm` | 11px | 1.3 | 0.07em | mono, uppercase | Dense table heads, axis ticks |
| `--text-label` | 12px | 1.35 | 0.06em | mono, uppercase | Eyebrows, section labels, node type, units |
| `--text-data` | 13px | 1.4 | 0 | mono, tabular | Numeric cells, IDs, counts |
| `--text-sm` | 14px | 1.5 | 0 | sans | Captions, secondary UI |
| `--text-base` | 16px | 1.6 | 0 | sans | Interface body |
| `--text-prose` | 17px | 1.7 | 0.003em | serif | Long-form definitions |
| `--text-lead` | 20px | 1.5 | −0.005em | sans | Page intros |
| `--text-h3` | 22px | 1.35 | −0.01em | sans 600 | Subsection |
| `--text-h2` | 29px | 1.25 | −0.015em | sans 600 | Section |
| `--text-h1` | `clamp(2.25rem, 1.35rem + 2.8vw, 3.5rem)` | 1.12 | −0.022em | sans 600 | Page title |
| `--text-display` | `clamp(2.75rem, 1.4rem + 5.4vw, 6rem)` | 1.04 | −0.03em | sans 600 | Homepage wordmark |

Tracking tightens as size increases, which is correct optical practice and is
what the references do (Trousdale: `0.05em` uppercase at 11px, `−0.01em` at
13px). Numeric contexts set `font-variant-numeric: tabular-nums lining-nums`.

### Rules

- Prose measure capped at **68ch**; UI text at 80ch.
- The mono uppercase label is the system's connective tissue. If a piece of text
  names a quantity, a unit, a status, a category or an identifier, it is a label.
- Never set `--text-prose` in mono, and never set tabular data in serif.
- Italic is reserved for scientific convention (species, variables, *in situ*),
  never for emphasis. Emphasis is weight 600.

---

## 2. Colour

### Core palette (page surfaces)

| Token | Value | Contrast on paper | Semantic use |
| --- | --- | --- | --- |
| `--paper` | `#F7F6F2` | — | Page ground |
| `--surface` | `#FFFFFF` | — | Panels, sheets, sticky heads |
| `--ink` | `#16181A` | **16.46:1** | Primary text |
| `--ink-2` | `#5E6468` | **5.55:1** | Labels, captions, secondary text |
| `--ink-3` | `#8C9296` | 2.91:1 | **Disabled controls and non-informational marks only.** Not for empty data values: "no value" is information, so those use `--ink-2` |
| `--rule` | `#DCD8D0` | 1.31:1 | Decorative hairlines (grid, table rows) |
| `--rule-2` | `#B4B0A7` | 2.00:1 | Structural dividers |
| `--rule-3` | `#8A867C` | **3.36:1** | Rules that carry meaning (focus boundaries, active-column marks, chart axes) |
| `--select` | `#C8431E` | **4.54:1** | The current selection — marks, fills, 16px+ semibold text |
| `--select-ink` | `#93301A` | **7.25:1** | The accent used as small text |

`--ink-3` is deliberately below 3:1 and is legitimate only for disabled controls
and purely decorative marks, which WCAG exempts. It must never carry
information. The first implementation used it for empty provenance values and
for "Not yet supplied"; that was wrong — the absence of a value is a fact the
reader needs — so those now use `--ink-2` at 5.55:1.

### The one-accent rule

`--select` marks **what is currently selected** and nothing else. It is not used
for links, buttons, headings, branding, hover, errors or warnings. This is
Trousdale's discipline — one accent appearing twice in 35 KB of CSS — and it is
what makes selection instantly readable in a dense graph. White on `--select` is
4.91:1; `--ink` on `--select` is 3.63:1, so filled accent elements take white
text at 16px+ or ink at large sizes only.

### Graph canvas tokens (scoped)

Applied **only** inside the graph container on Relations and Engineering. Roughly
a dozen tokens, not a second theme — see the scoped-exception reasoning in
[DESIGN_DIRECTIONS.md](DESIGN_DIRECTIONS.md).

| Token | Value | Contrast on `--canvas` | Use |
| --- | --- | --- | --- |
| `--canvas` | `#0E1113` | — | Graph drawing surface |
| `--canvas-raised` | `#171B1E` | — | In-canvas panels, tooltips |
| `--canvas-ink` | `#E8EAEA` | **15.69:1** | Node labels, visible edges |
| `--canvas-ink-2` | `#9BA3A8` | **7.40:1** | Secondary labels |
| `--canvas-ink-3` | `#646C71` | **3.54:1** | Occluded edges, de-emphasised nodes |
| `--canvas-rule` | `#2A3034` | 1.42:1 | Decorative grid |
| `--canvas-rule-2` | `#5C666C` | **3.22:1** | Meaningful rules, frames |
| `--canvas-select` | `#FF7A3D` | **7.31:1** | Current selection in canvas |

`--select` is lightened to `#FF7A3D` inside the canvas because a mid-chroma
vermilion loses separation against graphite. Both remain recognisably the same
hue family, so the identity holds across the boundary.

### Scientific data channels

Categorical hues for encodings that are genuinely categorical (relation class,
concept domain). Two sets, one per ground, matched by position so an encoding
keeps its identity when it moves between a paper table and the dark canvas.

| Channel | On paper | Contrast | On canvas | Contrast |
| --- | --- | --- | --- | --- |
| 1 | `#1F5F8B` | 6.33:1 | `#5FA8D8` | 7.29:1 |
| 2 | `#2F6B4F` | 5.82:1 | `#5FBF8F` | 8.42:1 |
| 3 | `#8A5A10` | 5.47:1 | `#E0A93F` | 8.95:1 |
| 4 | `#7A4E9E` | 5.69:1 | `#B48CE0` | 7.01:1 |
| 5 | `#0F6E78` | 5.51:1 | `#48C4CE` | 9.08:1 |
| 6 | `#9C2C3A` | 6.85:1 | `#E8697F` | 6.10:1 |

Every value clears 4.5:1 against its ground, so channels are legible as text, as
marks and as 1px strokes. Six is the ceiling: beyond six categories, use a
different encoding, not more hues. None of these may be used for selection.

### Evidence, direction and uncertainty — encoded form-first

The values below are **taken verbatim from `docs/WEB_DATA_CONTRACT.md`**, not
invented by the design. `scientific.evidenceReview` is exactly one of
`unreviewed`, `reviewed`, `disputed`. Relation `direction` is exactly
`directed` or `undirected`. No other states exist, and the UI must not
synthesise any.

`AGENTS.md` requires that uncertain data not be shown as verified and that
colour is never the only channel. Encoding is therefore **form first, colour
second**:

| Contract value | Stroke | Glyph | Hue layer | Label |
| --- | --- | --- | --- | --- |
| `evidenceReview: reviewed` | solid 1.5px | filled | none (ink) | `REVIEWED` |
| `evidenceReview: unreviewed` | dotted 1-3 | hollow + hairline ring | `--ink-2` | `UNREVIEWED` |
| `evidenceReview: disputed` | dashed 4-3 | hollow, with a centred bar | channel 6 | `DISPUTED` |
| `direction: directed` | arrowhead at `target` | — | — | — |
| `direction: undirected` | no arrowhead, both ends plain | — | — | — |
| User-modified (Engineering only, never persisted) | solid 1.5px | filled + corner tick | channel 4 | `MODIFIED` |

Line style survives greyscale, printing, colour-vision differences and
low-quality projection. The hue layer is reinforcement only. Every state also
appears as literal text in the accessible node list (§8).

**`reviewed` must never be rendered as "verified", "confirmed", "validated" or
"true".** The contract is explicit that `reviewed` alone is not a claim of
verified truth and that publication approval never upgrades `unreviewed` or
`disputed`. The two axes — publication approval and evidence review — are shown
in separate, separately labelled places and are never combined into a single
quality score, badge or star rating.

**Uncertainty is text, not a magnitude.** `scientific.uncertainty` and
`scientific.unit` are optional upstream **strings**, and the draft contract
states that it does not model numeric measurements or statistical uncertainty.
The design therefore renders them verbatim in `--text-data`, adjacent to the
value they qualify. It must **not** map uncertainty to opacity, stroke width,
node size, a colour ramp, an error bar, or any other continuous visual channel:
doing so would invent a magnitude the data does not carry. Absence of
`unit` or `uncertainty` means *unspecified* — never dimensionless, and never
certain — and is rendered as an explicit `—` with a `NOT SPECIFIED` label, not
as blank space.

If a future versioned contract extension supplies genuinely numeric uncertainty,
a continuous encoding can be specified then, with its scale labelled in the
legend and its units stated.

### Prohibited

Gradients as identity, glow or bloom, coloured shadows, more than one accent,
colour as a sole carrier of meaning, decorative use of a data channel, and
saturated hues in page chrome.

---

## 3. Grid and spacing

### Spacing scale

4px base. Non-uniform at the top, so hierarchy is expressible:

```
--space-1: 4px     --space-5: 24px    --space-9:  64px
--space-2: 8px     --space-6: 32px    --space-10: 96px
--space-3: 12px    --space-7: 40px    --space-11: 128px
--space-4: 16px    --space-8: 48px
```

Rule of use: within a component, steps 1–4. Between components, 5–6. Between
sections, 8–9. Framing a page, 10–11. Adjacent elements should rarely share the
same step — equal spacing everywhere is the absence of hierarchy, not its
presence.

### Grid

```
--grid-cols: 12
--gutter: 24px                            (16px below 640px)
--margin: clamp(20px, 4vw, 72px)
--app-max: 90rem                          (1440px)
--rail: 13.5rem                           (persistent system rail)
--measure: 68ch                           (prose)
```

`--app-max: 90rem` matches Normal Computing's container; the fluid margin follows
Kang Group's `clamp(16px, 4vw, 80px)` pattern, tightened.

### Structure from rules, not boxes

- `--radius: 0` globally. The **only** exception is input affordances — search
  fields and filter pills take `--radius-input: 999px`. Radius is a semantic
  signal meaning "this accepts your input", exactly as Material-Archiv uses it.
- No `box-shadow` for elevation. Panels are distinguished by `--surface` against
  `--paper` and a 1px `--rule-2` border.
- Tables are ruled, never striped. Column separation by 1px vertical rules.
- Lists of entries use Material-Archiv's scaffold: caption above content,
  flush-left, 1px column rules, ragged bottoms. Not cards.

### Intentional asymmetry

The rail is fixed at `--rail`; the working area is fluid. Pages are never
centred-symmetrical. Page titles hang to the rail's alignment while prose indents
to the content column — a deliberate two-axis composition rather than a single
centred stack.

### Responsive columns

Material-Archiv's column-count ladder rather than a fixed breakpoint grid, for
index and entry listings:

| Viewport | Index columns | Rail |
| --- | --- | --- |
| ≥ 1600px | 6 | persistent |
| 1280–1599px | 5 | persistent |
| 1024–1279px | 4 | persistent |
| 900–1023px | 3 | persistent, narrowed to 11rem |
| 640–899px | 2 | collapses into header control |
| < 640px | 1 | collapses into header control |

---

## 4. Navigation

### The acrostic

The wordmark is the navigation. Each section is one word with its leading
letters emphasised:

```
MatDREAMS   Materials  Definition  Relations  Engineering  Analysis  Manual  Supports
            ───        ─           ─          ─            ─         ─       ─
```

- The initial segment (`Mat`, `D`, `R`, `E`, `A`, `M`, `S`) is set in
  `--font-sans` 600 at `--ink`.
- The remainder (`erials`, `efinition`, …) is set at 400 in `--ink-2`.
- Both are on one baseline, at one size. The word reads as a word; the acrostic
  is visible without being a puzzle.
- The `MatDREAMS` wordmark at far left uses the same emphasis logic
  (**Mat** **D** **R** **E** **A** **M** **S**) and links Home, so the
  relationship between the name and the sections is self-evident without
  explanation.

This is the main refinement of the supplied concept. The sketch splits each word
across two lines, which makes seven section names hard to read at a glance; the
single-line emphasis keeps the device and removes the cost.

### States

| State | Treatment |
| --- | --- |
| Rest | initial `--ink` 600, remainder `--ink-2` 400 |
| Hover | remainder → `--ink`; 1px underline at `--rule-3`; `90ms` |
| Focus-visible | 2px `--select` outline, 3px offset, square |
| Current | initial → `--select-ink`; whole word `--ink` 600; 2px `--select` underline; `aria-current="page"` |

Current section is marked by weight, underline **and** colour — never colour
alone.

### Behaviour

- Permanently visible at ≥ 900px. No hamburger at desktop width: hiding the
  sections would destroy the identity device.
- Below 900px, a labelled disclosure (`Sections`, with an explicit expanded
  state) opens a full-height sheet listing all seven with the same emphasis
  treatment, plus the system selector. Focus is trapped while open, `Escape`
  closes and returns focus to the trigger.
- Hash routing (`#/relations`) is preserved exactly as built. No routing change
  is proposed.
- A skip link to `#main-content` remains the first focusable element.

### The system rail

Persistent, left, `--rail` wide, separated by a 1px `--rule-2` vertical rule.
Contains, in order:

1. `CHOOSE YOUR SYSTEM` — `--text-label`.
2. A `radiogroup` of material systems (RHEA, Ni Superalloy), arrow-key
   navigable. Selected system takes `--select-ink` plus a 2px left bar.
3. A 1px divider.
4. **The provenance block** — the design's answer to the `AGENTS.md` validation
   requirements, adapted from Overbrowsing's self-reporting chrome. Field names
   are taken from `docs/WEB_DATA_CONTRACT.md`; nothing is renamed or derived
   beyond counting:

```
CONTRACT       —
SYSTEM         —
RELEASE        —
MAPPER         —
SOURCE SHA     —
APPROVAL ID    —
APPROVED ON    —
CONCEPTS       —
NODES          —
RELATIONS      —
EVIDENCE       —
STATUS         No approved public export is loaded
```

Labels in `--text-label`, values in `--text-data`. `SOURCE SHA` shows the first
and last eight characters of `source.sourceGraphSha256` with the full value
available on focus — never truncated silently.

`EVIDENCE` is a count breakdown, not a score: `reviewed / unreviewed /
disputed`, each a plain integer. It is **not** expressed as a percentage, a
grade or a bar, because that would imply a quality judgement the contract does
not support.

`APPROVED ON` is labelled as approval, never as validation or verification. The
contract is explicit that publication approval and scientific verification are
separate, so no field in this block may be captioned in a way that conflates
them.

When no approved export is present, this is the *designed* state, not a failure
to hide. When a release is loaded but loading or validation fails,
`loadApprovedGraph()` throws a `GraphDataError` with a stable error code, and
`STATUS` renders that code together with its message in `--select-ink` behind a
dashed `--select` left bar — visible, specific, and impossible to mistake for
working data. The failing field is marked in place within the block above, so a
release-identity mismatch or an export-digest mismatch is attributable at a
glance rather than described in prose.

## 5. Components and interaction principles

### Principles

1. **Label everything measurable.** Any number on screen carries a mono label and
   its unit. A bare number is a bug.
2. **State the provenance.** Any scientific claim shows its evidence state in the
   same visual unit as the claim.
3. **Form before colour.** Every encoding survives greyscale.
4. **No component invented twice.** But no component forced onto a page whose job
   it does not fit — the pages differ deliberately.
5. **Interaction has a purpose or it does not exist.** No hover effect that does
   not reveal information or confirm a target.

### Core components

**Metric strip** (adapted from Normal Computing). A row of cells divided by 1px
vertical `--rule-2`, each: mono uppercase eyebrow, large value in
`--text-h2`/`--text-h3`, two-line `--text-sm` caption. No card, no radius, no
shadow. Used for the homepage provenance strip and throughout Analysis for
convergence and reliability figures. Wraps to two rows below 900px, one column
below 640px.

**Entry index** (adapted from Material-Archiv). Caption above content, flush
left, 1px column rules, ragged bottoms, column-count ladder. Used for Materials
and for the Definition term corpus.

**Definition entry.** Serif prose at `--text-prose`, 68ch, with a persistent
narrow margin column carrying the mono apparatus — source, evidence state,
units, cross-references. Visited terms take a subtle marker (Trousdale's
strike-through recall, softened to a `--ink-3` dot) so a student can see their
own coverage of a corpus.

**Detail panel** (adapted from Trousdale). A `--surface` sheet with a 1px
`--rule-2` border, a mono type header with its node glyph, and collapsible
sections separated by 1px **dashed** `--rule-2` rules with `+`/`−` indicators.
Sections: Definition, Evidence, Relations, Sources.

**Graph canvas.** The scoped graphite surface inside a 1px `--rule-2` frame. Node
type by outline shape (circle / square / triangle / hexagon, hollow, 1px),
relation kind by line style, selection by `--canvas-select`. A persistent legend
states every active encoding channel explicitly, in the Schema manner.

**Node list** — the required readable alternative to visual-only exploration
(`AGENTS.md`). A real table, present at all times (not a fallback), ruled, with
sortable columns: ID, label, type, degree, evidence state, uncertainty. Selection
is synchronised both ways with the canvas. Keyboard-complete.

**Buttons.** Square, 1px `--rule-3` border, transparent ground, `--ink` label,
`--space-3`/`--space-5` padding, optional `→`. Hover fills `--paper`→`--surface`
and darkens the border. Primary action: `--select` fill, white label at 16px+.

**Status and validation messages.** Flush-left, 1px left bar, mono label plus
sans body. Error bars use `--select` with a dashed stroke; the dash distinguishes
error from selection without introducing a second accent.

**Pause control.** Any continuously animating region carries a visible,
keyboard-reachable `Pause`/`Resume` button with text, not an icon alone.

### Explicitly rejected

Rounded shadowed cards as a layout unit; repeated three-across feature grids;
generic icon sets; decorative illustration; a single template applied to all
seven pages.

---

## 6. Motion

### Durations

```
--motion-instant: 90ms     hover, focus, small colour shifts
--motion-quick:   180ms    state change, toggle, content swap
--motion-base:    320ms    panel open/close, leader-line retarget
--motion-slow:    640ms    view transition, initial figure entry
```

Named for use, in the manner of Material-Archiv's `crawl`/`walk`/`run`, and
bracketed by the 300–800ms band the references converge on.

### Easing

```
--ease-standard:   cubic-bezier(0.2, 0, 0, 1)      default; decelerating
--ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1)   expo-out; selection and panels
--ease-exit:       cubic-bezier(0.4, 0, 1, 1)      leaving the screen
--ease-linear:     linear                          continuous rotation only
```

`--ease-emphasized` is Trousdale's curve, which both primary references converge
on independently and which reads as mechanical settling rather than bounce.

### Rules

- Animate `transform` and `opacity`. Animate geometry attributes only in SVG,
  where there is no alternative.
- Nothing animates on scroll. No parallax, no reveal-on-scroll.
- Only the tetrahedron loops, and it has a pause control.
- No glow, bloom, pulse, shimmer or blink. Trousdale's `blink 1s infinite` is
  explicitly not adopted: on a page reporting scientific reliability it reads as
  an alarm.
- Continuous motion pauses when off-screen (`IntersectionObserver`) and when the
  tab is hidden (`visibilitychange`).

### Reduced motion

`prefers-reduced-motion: reduce` must be honoured in **CSS and in JavaScript**,
since the tetrahedron runs on `requestAnimationFrame` where a media query alone
has no effect. Query via `matchMedia` and subscribe to changes, so a mid-session
preference change takes effect without a reload.

Under reduce: continuous rotation stops; auto-cycling does not start; transitions
collapse to `--motion-instant` or to instant; transform-based entrances become
opacity-only or are removed. Nothing becomes unavailable — only still.

---

## 7. Responsive behaviour

| Breakpoint | Layout |
| --- | --- |
| ≥ 1440px | Full three-zone layout; rail + working area + detail panel; index at 5–6 columns |
| 1200–1439px | Same; index at 4–5 columns |
| 1024–1199px | Detail panel narrows to 22rem; index at 4 |
| 900–1023px | Rail narrows to 11rem; detail panel becomes an in-flow section below the working area; index at 3 |
| 640–899px | Rail collapses into a header control; single column; nav becomes a disclosure sheet; index at 2; metric strip wraps to two rows |
| < 640px | Single column; margin 20px; gutter 16px; index at 1; metric strip stacks; graph canvas gets a fixed-aspect stage with the node list directly beneath |

Principles: the rail collapses before the content column narrows past comfort;
prose keeps its 68ch measure at every size; the graph never becomes a
pinch-to-zoom-only surface — the node list is always reachable; touch targets are
at least 44x44px, which means node glyphs get an invisible expanded hit area on
touch pointers.

---

## 8. Accessibility requirements

These are requirements for the implementation phase, not suggestions.

### Structure

- Semantic landmarks: one `<header>`, `<nav aria-label="Sections">`, `<main>`,
  `<aside>` for the rail, `<footer>`. The existing skip link is preserved as the
  first focusable element.
- One `<h1>` per page; no skipped heading levels. The existing route-change focus
  move to `<main>` is preserved.
- Tables are real `<table>` elements with `<th scope>`, not grid divs.

### Colour and contrast

- Body text ≥ 4.5:1; large text and UI components ≥ 3:1. All palette values in §2
  are stated with their measured ratios; `--ink-3` and `--rule`/`--rule-2` are
  marked as non-informational.
- No meaning carried by colour alone, anywhere. Evidence state, relation kind,
  selection and current-page all carry a second channel (stroke style, glyph,
  weight, underline, text).
- Verify the palette against deuteranopia, protanopia and tritanopia simulation
  before implementation. The six data channels were chosen with varied lightness
  as well as hue for this reason, but simulation is still required.

### Keyboard

- Everything operable by keyboard, in a logical order, with no traps.
- Focus-visible: 2px `--select` outline at 3px offset, square — visible against
  `--paper`, `--surface` and `--canvas`.
- The graph is operable without a pointer: `Tab` into the canvas, arrow keys to
  traverse nodes, `Enter` to select, `Escape` to exit to the node list.
- The disclosure sheet traps focus while open and restores it on close.

### Motion and autoplay

- `prefers-reduced-motion` honoured in CSS and JS (§6).
- Every continuously animating region has a visible pause control.
- Auto-cycling stops permanently on first user interaction and resumes only on an
  explicit Resume.

### Assistive technology

- The graph canvas SVG is `aria-hidden="true"` presentation; interaction is
  carried by real DOM controls positioned over it (see
  [HOMEPAGE_DESIGN_SPEC.md](HOMEPAGE_DESIGN_SPEC.md) §4). SVG interactive
  elements have inconsistent AT support; real buttons do not.
- The node list is the AT-complete representation, present always.
- Live regions are used sparingly and never during auto-cycling.
- Scientific notation: units are in text, not in images; subscripts and
  superscripts use `<sub>`/`<sup>`; chemical formulae keep their case.

### States

Loading, empty, validation-failure, and the contract's `unreviewed` and
`disputed` evidence states are designed states with defined typography and
layout, not afterthoughts. The provenance block (§4) is the
canonical example.

---

## 9. Homepage tetrahedron — visual treatment

Behaviour and implementation are specified in
[HOMEPAGE_DESIGN_SPEC.md](HOMEPAGE_DESIGN_SPEC.md). This section covers
appearance only.

### Rendering approach

**Inline SVG with a hand-written 3D projection — no dependency.** Four vertices
and six edges do not justify a WebGL runtime, and `AGENTS.md` requires measuring
before adding an animation or graph dependency. The comparison is in
HOMEPAGE_DESIGN_SPEC.md §3; the decisive factor is that SVG gives the projected
2-D vertex coordinates directly in JavaScript, which is exactly what the leader
line needs, in the same coordinate space as the line itself.

### Treatment

The tetrahedron is a **precision line drawing**, not a solid. Nothing is shaded,
lit, filled with gradient, or glowing.

| Element | Treatment |
| --- | --- |
| Visible edges | 1px `--ink`, solid, `stroke-linecap: round` |
| Occluded edges | 1px `--ink-3`, `stroke-dasharray: 5 4` |
| Vertex glyph, rest | 9px radius circle, 1.5px `--ink` stroke, `--paper` fill |
| Vertex glyph, hover | same, stroke `--ink` 2px, scale 1.08 over `--motion-instant` |
| Vertex glyph, active | filled `--select`, no stroke, radius 11px |
| Vertex label | `--text-label`, `--ink-2`; active label `--ink` 600 |
| Centroid | 2px `--rule-3` dot — a quiet reference mark, not an element |
| Leader line | 1.5px `--select`, stepped right angles, square joins |
| Panel anchor | 8px notch in the panel's 1px left border, `--select` |

The dashed occluded edge is taken directly from the supplied sketch, which
already applies the correct 3-D convention.

### What is deliberately absent

- **The starfield.** It lowers effective contrast across the whole figure,
  competes with the vertex glyphs, and adds weight for no information. The
  figure's legibility is the point.
- **Faces.** Filled or translucent faces would hide the back edges, make
  occlusion ambiguous, and imply a solid object where the tetrahedron is a
  relationship diagram.
- **Glow, bloom, shadow, specular highlight.** None carries information.
- **Perspective exaggeration.** A weak-perspective projection (near-orthographic)
  keeps the four edge lengths comparable, so the figure reads as a regular
  tetrahedron rather than as a dramatic camera angle.

### Scientific integrity

- The four vertices are **Processing, Structure, Property, Performance**. No
  fifth element (characterization at the centre) is drawn unless the research
  team specifies it.
- Edges are rendered **undirected** until the research team supplies direction.
  Drawing arrowheads would assert a causal claim the frontend is not entitled to
  make, and `AGENTS.md` forbids inferring relations.
- The explanation text and its materials-science example are **content supplied
  by the research team**, not written by the design. Until supplied, the panel
  shows its empty state: the concept name, its position in the tetrahedron, and
  an explicit "Explanation pending review" line. The homepage must not ship
  invented scientific examples.

---

## 10. Decisions and what remains

Approved on 2026-10-25 and implemented: Direction A as the system; Dark Field
scoped to graph canvases; English only; 4.5 s auto-cycle; 60 s per revolution;
inline SVG with a custom projection; IBM Plex Sans/Serif/Mono; the acrostic
navigation preserved.

Resolved during implementation:

| Question | Resolution |
| --- | --- |
| Plex variable builds | Not relied on. Static Latin1 subsets ship instead: 5 files, 101 KB (§1). |
| Korean typeface | Not loaded; English-only release (§1). |
| Evidence encoding vocabulary | Uses the contract's own `unreviewed` / `reviewed` / `disputed` verbatim (§2). |
| Uncertainty encoding | Rendered as upstream text, never mapped to a visual scale (§2). |
| Provenance field names | Taken from `docs/WEB_DATA_CONTRACT.md`; no `validated` field exists (§4). |

Still open, and not blocking the homepage:

| Question | Note |
| --- | --- |
| Explanatory content for the four corners | Must come from the research team. The pending-review state ships until then. |
| Corner-to-vertex mapping | Chosen for label separation; confirm it violates no scientific convention. |
| "Property" vs "Properties" | Kept verbatim from the supplied concept. |
| Draft contract currency | `matdreams-web-graph-v0.1-draft` is marked draft; confirm before the loader is wired to the UI. |
| Data channel palette under colour-vision simulation | Specified with varied lightness as well as hue, but not yet simulated — required before the graph pages are built. |

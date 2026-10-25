# Homepage design specification

Detailed specification for the MatDREAMS homepage and its materials tetrahedron,
written to be implementable in React without further design decisions. It assumes
the system in [DESIGN_SYSTEM_PROPOSAL.md](DESIGN_SYSTEM_PROPOSAL.md).

> **Status: implemented, 2026-10-25.** Code is in
> `src/components/graph/` and `src/pages/HomePage.tsx`; behaviour is covered by
> `tests/tetrahedron.test.ts` and `tests/homepage.test.tsx`. Where
> implementation found this spec wrong or incomplete, the spec has been
> corrected and the change is marked **Changed in implementation**.
>
> **Refinement round, 2026-10-25.** A visual review at 1440x900, 834x1112 and
> 390x844 produced the changes in §16. Four were defects found by measuring the
> rendered page, not by reading the code.

Geometry and projection values are verified numerically — stated as computed,
not estimated — and pinned by tests.

---

## 1. Page structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│ HEADER        MatDREAMS   Materials Definition Relations … Supports      │ 
├────────────┬──────────────────────────────────────┬──────────────────────┤
│            │                                      │                      │
│  SYSTEM    │                                      │   EXPLANATION        │
│  RAIL      │            TETRAHEDRON STAGE         │   PANEL              │
│            │                                      │                      │
│  Choose    │              ◯ Performance           │  STRUCTURE           │
│  your      │             ╱│╲                      │  ──────────          │
│  system    │            ╱ │ ╲                     │  Definition…         │
│            │           ╱  │  ╲                    │                      │
│  ○ RHEA    │          ◯───┼───●────────┐          │  Example…            │
│  ○ Ni      │       Processing  Structure│          │                      │
│            │            ╲ │ ╱           └──────►◁  │  ← leader docks here │
│  ────────  │             ◯                        │                      │
│  RELEASE   │           Property                   │                      │
│  NODES     │                                      │  ◀ ▮▮ ▶  Pause       │
│  STATUS    │                                      │                      │
├────────────┴──────────────────────────────────────┴──────────────────────┤
│ PROVENANCE STRIP   SYSTEM │ RELEASE │ NODES │ RELATIONS │ EVIDENCE       │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓ scroll
                     Orientation section (editorial)
```

The stage occupies the viewport below the header with no scrolling required.
Scrolling reveals one short orientation section. There is no hero image, no
feature grid, and no scroll choreography.

---

## 2. Header and navigation

### Geometry

- Height `96px` at ≥ 900px; `72px` below.
- Full-bleed, `--surface` ground, 1px `--rule-2` bottom border.
- Horizontal padding `--margin`.
- Single row: wordmark left, section list right, baseline-aligned.

### Wordmark

`MatDREAMS` at `--text-h3` (22px), `--font-sans`. The segments
`Mat` `D` `R` `E` `A` `M` `S` are weight 600 `--ink`; nothing else is in the
word, so the wordmark is entirely emphasised — and the section list beneath it
repeats exactly those segments. The relationship is shown, never explained.

Markup: one `<a href="#/">` containing `<span>` segments, with an
`aria-label="MatDREAMS — home"` so assistive technology hears the name once
rather than letter by letter.

### Section list

```html
<nav aria-label="Sections">
  <ul>
    <li><a href="#/materials"><b>Mat</b>erials</a></li>
    <li><a href="#/definition"><b>D</b>efinition</a></li>
    <li><a href="#/relations"><b>R</b>elations</a></li>
    <li><a href="#/engineering"><b>E</b>ngineering</a></li>
    <li><a href="#/analysis"><b>A</b>nalysis</a></li>
    <li><a href="#/manual"><b>M</b>anual</a></li>
    <li><a href="#/supports"><b>S</b>upports</a></li>
  </ul>
</nav>
```

`<b>` carries weight without implying importance to AT. Items at `--text-base`,
gap `--space-5`. States per DESIGN_SYSTEM_PROPOSAL §4.

Routes are unchanged: the existing `routes.ts` paths and labels drive this list;
only the rendering of the label changes (split at a known initial length per
route). The initial length is data — `Materials: 3`, all others `1` — and belongs
next to the route definition, not hard-coded in the component.

### Below 900px

Wordmark plus a `Sections` disclosure button (`aria-expanded`, `aria-controls`)
opening a full-height sheet with the seven sections and the system selector.
Focus trapped; `Escape` closes and restores focus.

---

## 3. Tetrahedron rendering approach

### Comparison

| Approach | Visual quality | Leader line | Accessibility | Complexity | Bundle |
| --- | --- | --- | --- | --- | --- |
| **SVG + hand-written projection** | Crisp at any DPR; exact 1px strokes; dash patterns native; CSS-themable | **Projected vertex coordinates are already in JS, in the same coordinate space as the line** | SVG hidden; real DOM buttons overlaid | ~60 lines of maths | **0 KB** |
| CSS 3D transforms | Good for faces, poor for edges (edges must be faked as rotated elements); labels need counter-rotation | Screen coordinates require re-deriving the same matrices anyway, or `getBoundingClientRect` probing | Poor; the structure is decorative divs | High, and fragile | 0 KB |
| Canvas 2D | Good; manual DPR handling; no CSS theming of strokes | Available, but the line must be drawn in canvas or re-projected into DOM | **Nothing is in the DOM**; a full parallel layer is required regardless | Medium | 0 KB |
| WebGL / three.js | Excessive for 4 vertices and 6 edges; crisp 1px lines are actually *harder* | Needs explicit projection and unprojection | Nothing in the DOM; full parallel layer required | High | **~150 KB+ gzipped** |

### Decision: inline SVG with a hand-written projection, no dependency

Reasons, in order of weight:

1. **The leader line decides it.** The requirement is a dynamically positioned
   line from a rotating 3-D vertex to a DOM panel. SVG hands over the projected
   2-D coordinate as a by-product of drawing the vertex, in the same coordinate
   system the line is drawn in. Every other approach requires re-deriving that
   coordinate separately.
2. **`AGENTS.md` requires measuring before adding a graph or animation
   dependency.** Four vertices and six edges cannot justify a WebGL runtime; the
   maths is about sixty lines.
3. **Crisp hairlines.** The direction is a precision line drawing. SVG gives
   exact 1px strokes and native `stroke-dasharray` for the occluded edges at any
   device pixel ratio.
4. **Theming.** Strokes take `currentColor` and CSS custom properties, so the
   figure inherits the token system and reduced-motion styling for free.
5. **Honest cost.** WebGL would be chosen for shading, lighting or thousands of
   elements. The figure has none of those and should not have them.

The same projection module is reusable for the Relations graph if a 3-D view is
ever wanted, so this is not a throwaway.

---

## 4. Geometry and projection

### Vertices

A regular tetrahedron as four alternating vertices of a cube, normalised to unit
circumradius:

```ts
const R3 = Math.sqrt(3)
const VERTICES = [
  [ 1/R3,  1/R3,  1/R3],   // 0
  [ 1/R3, -1/R3, -1/R3],   // 1
  [-1/R3,  1/R3, -1/R3],   // 2
  [-1/R3, -1/R3,  1/R3],   // 3
] as const

const EDGES = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]] as const
```

Verified: all six edge lengths equal (2·√2⁄√3 in normalised units), centroid at
the origin, circumradius exactly 1. Scaling by `R` therefore puts every vertex
`R` pixels from the centre before projection.

### Corner mapping

| Index | Concept |
| --- | --- |
| 0 | Performance |
| 1 | Structure |
| 2 | Processing |
| 3 | Property |

Chosen so that at the resting yaw the four labels fall into four distinct
quadrants with no collisions. **This mapping is a design parameter, not a
scientific claim**, and should be confirmed with the research team — see §12.

### Projection

```ts
interface Projected { x: number; y: number; z: number; k: number }

function project(
  v: readonly [number, number, number],
  yaw: number,    // radians, animated
  tilt: number,   // radians, constant
  R: number,      // circumradius in px
  cx: number, cy: number,
): Projected {
  let [x, y, z] = v
  // 1. spin about Y
  ;[x, z] = [x * Math.cos(yaw) + z * Math.sin(yaw),
            -x * Math.sin(yaw) + z * Math.cos(yaw)]
  // 2. fixed tilt about X
  ;[y, z] = [y * Math.cos(tilt) - z * Math.sin(tilt),
             y * Math.sin(tilt) + z * Math.cos(tilt)]
  // 3. scale
  x *= R; y *= R; z *= R
  // 4. weak perspective
  const d = CAMERA_DISTANCE * R          // CAMERA_DISTANCE = 6
  const k = d / (d - z)
  return { x: cx + k * x, y: cy - k * y, z, k }   // SVG y grows downward
}
```

Constants:

```
tilt            = -16°  (viewer looks slightly down on the figure)
CAMERA_DISTANCE = 6R
R               = see §5 (responsive)
```

`CAMERA_DISTANCE = 6R` was chosen by measurement: across a full revolution the
scale factor `k` stays within **0.864 – 1.187**, a gentle ±16% depth cue that
reads as three-dimensional without distorting the figure into a dramatic camera
angle. At `4R` the range widens to 0.809 – 1.309, which exaggerates; at `8R` it
narrows to 0.894 – 1.134, which flattens.

**Changed in implementation — extent is per-axis, not radial.** This spec
originally gave a single maximum extent of `0.87·R`. That is the *per-axis*
figure; the maximum **radial** distance is `1.014·R`, because a vertex reaches
further on a diagonal. Since the stage is a rectangle, sizing uses the per-axis
bounds, which were measured over a full revolution:

```
MAX_EXTENT_X = 0.847
MAX_EXTENT_Y = 0.871
maximum radial = 1.014   (recorded so the two are never confused again)
```

All three are asserted in `tests/tetrahedron.test.ts`, both as upper bounds (or
the figure clips) and as tight bounds (or the figure is drawn smaller than it
could be).

### Depth-derived appearance

| Quantity | Rule |
| --- | --- |
| Vertex radius | `9 * k` px at rest, `11 * k` when active, clamped to `[6, 14]` |
| Vertex stroke | `--ink` when `z ≥ 0`, `--ink-3` when `z < 0` |
| Edge occlusion | An edge is "back" when its midpoint `z < 0`. Back edges: `--ink-3`, `stroke-dasharray: 5 4`. Front edges: `--ink`, solid. |
| Paint order | Render back edges, then front edges, then vertices sorted ascending by `z`, so near vertices overlap far ones |

This reproduces the convention already drawn correctly in the supplied sketch.

### Rotation

```ts
const PERIOD_MS = 60_000              // one revolution per 60 s
yaw = (elapsedMs / PERIOD_MS) * 2 * Math.PI
```

Time-based, not frame-count-based, so the speed is identical at 60 Hz, 120 Hz and
after a dropped frame. 6°/s is slow enough to read as deliberate and fast enough
that occlusion changes are perceptible.

---

## 5. Stage layout

### Desktop (≥ 1200px)

Three zones separated by 1px `--rule-2` vertical rules:

| Zone | Width |
| --- | --- |
| System rail | `--rail` (13.5rem) |
| Tetrahedron stage | fluid |
| Explanation panel | `26rem` |

The stage height is `calc(100vh - 96px - 72px)` (header, provenance strip),
minimum `420px`.

`R = clamp(140px, min(stageWidth, stageHeight) * 0.30, 210px)`, measured with a
`ResizeObserver` on the stage element. The SVG `viewBox` matches the stage box in
CSS pixels so SVG units equal CSS pixels and no coordinate conversion is needed
for the DOM control overlay.

### Labels

Each corner label is a DOM element (not SVG text), so it uses `--text-label`,
wraps properly, and is part of the control (§6). It is positioned by offsetting
from the projected vertex **along the vector from the projected centroid**, so
labels always sit outboard of the solid and never overlap an edge:

```ts
const dx = p.x - cx, dy = p.y - cy
const len = Math.hypot(dx, dy) || 1
const LABEL_OFFSET = 26
labelX = p.x + (dx / len) * (vertexRadius + LABEL_OFFSET)
labelY = p.y + (dy / len) * (vertexRadius + LABEL_OFFSET)
```

The label element is translated so its edge nearest the centre meets that point:
`transform: translate(-50%, -50%)` plus a per-quadrant nudge derived from
`Math.sign(dx)` and `Math.sign(dy)`.

---

## 6. Interaction model and accessibility

### The control layer

The SVG is `aria-hidden="true"` and purely presentational. Interaction is carried
by **four real `<button>` elements** in an overlay, positioned each frame by
`transform: translate3d(...)`. SVG interactive elements have inconsistent screen
reader and keyboard support; buttons do not. `translate3d` is a compositor
operation, so moving them costs no layout.

### ARIA pattern

The four corners form a **tab list**, with the explanation panel as the tab
panel:

```html
<div role="tablist" aria-label="Materials tetrahedron" aria-orientation="horizontal">
  <button role="tab" id="tab-processing"  aria-selected="true"  aria-controls="corner-panel" tabindex="0">Processing</button>
  <button role="tab" id="tab-structure"   aria-selected="false" aria-controls="corner-panel" tabindex="-1">Structure</button>
  <button role="tab" id="tab-property"    aria-selected="false" aria-controls="corner-panel" tabindex="-1">Property</button>
  <button role="tab" id="tab-performance" aria-selected="false" aria-controls="corner-panel" tabindex="-1">Performance</button>
</div>
<section role="tabpanel" id="corner-panel" aria-labelledby="tab-processing" tabindex="0">…</section>
```

This makes the corner-to-explanation relationship explicit to assistive
technology, which a decorative diagram plus a loose text box cannot.

### Keyboard

| Key | Action |
| --- | --- |
| `Tab` | Enter the tab list (roving tabindex: one stop for all four) |
| `←` `→` `↑` `↓` | Move selection between corners, wrapping |
| `Home` / `End` | First / last corner |
| `Enter` / `Space` | Select (already selected on arrow in automatic activation) |
| `Escape` | Resume automatic cycling |
| `Tab` again | Into the panel, then to the Pause control |

### Pointer

- Click or tap a vertex glyph or its label selects that corner.
- Hover a glyph: stroke to 2px, scale 1.08, over `--motion-instant`. Hover alone
  never changes the selection.
- Touch: each glyph carries an invisible 44×44px hit area via a transparent
  `<rect>` in the overlay button.

### Rotation pausing

Rotation pauses — and auto-cycling stops — when any of these is true:

| Condition | Why |
| --- | --- |
| Pointer is over the stage | Lets the user aim at a moving target |
| Focus is within the stage (`:focus-within`) | Keeps keyboard targets still |
| The user has selected a corner manually | Required behaviour |
| `prefers-reduced-motion: reduce` | Required behaviour |
| Stage is off-screen (`IntersectionObserver`) | Performance |
| `document.hidden` | Performance |

A manual selection stops auto-cycling **permanently** until the user presses
Resume or `Escape`. Hover and focus pause it only while they last.

### Pause control

A visible, labelled button beneath the panel: `Pause rotation` / `Resume
rotation`, with an `aria-pressed` state and real text (not an icon alone).
Required by `AGENTS.md`. A second control, `Auto-advance: on / off`, governs
corner cycling separately from rotation, because a user may want the figure still
but the explanations advancing, or the reverse.

---

## 7. Automatic cycling

### Order

Fixed: **Processing → Structure → Property → Performance → Processing**. This
follows the conventional ordering of the materials paradigm. It is not presented
as a causal claim and no arrowheads are drawn (§11).

### Timing

```
--tetra-dwell: 4500ms       time a corner stays active
--tetra-handoff: 320ms      crossfade + leader retarget, inside the dwell
```

**The supplied concept specifies "approximately once per second". That is
proposed to change, and it is the one behavioural recommendation here that
departs from the brief.** One second is less than the time required to read a
concept name, a definition sentence and a materials example; the panel would
become a flicker and users would learn to ignore it, which defeats the purpose of
the element. 4.5 s is roughly the reading time of a 20–25 word definition plus a
short example.

The value is a token, so changing it is a one-line edit. If a faster cadence is
wanted, the honest alternative is to keep the ~1 s *highlight* sweep purely as a
visual rhythm on the figure while the panel updates at a slower, separate
interval — but that splits the leader line's referent from the panel's content
and is not recommended. See §12.

### Announcement

During automatic cycling the panel is **not** announced
(`aria-live="off"`) and focus is never moved; a panel that announces itself every
few seconds is unusable with a screen reader. Once the user interacts, cycling
stops and selection is user-driven, at which point the standard tab pattern
announces changes naturally.

---

## 8. The leader line

### Routing

Stepped, right-angled (Manhattan) routing, matching the supplied sketch and
independently matching Andrew Trousdale's node map.

Given the active vertex projected at `(vx, vy)` with radius `r`, and the panel
anchor notch at `(ax, ay)`:

```
start  = (vx + (r + 6) * dir, vy)          dir = sign(ax - vx)
elbow  = clamp(vx + (ax - vx) * 0.45,
               vx + r + 30 * dir,
               ax - 30 * dir)              along x
points = start → (elbow, vy) → (elbow, ay) → (ax, ay)
```

Rendered as a single `<polyline>` with `stroke-linejoin: miter` (square corners —
the figure is a technical drawing), 1.5px `--select`, `fill: none`.

If `|vy - ay| < 8`, the middle two points collapse and the line is drawn
straight, avoiding a degenerate 1px jog.

**Changed in implementation — exit direction, and a tighter elbow.** Two
corrections came out of looking at the result:

- The elbow fraction is **0.72**, not 0.45. At 0.45 the long vertical run cut
  across the middle of the figure; at 0.72 it hugs the panel edge, where it
  reads as part of the panel rather than as a line through the drawing.
- When the active vertex is on the **far side of the figure from the dock**,
  the leader now leaves the node **vertically** instead of horizontally
  (`exitVertical`). Leaving horizontally dragged the line straight across the
  tetrahedron, over the other three vertices. Leaving vertically puts the long
  horizontal run at the dock's height, clear of the figure. The test is simply
  `sign(dock.x − centre.x) === sign(centre.x − node.x)`.

### Animation

The polyline is recomputed **every frame** from the live vertex position, so it
stays attached to the rotating corner with no lag. Only the *target anchor*
eases when the active corner changes:

```ts
anchorY += (targetAnchorY - anchorY) * (1 - Math.exp(-dt / 90))
```

A frame-rate-independent exponential approach over roughly `--motion-base`. The
result is that the line's panel end glides to its new dock while its node end
tracks the vertex exactly.

### Panel anchor

The panel's 1px left border carries an 8px notch in `--select` at the dock point.
The anchor Y is the vertical centre of the panel's title block, so the line
always arrives at the heading it explains — not at an arbitrary edge midpoint.

### Why the panel does not move

The supplied sketch places the explanation box beside the active corner. A box
that relocates every cycle forces the reader to re-find it four times per
rotation and resets reading position mid-sentence. **The panel holds a fixed
position; only its content changes and the leader re-routes.** The leader line is
what communicates "this box is about *that* corner", which is precisely the job
the sketch invented it for.

---

## 9. Explanation panel

### Composition

```
STRUCTURE                          ← --text-label, --select-ink, mono uppercase
─────────────────────────────────  ← 1px --rule-2
Structure                          ← --text-h3, --ink
<definition paragraph>             ← --text-prose, serif, --ink, 48ch
EXAMPLE                            ← --text-label, --ink-2
<example paragraph>                ← --text-sm, sans, --ink-2
─────────────────────────────────  ← 1px dashed --rule-2
SOURCE   <provenance>              ← --text-label / --text-data
```

Panel is `--surface` with a 1px `--rule-2` border, padding `--space-6`, zero
radius, no shadow.

### Content transition

On corner change:

1. Outgoing content: `opacity 1 → 0` over `140ms`, `--ease-exit`.
2. Incoming content: `opacity 0 → 1` and `translateY(4px) → 0` over `220ms`,
   `--ease-emphasized`, staggered by `40ms` in the order eyebrow → title →
   definition → example.

Under reduced motion both collapse to an instant swap with no translate.

The panel's height is fixed to the tallest of the four contents, measured once on
mount, so the leader line's dock point and the layout never jump between corners.

### Empty state — required

The explanation text and the materials-science example are **content the research
team supplies**. `AGENTS.md` forbids inventing scientific content, so until that
content exists the panel renders:

```
STRUCTURE
─────────────────────────────────
Structure
Explanation pending review.
SOURCE   Not yet supplied
```

The tetrahedron, rotation, selection and leader line all work fully in this
state. The homepage must not ship placeholder science written by the design or
the implementation.

---

## 10. Provenance strip

A metric strip (DESIGN_SYSTEM_PROPOSAL §5) pinned to the bottom of the stage:
five cells divided by 1px `--rule-2` vertical rules. Field names are taken from
`docs/WEB_DATA_CONTRACT.md`; nothing is renamed, scored or derived beyond
counting.

| Cell | Label | Value | Source |
| --- | --- | --- | --- |
| 1 | `SYSTEM` | `RHEA` or `Ni Superalloy`, or `—` | `system` |
| 2 | `RELEASE` | release identifier, or `—` | `source.release` |
| 3 | `NODES` | integer, or `—` | `nodes.length` |
| 4 | `RELATIONS` | integer, or `—` | `relations.length` |
| 5 | `EVIDENCE` | `r / u / d` integers, or `—` | counted over `scientific.evidenceReview` |

The rail (DESIGN_SYSTEM_PROPOSAL §4) carries the full block — contract version,
mapper, source contract, source graph SHA, approval ID and approval date. The
strip is the summary; the rail is the record. Neither invents a field.

Three naming constraints, each required by the contract rather than by taste:

- **`EVIDENCE` is a count, never a score.** It renders three integers labelled
  `REVIEWED / UNREVIEWED / DISPUTED`, not a percentage, grade, bar or badge.
  A proportion would imply a quality judgement the contract does not support,
  and the contract states plainly that `reviewed` alone is not a claim of
  verified truth.
- **There is no `VALIDATED` cell.** An earlier draft of this spec had one; it
  was wrong. The only date the contract carries is `publication.approvedOn`,
  which is an *approval* date. Labelling it "validated" would conflate
  publication approval with scientific verification, which `AGENTS.md` and the
  contract both require be kept separate. It appears in the rail as
  `APPROVED ON`.
- **`RELEASE` is never captioned as a dataset description.** It is an opaque
  upstream identifier and is shown as such.

When no approved export is loaded, every value is `—` and a sixth full-width row
beneath reads, in `--text-label` at `--ink-2`:

```
STATUS   No approved public export is loaded. The figure above is the
         conceptual materials tetrahedron and carries no release data.
```

The second sentence matters: without it, a four-cornered scientific diagram
sitting above a provenance strip invites the reading that the diagram came from
the release. It did not, and the page says so.

When a pin or a release is present but loading or validation fails,
`loadApprovedGraph()` throws a `GraphDataError` carrying a stable error code.
`STATUS` renders that code and its message in `--select-ink` behind a dashed
`--select` left bar, and the specific failing field is marked in place in the
rail block — so an export-digest mismatch, a release-identity mismatch, an
unsupported contract version, a dangling reference or a missing approval is
attributable at a glance rather than described in prose. The strip never falls
back to partial or cached values.

This is the design's direct answer to the `AGENTS.md` requirements to validate
before use, fail visibly, and keep publication approval distinct from scientific
verification. It is adapted from Overbrowsing's self-reporting chrome.

---

## 11. Scientific constraints on the figure

The tetrahedron is a **conceptual figure, not a data view.** It depicts the
materials paradigm itself and is drawn identically whether or not a release is
loaded. Nothing about it is derived from `public/data/`, and the constraints
below exist to keep that distinction legible.

- Exactly four vertices: Processing, Structure, Property, Performance. No fifth
  centre element unless the research team specifies one.
- **All six edges are rendered undirected — no arrowheads.** This is a statement
  about *this figure*, not about the graph. `docs/WEB_DATA_CONTRACT.md` does
  carry an explicit `direction` field (`directed` or `undirected`) on every
  relation, and the Relations and Engineering views must render each relation
  exactly as its own `direction` states. But no relation record backs these six
  edges, so drawing arrowheads here would assert a causal ordering of the
  paradigm that no supplied data expresses — and `AGENTS.md` forbids inferring
  relations. If the research team specifies direction for the paradigm itself,
  a directed variant can be specified then.
- The fixed cycle order (Processing → Structure → Property → Performance, §7) is
  a **reading sequence for the explanations, not a causal claim.** It must not be
  reinforced with arrowheads, motion along edges, or numbering of the corners.
- No edge is weighted, highlighted or styled by importance.
- Labels use the research team's terminology verbatim. "Property" (singular, as
  in the supplied concept) is kept; it is not silently normalised to
  "Properties".
- The figure is never captioned in a way that implies it is derived from the
  loaded release, and it sits above a provenance strip that says so explicitly
  when nothing is loaded (§10).
- The explanation and example text are supplied by the research team. Until they
  exist, the panel shows its empty state (§9). No placeholder science ships.

---

## 12. Responsive behaviour

### ≥ 1200px

Three zones as §5.

### 1024 – 1199px

Panel narrows to `22rem`; `R` recomputes from the stage box; routing unchanged.

### 900 – 1023px

Rail narrows to `11rem`. Panel remains to the right at `20rem`; if the stage
width would fall below `360px`, the layout switches to the stacked arrangement
below.

### 640 – 899px (stacked)

- Rail collapses into the header disclosure.
- Stage becomes full-width with a fixed `1 / 1` aspect ratio, `R` from `§5`.
- Panel moves **below** the stage, full width.
- The leader line becomes a short vertical stem: from the active vertex straight
  down to a notch centred on the panel's top border, with a single elbow only if
  the horizontal offset exceeds `24px`.
- Corner labels shorten to the concept name only if they would collide; the
  collision test is a bounding-box check against the other three labels.

### < 640px — chip mode

**Changed in implementation.** The spec treated the label fallback as a
collision case. Measurement showed it is unconditional at phone width: a
horizontal label needs roughly `r + 10 + 2·halfWidth ≈ 100px` of clearance on
each side, and at 390px there is simply no room left for the figure. So below
640px the figure enters **chip mode**:

- The four corner labels leave the figure and become a row of chip buttons
  pinned to the bottom of the stage. They are the *same* four `role="tab"`
  buttons — the tab list is never duplicated — only their layout changes.
- The SVG's drawing box is inset by the chip strip (`inset: 0 0 3rem`), and the
  `ResizeObserver` watches the SVG rather than the stage, so `R` is computed
  from the space the figure actually has.
- **The leader docks to the active chip**, not to the panel: in chip mode the
  chip *is* the corner's label, so the leader connects node to label exactly as
  it connects node to panel on desktop. Running it on to the panel would mean
  crossing the chip row, which is noise rather than meaning. The panel's dock
  notch is hidden in this mode.
- The node glyphs become presentational at this width; selection is by chip.
  Tapping a ~22px circle is below the 44px touch target anyway, so nothing
  usable is lost.
- Provenance strip stacks to one column, and the system rail collapses to a
  one-line context bar with the provenance detail behind a disclosure
  (otherwise the rail consumed the entire first screen on a phone).

### Touch

Rotation does **not** pause on touch-hover (there is none). It pauses on the
first `touchstart` within the stage, consistent with "manual selection pauses
automatic cycling".

---

## 13. Reduced motion

Detected with `window.matchMedia('(prefers-reduced-motion: reduce)')` **in
JavaScript**, with a `change` listener, because the figure is driven by
`requestAnimationFrame` where a CSS media query has no effect. A mid-session
preference change takes effect immediately, without reload.

Under `reduce`:

| Behaviour | Under reduce |
| --- | --- |
| Rotation | Stopped. Rendered once at a fixed `yaw = 24°`, chosen so all four vertices are separated, no edge is degenerate, and no two labels collide. |
| `requestAnimationFrame` loop | Not started. Re-render only on selection change or resize. |
| Automatic cycling | Does not start. Processing is selected initially. |
| Leader line | Repositions instantly on selection; no easing. |
| Panel content | Instant swap; no fade, no translate. |
| Vertex hover | Stroke weight change only; no scale. |
| Pause control | Reads `Rotation off (reduced motion)` and is disabled, with the reason as visible text rather than a tooltip. |

Nothing becomes unavailable under reduced motion. Every corner remains
selectable, every explanation readable, the leader line still shows the
relationship. Only the movement is removed.

---

## 14. Performance

Per frame, the loop writes: 4 button transforms, 4 label transforms, 6 edge
coordinate pairs, 4 circle `cx`/`cy`/`r`, and one polyline `points` — roughly 40
attribute writes. No layout is triggered (button and label movement uses
`translate3d`; SVG geometry attributes do not reflow the document).

Budget and guards:

- Single shared `requestAnimationFrame` loop for the whole figure; never one per
  element, and never a React state update per frame — write to refs directly and
  let React own only the *selected corner*.
- Loop suspended by `IntersectionObserver` when the stage leaves the viewport and
  by `visibilitychange` when the tab is hidden.
- `R` recomputed only on `ResizeObserver` callbacks, debounced to one frame.
- No new dependency. Projection, easing and routing are local modules.
- Target: < 1ms scripting per frame on a mid-range laptop; measure with the
  Performance panel before merge and record the figure in the handoff.

### Proposed file placement

Consistent with `docs/ARCHITECTURE.md`:

```
src/components/graph/Tetrahedron.tsx        figure, SVG + control overlay
src/components/graph/useTetrahedron.ts      rAF loop, yaw, selection, pausing
src/components/graph/projection.ts          vertices, edges, project(), pure
src/components/graph/LeaderLine.tsx         routing + polyline
src/components/ui/MetricStrip.tsx           provenance strip (shared)
src/pages/HomePage.tsx                      composition only
```

`projection.ts` is pure and synchronous, so it is unit-testable without a DOM:
edge-length equality, centroid at origin, `k` range across a revolution, back/front
edge classification, and leader-line degenerate-case collapse are all testable as
behaviour, which is what `AGENTS.md` asks of tests.

---

## 15. Status and open questions

Approved and built: 4.5 s dwell, 60 s per revolution, inline SVG with a custom
projection, stepped leader line, manual selection stopping auto-advance,
visible pause controls, reduced-motion handling, and the three-zone layout.

Verified in a browser (Chrome, via CDP) rather than only in unit tests:

| Check | Result |
| --- | --- |
| Tab order | skip link → wordmark → seven sections → system radio → tetrahedron tab list → panel → controls |
| Focus ring | `rgb(200, 67, 30)` at 2px, `:focus-visible` true |
| Arrow keys | move selection, focus follows, `Home`/`End` jump to first/last |
| Panel wiring | `aria-labelledby` follows the active tab |
| Manual selection | stops auto-advance; the control relabels to "Resume auto-advance" |
| Mobile sheet | opens, traps focus, `Escape` closes and restores focus to the toggle |
| System selector | switches between RHEA and Ni Superalloy |
| Reduced motion | figure still at `STATIC_YAW`, auto-advance never starts, controls disabled with the reason as visible text |
| Console | clean at 1440×900 and 390×844 |

Still open:

| # | Question | Note |
| --- | --- | --- |
| 1 | Explanation and example text | Must come from the research team. The pending-review state ships until then; no placeholder science. |
| 2 | Corner-to-vertex mapping | Chosen in §4 for label separation; confirm no scientific convention is violated. |
| 3 | Paradigm edge direction | Edges render undirected (§11). Relation-level direction comes from the contract's `direction` field and is unaffected. |
| 4 | "Property" vs "Properties" | Kept verbatim from the supplied concept. |
| 5 | Provenance fields | Use `docs/WEB_DATA_CONTRACT.md` names verbatim; confirm the `v0.1-draft` contract is current before the loader is wired in. |
| 6 | Active-corner label vs leader | When the active vertex sits on the dock side, its label and the leader's first segment can run close together. Legible, but a label-nudge rule would tidy it. |


---

## 16. Refinement round — 2026-10-25

A visual review of the rendered page at all three viewports. Four of these were
defects that only measurement revealed; the rest are art direction.

### Reported issue: "extremely faint text in the explanation panel"

**Not a defect in the page.** Measured on the live DOM with auto-advance paused
and all animations forced to completion:

```
.corner-panel__fade   opacity 1, animation corner-enter finished
.corner-panel__body   rgb(94,100,104)  = --ink-2  = 5.55:1
.corner-panel__title  rgb(22,24,26)    = --ink    = 16.46:1
.corner-panel__eyebrow rgb(147,48,26)  = --select-ink = 7.25:1
```

The faintness was an artefact of the **review pipeline**: screenshots were being
downscaled from 1440px and saved as JPEG, which washes out 14px grey text on a
near-white ground. Captures are now taken at `deviceScaleFactor: 2` and reviewed
as PNG at native resolution, where the panel is plainly legible.

Two genuine readability points were fixed anyway (below).

### Defects found by measurement

| Defect | Cause | Fix |
| --- | --- | --- |
| Panel apparatus floated mid-sheet with 263px of slack beneath it | `.corner-panel__dashed` set `margin-top: auto` and then `margin: 0`, and the shorthand silently reset it | `margin: auto 0 0` |
| A non-active vertex could render **larger** than the active one | A fixed +2px boost was applied *before* perspective; perspective varies radius by ±16%, so k=1.187 inactive beat k=0.864 active | Scale the projected radius by 1.5 instead. Pinned by a test that sweeps the full revolution |
| Figure ~40% smaller than necessary on phones | `LABEL_PAD_X = 84` reserved label clearance in chip mode, where no labels sit beside the figure | `CHIP_PAD_X/Y = 16` in chip mode |
| Figure capped below the available space | `R_MAX = 230` was binding on desktop *and* tablet | `R_MAX = 268` |

### Art-direction changes

- **Line hierarchy.** Front edges 1.0 → **1.3px**; occluded edges stay 1px and
  `--ink-3`. The drawing now has weight without any glow or fill.
- **Active vertex reticle.** A hairline `--select` ring at `r + 6`, 55% opacity.
  Flat, geometric, instrument-like — it reads as *targeted* rather than merely
  filled.
- **Pending state.** Was italic serif prose, which could be mistaken for the
  definition it stands in for. Now a ruled, labelled status block:
  `EXPLANATION PENDING REVIEW` in mono `--select-ink` over a `--ink-2`
  explanation. Secondary in weight, not in contrast. No invented science.
- **Empty values.** `--ink-3` (2.91:1) → `--ink-2` (5.55:1). "Not yet supplied"
  and the em-dashes carry information — that there is none — so disabled-level
  contrast was wrong.
- **Provenance compaction.** Seven rows of em-dashes became a one-line summary
  (`■ No approved export`) plus an `All fields` disclosure, at every width.
  Nothing is removed: all seven contract-named fields render in the DOM and are
  one click away. This reclaimed roughly 300px of the desktop rail.
- **Standfirst.** The homepage now says what MatDREAMS *is* — "organises
  materials-science terminology and the evidence connecting it, one material
  system at a time" — ahead of how to operate the figure.

### Leader-line routing

- **Dock clamping.** The SVG draws with `overflow: visible` so the leader can
  reach the panel; an unclamped dock let the horizontal run cross the heading
  and standfirst. The dock's y is now clamped to
  `[14, svgHeight − 14]`, which makes that collision impossible at any viewport
  or copy length. The panel notch is driven from the same number, so the two
  stay together.
- **Stacked dock follows the vertex.** On tablet the leader ran a long diagonal
  dog-leg from the active corner to the panel's horizontal midpoint. The dock x
  now tracks the active vertex, clamped 48px inside the panel, so the stem drops
  near-vertically and short.

### Stacked layout

| | Before | After |
| --- | --- | --- |
| Figure aspect | `1 / 1`, max 60vh, max-width 38rem | `7 / 6`, max 56svh, max-width **44rem** |
| Mobile context bar | 174px tall | 139px, heading on its own line, summary and disclosure inline |
| Mobile panel head | Title at y=839 on an 844px viewport | Title at **y=810** — visible without scrolling |

The tetrahedron was *not* shrunk to achieve this: on mobile its radius rose from
132 to 154 while the panel came into view.

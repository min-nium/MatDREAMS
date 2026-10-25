# Design directions

> **Status: decided, 2026-10-25.** Direction A ("Instrument Plate") is the
> approved system, with Direction B's Dark Field scoped to the graph
> visualization surfaces in Relations and Engineering. English only for the
> initial release. The homepage built on this decision is specified in
> [HOMEPAGE_DESIGN_SPEC.md](HOMEPAGE_DESIGN_SPEC.md) and implemented in
> `src/`. The comparison below is kept as the record of why.

Three distinct visual directions for MatDREAMS, a recommendation, and the
reasoning. These were proposals for review; the recommendation was accepted. Evidence for the
reference claims is in [REFERENCE_ANALYSIS.md](REFERENCE_ANALYSIS.md).

## What the directions have to satisfy

Before the directions, the constraints they are judged against:

1. **MatDREAMS is an instrument, not a brochure.** Researchers, engineers and
   students will return to it with a task. Identity matters, but repeat
   usability matters more. This rules out scroll choreography and hero
   theatrics regardless of how good they look once.
2. **The pages have genuinely different jobs.** Definition is long-form reading.
   Relations is a dense interactive graph. Analysis is quantitative. Materials
   is an index. Manual and Supports are documentation. A single card template
   applied to all seven would be a failure, not a consistency.
3. **Colour is a scarce scientific resource.** Evidence status, uncertainty,
   relation direction and convergence all want colour. Every hue spent on
   decoration is one unavailable for meaning.
4. **The site must be able to say "I don't know".** `AGENTS.md` requires visible
   failure on unsupported contracts, mismatched release identity, and absent
   approval, and requires that uncertain data not be displayed as verified fact.
   Empty, loading, failed-validation and `unreviewed`/`disputed` evidence
   states are primary design states here, not edge cases.
5. **Two existing ideas are worth keeping.** The acrostic wordmark-as-navigation
   (**Mat**erials / **D**efinition / **R**elations / **E**ngineering /
   **A**nalysis / **M**anual / **S**upports) and the persistent material-system
   selector. All three directions preserve both.
6. **No new dependencies, and licensable type.** The references lean on
   commercial faces (Brunswick Grotesque, ABC Diatype, Tobias, Graphik,
   Circular). Each direction below names SIL OFL alternatives.

---

## Direction A — "Instrument Plate"

### Concept

The page as a precision instrument faceplate or an engineering drawing sheet.
Structure comes entirely from 1px hairline rules, exact alignment and controlled
negative space — never from boxes, shadows or rounded containers. Warm paper
ground. Nothing is decorated; everything is *labelled*. The visual promise is
calibration: this thing was measured, and it will tell you what it knows and what
it doesn't.

The closest references are Normal Computing's hairline metric strip,
Material-Archiv's ruled column scaffold, and Trousdale's panel discipline — but
the governing metaphor is the drafting sheet rather than any one of them.

### Typography

Three roles, three faces, all SIL OFL:

- **IBM Plex Sans** — interface, headings, UI. A technical grotesque drawn for
  IBM Research: it has engineering character (the flared stems, the distinctive
  `a` and `g`) without the neutrality that makes Inter read as generated.
- **IBM Plex Serif** — long-form definitions and textbook prose on Definition and
  Manual. Same skeleton as the Sans, so the pairing is sibling rather than
  contrast — appropriate for a reference work.
- **IBM Plex Mono** — every label, eyebrow, unit, identifier, count, node ID and
  numeric value. Tabular figures by default.

The register is set by the mono labels: ~11–12px, uppercase, `0.06em` tracking,
in the secondary ink. Display sizes are large and few. Body runs at 16–17px with
a 66–72 character measure.

### Colour palette

Warm achromatic ground, near-black ink, one accent reserved for *selection*.

| Role | Value | Use |
| --- | --- | --- |
| Paper | `#F7F6F2` | Page ground |
| Surface | `#FFFFFF` | Panels, raised sheets |
| Ink | `#16181A` | Primary text, active node fill |
| Ink secondary | `#5E6468` | Labels, captions, secondary nodes |
| Ink tertiary | `#8C9296` | Disabled, placeholder, back-face edges |
| Rule | `#DCD8D0` | Hairlines |
| Rule strong | `#B4B0A7` | Section dividers, table heads |
| Select | `#C8431E` | **Only** the currently selected element |
| Select ink | `#93301A` | Accent used as small text (7.1:1 on paper) |

The accent is a vermilion with a materials rationale — oxide, furnace scale,
thermocouple marking — rather than an arbitrary brand colour, and it is
deliberately earthier than Trousdale's `#FF5F1F` or Normal's `#d61912`.

Evidence and uncertainty are encoded **form-first**: solid stroke and filled
glyph for `reviewed`, dotted and hollow for `unreviewed`, dashed and hollow for
`disputed` — using the contract's own three evidence values verbatim. A muted
hue layer reinforces but never carries the meaning alone. This keeps the whole chromatic budget available to the graph.

### Layout

- 12-column grid, 24px gutters, outer margin `clamp(20px, 4vw, 72px)`, app
  maximum 90rem; prose constrained to a 68ch measure *inside* that.
- Structure drawn with 1px rules: a persistent left system rail separated by a
  vertical rule, section dividers as horizontal rules, tabular data ruled rather
  than striped.
- Zero radius everywhere except input affordances — radius used semantically,
  once, the way Material-Archiv uses it.
- Intentional asymmetry: the left rail is fixed at 13.5rem while the working area
  is fluid, so pages are never centred-symmetrical. Headings hang to the rail's
  alignment while prose indents to the content column.

### Navigation

The acrostic refined for legibility. Each section renders as a single word with
its leading letters emphasised — `**Mat**erials`, `**D**efinition` — set inline
at one size, the initial in a heavier weight and full ink, the remainder in
regular at secondary ink. The word stays readable as a word; the acrostic is
visible without being a puzzle. The full `MatDREAMS` wordmark at far left uses
the same emphasis logic and links Home, so the relationship between the name and
the navigation is self-evident.

Permanently visible at desktop. No hamburger. Current section takes the accent on
its initial plus a 2px underline on the whole word (never colour alone).

### Motion

Purposeful only, and fast: `90ms` for hover and focus, `180ms` for state change,
`320ms` for panel and leader-line repositioning, `640ms` for view transitions.
Easing `cubic-bezier(0.2, 0, 0, 1)` as standard and
`cubic-bezier(0.16, 1, 0.3, 1)` for emphasised movement. Nothing animates on
scroll. Nothing loops except the tetrahedron rotation, which has a pause control.

### Homepage composition

Header with the acrostic. Below it the stage fills the remaining viewport: the
left rail carries the system selector and the data-provenance block; the centre
holds the tetrahedron as a precise line drawing — 1px edges, hollow vertex
glyphs, back edges dashed and lighter; the right holds a fixed explanation panel.
A stepped right-angled leader line runs from the active vertex and docks into a
notch on the panel's left edge. Pinned to the bottom of the stage, a
hairline-divided status strip in the Normal Computing pattern: release, nodes,
relations, evidence coverage, last validated — with a defined empty state when no
approved export is loaded. No scrolling required; scrolling reveals a short
orientation section in editorial type.

### Advantages

- Visually distinctive without being costumed; reads as an instrument.
- Preserves the full colour budget for scientific encoding.
- Best possible ground for long-form reading (Definition, Manual) and for
  quantitative display (Analysis).
- Hairline structure genuinely supports different page layouts under one
  identity — an index, a graph, a table and an essay can all be built from rules
  and alignment without a shared card template.
- Prints and screenshots well, which matters for a research tool people cite.
- Cheapest to implement and maintain; no imagery, no gradients, no illustration
  pipeline.

### Disadvantages

- Demands precision. Hairline systems look cheap the moment alignment slips, and
  there is nowhere to hide a sloppy component.
- Less immediately striking than a dark treatment; it earns attention on the
  second visit rather than the first.
- A light ground is the weaker surface for a dense node-link graph, where
  luminous marks on dark separate better.
- Warm paper plus a vermilion accent is a committed look; it will not suit every
  future sub-brand.

### Suitability for scientific graph visualization

**High, with one caveat.** The form-first encoding scheme, the preserved colour
budget and the hairline idiom all transfer directly to a node-link diagram, and
the leader-line technique is native to the direction. The caveat is the light
ground: at high node counts, dark-on-light edge meshes grey out faster than
light-on-dark. This is the specific reason for the scoped recommendation below.

---

## Direction B — "Dark Field"

### Concept

Named for **dark-field microscopy** — a real materials-characterization technique
in which the direct beam is excluded so that only scattered light reaches the
detector, and features appear luminous against a black field. The metaphor is
earned rather than decorative: the site is a dark field in which evidence
scatters into view.

This is the nearest direction to the supplied homepage sketch, executed with
discipline: no starfield, no glow, no gradients. The sketch's star background is
exactly the kind of decorative noise that competes with a data visualization and
depresses contrast; the dark *field* is kept and the texture is discarded.

### Typography

- **IBM Plex Sans** for interface and headings, but at slightly heavier optical
  weight than Direction A, because type on dark grounds appears lighter than the
  same weight on light (a real optical effect that must be compensated, not
  ignored).
- **IBM Plex Mono** for all labels, values and identifiers — the dominant voice
  of the direction. The instrument-readout register.
- **No serif.** Serifs with fine hairlines bloom and smear on dark backgrounds at
  text sizes. Long-form definitions are set in Plex Sans at a slightly increased
  size and line height to compensate for the reduced legibility of light-on-dark
  prose.

### Colour palette

| Role | Value | Use |
| --- | --- | --- |
| Field | `#0E1113` | Page ground (graphite, not pure black) |
| Field raised | `#171B1E` | Panels |
| Rule | `#2A3034` | Hairlines |
| Ink | `#E8EAEA` | Primary text (≈ 15.5:1 on field) |
| Ink secondary | `#9BA3A8` | Labels |
| Ink tertiary | `#646C71` | Disabled, back-face edges |
| Select | `#FF7A3D` | Current selection |
| Data channel 1–4 | reserved | Assigned to scientific encodings only |

Pure black is avoided: `#0E1113` reduces halation around light text and gives
room for a true-black shadow if ever needed. The accent is pushed lighter and
warmer than Direction A's because a mid-chroma vermilion loses separation
against graphite.

### Layout

Same 12-column grid and hairline discipline as Direction A, but rules are
luminous (`#2A3034`) rather than dark, and panels are raised by one step of
lightness rather than by shadow. Negative space reads heavier on dark, so the
spacing scale is increased roughly 15% throughout to prevent the layout feeling
cramped.

### Navigation

The same acrostic treatment, but with the initial in the accent by default rather
than only when active — the sketch's own instinct, which works on dark where it
would be shouting on paper. Active section gets a full-ink word plus an underline.

### Motion

Slower and more deliberate than Direction A — `240ms` / `420ms` / `800ms` — on
the principle that luminous movement on a dark field is more conspicuous and
therefore needs more restraint. Strictly no glow, bloom, pulse or shimmer. Opacity
and position only.

### Homepage composition

The tetrahedron as a luminous wireframe on graphite, visible edges at `#E8EAEA`
and occluded edges at `#646C71`, vertex glyphs hollow and the active one filled
with the accent. The leader line is the brightest element on the page. The panel
is a raised graphite sheet rather than a white card. The status strip divides
with luminous hairlines. This is closest to what the supplied sketch depicts,
minus the stars.

### Advantages

- Maximum separation for node-link graphs; luminous marks on dark hold apart at
  far higher densities than dark marks on light.
- The widest usable chromatic range for data encoding — saturated hues remain
  legible against graphite in ways they do not against warm paper.
- Matches the supplied sketch's intent, and has real scientific grounding rather
  than a borrowed "dark mode is more professional" assumption.
- Reduces eye strain in dim lab or office conditions.

### Disadvantages

- **Poor for long-form reading.** Light-on-dark prose measurably slows sustained
  reading for most readers, and increases halation for readers with astigmatism.
  The Definition page is textbook content and would carry that cost on every
  visit.
- Prints and screenshots badly; a figure exported from a dark site into a paper
  or a slide deck needs rework.
- Contrast compliance across a multi-hue data palette on dark is harder to get
  right and easier to break when new encodings are added.
- Dark is currently the default aesthetic of AI products — the brief explicitly
  warns against assuming it signals professionalism, and a wholly dark MatDREAMS
  risks reading as the generic thing it is trying not to be.
- Doubles the design surface if a light mode is ever required.

### Suitability for scientific graph visualization

**Highest of the three — for the graph canvas specifically.** For every other
page type it is neutral to negative.

---

## Direction C — "Specimen Index"

### Concept

MatDREAMS as a scholarly reference work — a materials lexicon with the authority
of a printed handbook. Editorial serif at display scale, a strict duotone, and
navigation modelled on indices, tabs and running heads rather than on application
chrome. The references here are Stripe Press's editorial register, Overbrowsing's
two-colour discipline, and Material-Archiv's archive structure.

### Typography

- **Newsreader** (Production Type, commissioned by Google Fonts, SIL OFL) as the
  primary voice — a serif with a true optical-size axis, so display settings
  tighten and text settings open automatically. Used for headings *and* body.
- **IBM Plex Mono** for labels, identifiers and data.
- No sans. The contrast in the system is serif against mono, which is a sharper
  and more editorial pairing than serif against sans.

Display headings run very large (up to ~6rem) and are allowed to set the page.
Running heads, folios and section marks borrow from book typography.

### Colour palette

A duotone in the Overbrowsing manner, with alpha steps rather than extra hues:

| Role | Value |
| --- | --- |
| Primary | `#2B2F33` (graphite ink) |
| Primary 50% | `rgb(43 47 51 / .5)` |
| Ground | `#EFEDE6` (warm paper) |
| Ground 50% | `rgb(239 237 230 / .5)` |
| Select | `#7A1F2B` (oxblood) |

Five values. Everything else is derived by opacity.

### Layout

Asymmetric editorial grid: a wide prose column with a persistent narrow margin
column for annotations, citations, units and cross-references — the apparatus of
a scholarly text. A left-edge tick index (Stripe Press's pattern) gives position
within long documents and acts as a scrubber. Entries are ruled, never boxed.

### Navigation

The acrostic set in Newsreader at display weight, functioning as a title page
masthead. Sections behave like book parts; within a section, a running head
persists. The system selector reads as a frontispiece choice ("Edition: RHEA").

### Motion

Minimal and page-like. Cross-fades at `200ms`, no transforms, no parallax. The
tetrahedron rotates but is otherwise the only moving element on the site.

### Homepage composition

A title page. The MatDREAMS acrostic set very large at the top left, a short
statement of purpose in serif beneath it, and the tetrahedron as a precise
engraving-like line figure to the right, with the explanation set as a marginal
note connected by a thin rule. The status strip becomes a colophon line at the
foot of the page: release, counts, approval state, date.

### Advantages

- Immediately distinctive and the least likely of the three to be mistaken for
  generated software.
- The best reading experience of the three; Definition and Manual would be
  excellent.
- The duotone is extremely cheap to maintain and impossible to get wrong.
- Carries scientific credibility through an older and more durable register than
  "tech".

### Disadvantages

- **Fights its own content on three of seven pages.** Relations, Engineering and
  Analysis are interactive and quantitative; a book metaphor has no native
  vocabulary for a force-directed graph, a scenario editor, or a convergence
  plot, and the mismatch would show.
- A five-value duotone is too small a palette for scientific encoding; adding
  data hues breaks the direction's central discipline.
- Serif at UI sizes is harder to keep legible in dense tables and small controls.
- Large editorial display type consumes vertical space a tool cannot spare.
- Newsreader's optical-size axis is a real asset but needs variable-font support
  and careful axis tuning; the axis ranges should be confirmed on the official
  Google Fonts entry before committing.

### Suitability for scientific graph visualization

**Low.** It is the best of the three for reading about science and the worst for
operating on it.

---

## Comparison

| | A — Instrument Plate | B — Dark Field | C — Specimen Index |
| --- | --- | --- | --- |
| Distinctiveness | High | Medium (dark is crowded) | Highest |
| Long-form reading | Excellent | Poor | Excellent |
| Dense graph legibility | Good | Excellent | Poor |
| Quantitative display | Excellent | Good | Fair |
| Colour budget for data | Large | Largest | Very small |
| Accessibility effort | Low | High | Medium |
| Print / figure export | Excellent | Poor | Excellent |
| Implementation cost | Low | Medium | Medium |
| Risk of reading as generated | Low | **High** | Lowest |
| Fits all seven page types | Yes | Three of seven | Four of seven |

---

## Recommendation

**Direction A, "Instrument Plate", as the system — with Direction B's dark field
scoped to the graph canvas only.**

### Why A

Four of the seven sections (Definition, Materials, Manual, Supports) are
primarily reading and indexing, and one (Analysis) is primarily quantitative.
A light, hairline-ruled, mono-labelled system is the strongest ground for all
five, and it is the only one of the three directions that can host an index, an
essay, a table and a graph under a single identity without forcing them into a
shared template — which is exactly what the brief asks for and what a card
system cannot do.

It also protects the scarcest resource. The graph will eventually need to encode
relation direction, evidence review status, convergence behaviour and
user-modified state simultaneously. A direction that spends colour
on identity leaves nothing for that. A reserves essentially the entire chromatic
range for meaning and carries its identity through type, rule and alignment
instead.

And it is honest about failure. `AGENTS.md` requires the site to reject bad data
visibly and to never present unreviewed evidence as verified. A system whose
default voice is a mono label stating a measured fact — adopted from
Overbrowsing's self-reporting chrome and Normal Computing's metric strip — makes
"no approved export is loaded" a legible, designed state rather than an
embarrassment to hide.

### Why not B as the whole site

The materials-science justification for a dark field is real, and the sketch's
instinct is not wrong. But applying it everywhere imposes a permanent reading
penalty on the Definition page, which is textbook content that students will read
at length; it makes multi-hue contrast compliance significantly harder to hold as
encodings accumulate; it exports badly into papers and slides; and — the brief's
own warning — an all-dark interface is now the default costume of AI products,
so it would make MatDREAMS *less* distinctive, not more.

### Why not C

C is the most beautiful of the three and would win on a gallery. It loses on
Relations, Engineering and Analysis, which are the pages that make MatDREAMS
something other than a document. A five-value duotone cannot encode evidence
status and uncertainty, and a book metaphor has nothing to say about an
interactive scenario editor.

### The scoped exception

Relations and Engineering should render their graph **canvas** — the drawing
surface itself, not the surrounding page — on Direction B's graphite field,
inside a hairline frame, with the Direction A chrome unchanged around it.

This is not a compromise between two directions; it is how the instrument the
direction is named after actually works. A microscope is a lit instrument with a
dark field inside it. The page stays paper; the specimen stage is dark. The
switch is bounded, justified by legibility at high node density, and signals
"this is the live exploration surface" without requiring a theme toggle.

Concretely: one additional token set (`--canvas-*`) scoped to the graph
container, with the Direction A accent lightened to `#FF7A3D` inside it for
separation against graphite. Roughly a dozen tokens, not a second theme.

### What this does with the supplied sketch

| In the sketch | Proposed | Reason |
| --- | --- | --- |
| Starfield background | Removed | Decorative noise that competes with data marks and lowers effective contrast. |
| Black page | Graphite, and only on the graph canvas | Keeps the dark-field benefit where it pays; removes the reading penalty where it does not. |
| Yellow leader line | Vermilion accent, same stepped routing | The routing instinct is right and is kept; the hue joins the one-accent system. |
| Dashed hidden edge | **Kept exactly** | Correct 3D occlusion convention, already drawn correctly. |
| Acrostic nav on two lines | One line, initial emphasised | Keeps the device, removes the legibility cost of splitting words across lines. |
| Green initials | Accent on hover/active only | Seven permanently coloured initials spend the accent's meaning; reserving it for state makes selection legible. |
| "Choose your system" rail | **Kept and promoted** | Correct and scientifically honest; extended to carry data provenance. |
| Explanation box beside the active corner | Fixed panel position, leader re-routes | A box that jumps every cycle is disorienting and resets the reader's position. |

Details of the resulting system are in
[DESIGN_SYSTEM_PROPOSAL.md](DESIGN_SYSTEM_PROPOSAL.md); the homepage is specified
in [HOMEPAGE_DESIGN_SPEC.md](HOMEPAGE_DESIGN_SPEC.md).

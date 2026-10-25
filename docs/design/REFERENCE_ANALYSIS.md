# Reference analysis

Design research for MatDREAMS. This document records what was examined, how it
was examined, what is worth transferring, and what is not. It proposes nothing
about MatDREAMS itself; see [DESIGN_DIRECTIONS.md](DESIGN_DIRECTIONS.md).

## Method and evidence

Each site was inspected three ways so that claims rest on evidence rather than
on reputation or industry:

1. Served HTML fetched directly (`curl`), for markup structure and font loading.
2. The site's own stylesheet fetched and parsed, for declared custom properties,
   font stacks, hex values, radii, breakpoints, and transition timings.
3. A rendered screenshot at 1440x900 (headless Chrome), for the composition that
   the markup and CSS actually produce.

Values quoted below are copied from the sites' stylesheets, not estimated from
screenshots. Where a visual judgement is involved it is marked as such.

### Access limitations

| Site | Status |
| --- | --- |
| `heritage-research.org` | **Not accessible.** No DNS record resolves; HTTPS and HTTP both fail (`curl` exit 6). Excluded from analysis; no judgement is offered about it. |
| `press.stripe.com` | Accessible, but the homepage is a long animated canvas; the screenshot captures the opening state only. Conclusions are limited to that state. |
| `andrewtrousdale.com` | Homepage screenshot caught a 3000 ms entry animation mid-fade. A second capture of an interior node page at a longer time budget was used for the analysis. |
| All sites | Only public, unauthenticated pages were examined. No interior application states behind interaction (filter results, deep graph states) were exercised. |

### Minimal Gallery "Research" tag

`https://minimal.gallery/tag/research/` lists 18 entries (17 plus one sponsored
placement). The brief asked for the 4–6 most relevant to MatDREAMS. Selected,
with the reason for selection:

| Selected | Why relevant to MatDREAMS |
| --- | --- |
| Andrew Trousdale | A browsable **knowledge graph** as the primary interface. Closest structural analogue that exists. |
| Material-Archiv | A **materials** reference archive with faceted taxonomy browsing. Closest subject-matter analogue. |
| Normal Computing | Deep-technical credibility without decoration; a **hairline metric strip** pattern directly usable for Analysis. |
| Schema | A **data-visualization** practice; demonstrates chrome/data colour separation. |
| Overbrowsing | A university **research initiative** that reports its own data state in the page chrome. |
| Stripe Press | Editorial typography and a positional **edge index**; the reference for long-form reading. |

Not selected, with reason: SemiconBio (Webflow marketing site for a company,
little structural overlap); Early Studies (strong type — ABC Diatype with Boogy
Brut — but a studio portfolio); Type One Ventures, Marble, Alphatek, Cellular
Agriculture Society, Radical Everything, TRA, RENS (brand/portfolio sites);
Mobbin (sponsored placement); Heritage Research (inaccessible, above).

---

## 1. Andrew Trousdale — `https://andrewtrousdale.com/`

**The single most relevant reference.** It is a personal site in content but a
knowledge-graph browser in structure, and it solves several problems MatDREAMS
has: node typing, relation typing, a persistent detail panel, and leader lines
between a diagram and text.

**Typography.** One family throughout: `"Brunswick Grotesque"` with an
`-apple-system / Helvetica Neue / Arial` fallback. Only two sizes do nearly all
the work — **11px uppercase, `letter-spacing: 0.05em`** for every label, eyebrow,
year group and section heading; **13px (14px at wider viewports),
`letter-spacing: -0.01em`, `line-height: 1.45em`** for body and titles. Node
labels and item subtitles use the same 11px uppercase label style in `#888`.
Body paragraphs use `text-indent: 23px` with no paragraph spacing — a book
setting, not a web setting, and the indent is exactly the width of the
`.item-id` gutter column, so the text block and the list align on one grid.

**Grid and spacing.** A fixed `370px` panel floats over a `100vw/100vh` map
layer. Inside the panel, list rows are a two-column flex: a 23px id gutter and a
290px title column. Gaps are a flat `10px`. The discipline is in the gutter
alignment, not in a large spacing scale.

**Colour.** Four values in 35 KB of CSS: `#111` ink, `#888` secondary,
`rgb(245, 246, 242)` warm off-white ground, and `#FF5F1F` — which appears
**twice**, reserved for the currently-viewed node. Everything else is achromatic.

**Node and relation encoding (the important part).** Node *type* is encoded by
**outline shape** — circle, square, triangle, numbered hexagon — each a 1px
unfilled 20–26px glyph loaded as an SVG background. Node *state* is encoded
separately: `.current-node` is filled and takes the orange; `.connected-node`
and `.secondary-node` take a grey variant; `.highlighted-node` gets a 4px dot
with a `blink 1s infinite` animation. Relation *kind* is encoded by **line
style** — dotted for associative links, solid for the direct ancestry path.
Colour is never asked to carry more than one bit. Lines are axis-aligned with
90-degree elbows (Manhattan routing), not curves.

**Navigation.** Collapsible tabbed sections (Index / Initiatives / Research /
Artifacts / Paths) separated by **1px dashed `#111` rules**, each with a `+` / `−`
indicator that swaps on hover. `.index-link.visited` gets `text-decoration:
line-through` — the site remembers and shows where you have already been.

**Motion.** A consistent signature: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) at
**400 ms** for node/panel repositioning and **800 ms** for panel height and
opacity. Hover scale is `transform: scale(1.1)` over `100ms ease-in-out`. Entry
is a single `mapIn 3000ms forwards`.

**Transfer.** Type-by-shape / state-by-colour / relation-by-line-style; the
one-accent rule; orthogonal leader lines; the dashed-rule collapsible panel; the
expo-out easing; the visited-link memory (valuable for a terminology corpus).

**Do not transfer.** The 11px base size — acceptable for a personal index, too
small for textbook definitions and tabular data. The blinking animation (fails
reduced-motion expectations and reads as an alarm). The fixed 370px panel over a
full-viewport canvas, which leaves no comfortable measure for long-form prose.

---

## 2. Kang Group — `https://kanggroup.io/`

A UC Berkeley materials science and metallurgy group site; the closest
institutional peer. Built as a Vite/React SPA on Replit using Tailwind with the
**shadcn/ui default token set**.

**Typography.** `Source Serif 4` (variable, optical size 8–60, weight 200–900)
paired with `Roboto`. The serif/sans pairing is the strongest thing about it: it
gives academic warmth that a sans-only site does not.

**Colour.** Berkeley institutional palette mapped onto shadcn tokens:
`--primary: hsl(240 95% 10%)` (deep indigo-navy, ≈ `#010132`) and
`--accent: hsl(47 96% 53%)` (California gold, ≈ `#FAC814`), on
`hsl(0 0% 100%)` with `--muted-foreground: hsl(240 3.8% 46.1%)`. Two brand
colours, strictly applied. A full `.dark` token set exists.

**Layout.** `--content-max: 1500px`, `--content-px: clamp(16px, 4vw, 80px)`,
`--nav-height: 64px`, and — revealingly — `--section-h: calc(100vh - 64px)` and
`--hero-h: 100vh`.

**Composition (from the screenshot).** A full-bleed photograph of the Campanile,
the wordmark at large scale centred over it, a letterspaced uppercase subtitle, a
hamburger at top right, a scroll-down chevron, and full-viewport scroll sections
below.

**Honest assessment.** This is competent and institutionally correct, but it is
largely the default stack: shadcn tokens, `--radius: .5rem` rounded cards, a
photographic hero, viewport-height scroll sections, a hamburger menu at desktop
width. The brief asks MatDREAMS to avoid exactly these. It is also an *identity*
site — it tells you who the group is — whereas MatDREAMS is an *instrument*:
people will come to use it, repeatedly, with a task. The layout model does not
carry over.

**Transfer.** The serif/sans pairing as a principle. The two-colour institutional
discipline. The fluid gutter `clamp(16px, 4vw, 80px)`. Nothing else.

**Do not transfer.** The hero-and-scroll-sections model. `--radius: .5rem` on
everything. Hamburger navigation at desktop width — MatDREAMS has seven sections
that must be permanently visible because the acrostic wordmark depends on them.
The shadcn default greys, which are the visual signature of generated software.

---

## 3. Normal Computing — `https://www.normalcomputing.com/`

A deep-tech AI/silicon company. Webflow, but art-directed with unusual
discipline. **The strongest reference for information density done well.**

**Typography.** `Abcdiatype` (ABC Diatype — a contemporary neo-grotesque) as
`--_typography---font--primary-family`, `Abcdiatypemono` for labels, and
`Tobias` — a high-contrast transitional serif — for display headlines. Three
roles, three faces, no overlap.

**Colour.** `--swatch--light: #eceeef` (cool pale grey) as the page ground,
`#1e1d1d` ink, and `--swatch--brand: #d61912` — one red. Supporting values
`#fbfaf7`, `#f7f4ef` (warm papers), `#5d6c7b`.

**Radius.** `--radius--main: 0rem`. The main radius token in the entire system is
zero. `--radius--small: .5rem` exists but is the exception. `--border-width--main:
1px`.

**Layout.** `--container--small` and `--container--full` are both `90rem`;
`--site--gutter: 1rem`; spacing scale `0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 rem`.

**The pattern worth stealing (from the screenshot).** Beneath the hero sits a row
of five cells divided by **1px vertical hairlines**, each containing a tiny
uppercase mono eyebrow (`DEPLOYMENT`, `IMPACT`, `HARDWARE`, `BACKING`,
`EFFICIENCY`), a large serif value (`In Production`, `2x Faster`, `$85M+`), and a
two-line sans caption. No cards, no boxes, no shadows, no radius — the hairlines
alone create the structure. It is dense, scannable, and unmistakably not a SaaS
feature grid. This is directly the component MatDREAMS needs for Analysis
(convergence, uncertainty, reliability) and for a data-provenance strip.

**Navigation.** A compact two-column block of small uppercase mono links at top
left (`ABOUT / RESEARCH / WRITING / SOLUTIONS / ASICS / CAREERS`), set as a text
block rather than a horizontal bar. Proof that primary navigation does not have
to be a centred pill row.

**Transfer.** The hairline-divided metric strip. Zero radius as the default. The
mono-eyebrow / serif-value / sans-caption triplet. Multi-column compact nav. The
3-role type system (grotesque + mono + display serif).

**Do not transfer.** The dark full-bleed atmospheric hero video/photograph —
MatDREAMS has no imagery and should not manufacture any. `#d61912` specifically
(it is theirs). The marketing cadence of the page below the fold.

---

## 4. Material-Archiv — `https://materialarchiv.ch/`

A Swiss physical materials archive, digitised. The closest subject-matter
analogue: a browsable, faceted corpus of material entries.

**Typography.** `Circular` and `CircularMono` (both commercial), with `fixedsys`
for a deliberate pixel-type accent. `--title-font: 300 2.3rem/1.2` — the display
weight is **light**, not bold, which is what keeps a dark page from shouting.

**Colour.** `--black: #141414`, `--grey: #efefef`, `--dark-grey: #727272`,
`--white: #fff`, `--faded: rgba(0,0,0,0.24)`. The chrome is strictly achromatic.
Every saturated colour on the page is a **material sample** — the data carries
all the colour. This is the governing principle of the site.

**Grid.** A responsive **column-count ladder** rather than a fixed grid:
`--tile-col-count` steps `7 → 6 → 5 → 4 → 3 → 2 → 1` across breakpoints, with a
parallel `--featured-col-count: 4 → 3 → 2`. Columns are separated by 1px vertical
rules; each entry is a caption *above* a flush-left image of natural height, so
column bottoms are ragged. The rules are the layout; the content is not boxed.

**Motion.** Named, three-speed: `--crawl: 0.8s`, `--walk: 0.4s`, `--run: 0.2s`
(a second set uses `--slow: 0.5s`, `--fast: 0.3s`). There is also a `rasterboy`
sub-system — `--rasterboy-raster-size: 4px`, 1px borders at
`rgba(0,0,0,0.64)`, a 3px offset — a deliberate print-raster texture.

**Navigation.** A plain-text facet row (`Alle Typen / Materialien / Verfahren /
Konstruktionen / Anwendungen / Events`) with sort controls (`A-Z` / `Relevanz`)
right-aligned on the same baseline. The only rounded element on the page is the
search pill — radius is used once, to mark the one control that accepts input.

**Transfer.** Chrome achromatic, data chromatic. The hairline column scaffold
with caption-above-content and ragged bottoms (ideal for Materials and
Definition — it reads as an index, not as cards). The column-count ladder as the
responsive mechanism. Named motion speeds. Radius used *semantically* — once, to
mark input.

**Do not transfer.** The near-black ground for the whole site (Material-Archiv
can afford it because its content is photographs; MatDREAMS's content is prose
and numbers). The pixel/raster texture, which is a house style. Light display
weights at small sizes, which lose legibility.

---

## 5. Overbrowsing — `https://overbrowsing.com/`

An applied research initiative at the Institute for Design Informatics,
University of Edinburgh.

**Colour.** The most restrained palette examined — **two** colours, declared as
RGB triplets so alpha variants derive from them:

```css
--seaweed: 66, 68, 57;    /* #424439 dark olive */
--laurel: 214, 225, 213;  /* #D6E1D5 pale sage  */
--color-primary: rgb(var(--seaweed));
--color-primary-2: rgb(var(--seaweed), .5);
--color-accent: rgb(var(--laurel));
--color-accent-2: rgb(var(--laurel), .5);
```

Four tokens total. A duotone with two opacity steps carries the entire site.

**Markup.** Genuinely semantic: `<menu>`, `<hr>` as a real section divider,
`<nav>`, `data-heading` attributes. A model for the accessibility requirements in
`AGENTS.md`.

**The idea worth taking.** The header carries a **live status strip** — at
capture time, `• Very high local grid intensity • 0.006g CO₂e` — and a persistent
system notice reads `Grid-aware mode active — Revert | Continue`. Images were
suppressed and the page degraded to text on purpose. The site continuously
reports *the state of its own data and its own behaviour, in the chrome*.

For MatDREAMS this is the answer to several `AGENTS.md` requirements at once:
"validate public data before use", "fail visibly", "publication approval and
scientific verification are separate", "do not display unreviewed evidence as
verified fact". A permanent provenance strip stating release identity, counts,
and approval state is not an addition to the design — it is the design doing its
job.

**Also.** Flush-left single column with a small eyebrow label above each
headline. Square 1px-outlined buttons with a `→` affordance. Hairline-divided
logo strip. No radius anywhere.

**Transfer.** Two-colour discipline with alpha steps. The self-reporting status
strip. Eyebrow-above-headline. Semantic markup rigour. Deliberate graceful
degradation.

**Do not transfer.** The olive/sage hue pair (it encodes *their* subject —
environmental sustainability — and would be meaningless on a metallurgy site).
Suppressing content by default.

---

## 6. Schema — `https://www.schemadesign.com/`

A data-visualization design practice.

**Typography.** `Graphik` in Regular / Medium / Bold only — three weights, no
display face. The chrome is deliberately quiet.

**Colour.** `#efefef` ground, a grey ramp (`#878787`, `#7d7d7d`, `#5e5e5e`,
`#c4c4c4`, `#d8d8d8`, `#dedede`), and exactly two chromatic values: `#d8ad00`
gold and `#00bfff` deep sky blue — both used inside visualizations.

**Composition (from the screenshot).** A full-width still of an installed
visualization — a dense radial cluster of thousands of dots on near-black, with a
**two-channel legend** (a colour ramp for "Temperature Rise", a size ramp for
"Management Score") and **leader-line labels** pointing from the edge of the
cluster to specific companies. Below it: a plain wordmark left, a plain text nav
right (`Work / Clients / Labs / About / Contact / Jobs`), on `#efefef`.

**The lesson.** A studio whose entire value is visual expression keeps its own
chrome nearly colourless so the work reads. Two encoding channels (hue and size)
with an explicit legend, and leader lines used to label points inside a dense
field without covering it.

**Transfer.** Chrome silent, data expressive. Explicit two-channel legends. Leader
lines to label dense regions. Plain-text navigation at a studio-professional
register.

**Do not transfer.** The "showcase the hero image" homepage, which assumes a
portfolio of finished artefacts. MatDREAMS's visualization is interactive and
live; it cannot be a photograph.

---

## 7. Stripe Press — `https://press.stripe.com/`

A publishing imprint. Included as the reference for long-form reading and for one
specific navigation pattern.

**Composition (opening state).** Black ground. The books are stacked as
**horizontal spines**, each a full-width band in that book's own colours and
typography, author flush left, title centred. The object metaphor *is* the
navigation. At the far left edge, a vertical stack of small horizontal ticks acts
as a positional index of the stack — a minimap and scrubber in roughly 12px of
width. Wordmark is a serif lockup with an italic tagline ("Ideas for progress").

**Colour.** `#222222` with a strong `#ffd943` yellow, plus per-book palettes
(`#cad9e5`, `#6e665b`, `#e9d8e3`, `#eeebcc`) that belong to the objects, not the
chrome — the same chrome/data separation seen in Material-Archiv and Schema.

**Transfer.** The left-edge tick index as positional navigation for a long list
(useful for a terminology corpus or a node list). The serif wordmark plus italic
tagline lockup. Per-item palettes owned by the content, not the shell.

**Do not transfer.** The skeuomorphic object metaphor — it works for books and
would be false for concepts. The black ground for reading.

---

## 8. Illuminating Radioactivity — `https://illuminating-radioactivity.com/`

Supplied as an additional candidate. Built on **Readymag** (`st-p.rmcdn1.net`),
using `canvas` and `gsap`; the served HTML declares only a system font stack, so
type is drawn by the editor.

**Composition (from the screenshot).** Black ground, a huge white sans headline
(`ILLUMINATING RADIOACTIVITY`) almost entirely **occluded** by dozens of
scattered, rotated, saturated chips bearing radiation vocabulary — `x-rays`,
`gamma`, `neutron`, `toxic`, `bright`, `uranium`, `curies`, `exposure`, `scary`,
`confusing`. Primary red / blue / green / yellow / pink at full chroma. A
Readymag "Projects of the Year 2020" badge is baked in.

**Assessment.** This is a public-communication campaign, not a research
instrument. Its stated purpose — "demystify radiation … for radiation
protection" — justifies the maximalism: the chips dramatise the confused public
vocabulary around radioactivity, and burying the headline under them *is* the
argument. It is good work for its job.

**It is the wrong model for MatDREAMS**, and the brief's instruction to evaluate
the site rather than assume from its name cuts this way: the subject sounds
adjacent (physics, materials, scientific communication) but the register is
advocacy aimed at the public, while MatDREAMS addresses researchers, engineers
and students who need to read precise definitions and judge evidence. Full-chroma
primaries on black would destroy the colour budget that a graph visualization
needs, and occluding text is the opposite of a scientific hierarchy.

**Transfer.** One idea only, heavily moderated: **terminology as a first-class
visual object**. The Definition page can treat terms as discrete, typographically
distinct tokens that can be grouped and filtered, rather than as links inside
paragraphs. At a fraction of the chroma, and never occluding anything.

**Do not transfer.** The palette, the occlusion, the scatter, the rotation, the
black ground, the campaign tone.

---

## Cross-reference findings

Patterns that recurred independently across sites, and are therefore treated as
reliable rather than idiosyncratic:

1. **Hairlines instead of cards.** Normal Computing, Material-Archiv,
   Overbrowsing and Trousdale all build structure from 1px rules and alignment.
   None of them uses a shadowed, rounded container as a primary layout unit.
   Normal Computing sets `--radius--main: 0rem` outright; Material-Archiv uses
   radius exactly once, on its search field.
2. **One accent, or two.** Trousdale: one (`#FF5F1F`, used twice). Normal: one
   (`#d61912`). Overbrowsing: two, as a duotone. Kang Group: two, institutional.
   None uses a gradient as an identity element.
3. **Chrome achromatic, data chromatic.** Material-Archiv, Schema and Stripe
   Press all reserve saturation for content. For a site whose content *is* a
   graph with evidence states and uncertainty, this is close to a requirement:
   every hue spent on decoration is a hue unavailable for meaning.
4. **Tiny uppercase letterspaced labels as the connective tissue.** Trousdale
   (11px / `0.05em`), Normal Computing (mono eyebrows), Overbrowsing, Schema.
   Usually mono or near-mono. This register reads as instrumentation.
5. **Expo-out easing in the 300–800 ms band.** Trousdale's
   `cubic-bezier(0.16, 1, 0.3, 1)` at 400/800 ms; Material-Archiv's named
   `crawl 0.8s / walk 0.4s / run 0.2s`. Fast enough to feel responsive, slow
   enough to be traceable.
6. **Form before colour for encoding.** Trousdale is the clearest case: node type
   by outline shape, relation kind by line style (dotted vs solid), and colour
   reserved for a single state. This satisfies "do not rely on colour alone"
   without the usual compromise of adding redundant text.

## Things the references share that MatDREAMS should reject

- **Photographic heroes** (Kang Group, Normal Computing, Schema). MatDREAMS has
  no legitimate imagery, and `AGENTS.md` forbids inventing scientific content. A
  stock or generated image would be a lie about what the site contains.
- **Viewport-height scroll sections** (Kang Group). MatDREAMS is a tool used
  repeatedly with a task; scroll choreography taxes a returning user.
- **Hamburger navigation at desktop width** (Kang Group, Material-Archiv). The
  MatDREAMS wordmark is an acrostic of its own sections; hiding them destroys the
  identity device.
- **Blinking or infinite attention-seeking animation** (Trousdale's
  `blink 1s infinite`). It conflicts with `prefers-reduced-motion` expectations
  and, on a page reporting scientific reliability, reads as an error signal.
- **11px as a base size** (Trousdale). Acceptable for labels, not for the
  textbook definitions and tabular data MatDREAMS must carry.
- **Commercial type as a dependency.** Brunswick Grotesque, ABC Diatype, Tobias,
  Graphik and Circular are all licensed commercial faces. Any MatDREAMS
  recommendation must be licensable for a public static site; see
  [DESIGN_SYSTEM_PROPOSAL.md](DESIGN_SYSTEM_PROPOSAL.md).

## What the existing MatDREAMS concept already has

Two ideas in the supplied PDF and homepage screenshot are stronger than anything
that could be imported from the references, and the directions that follow are
built around keeping them:

- **The acrostic navigation.** The sections spell the product name —
  **Mat**erials, **D**efinition, **R**elations, **E**ngineering, **A**nalysis,
  **M**anual, **S**upports. The wordmark *is* the navigation. None of the eight
  reference sites has an identity device this specific to its own structure.
- **The persistent system selector.** "Choose your system" (RHEA, Ni Superalloy)
  scopes every page to one material system. Making that permanently visible is
  scientifically honest: it states what the data on screen is *about*, always.

And one convergence worth noting: the supplied homepage sketch routes its leader
line from the active corner to the explanation box as a **stepped, right-angled
path**. Trousdale's node map independently uses the same Manhattan routing. The
instinct in the sketch is already correct.

## Sources

- https://andrewtrousdale.com/ — HTML, `assets/css/app.css`, screenshots of `/` and `/nodes/social-intervention/apossible`
- https://kanggroup.io/ — HTML, `assets/index-UWcLlYf6.css`, screenshot
- https://minimal.gallery/tag/research/ — tag listing (18 entries)
- https://www.normalcomputing.com/ — HTML, `normal-computing-01.shared.45a494401.css`, screenshot
- https://materialarchiv.ch/ — HTML, `assets/index-DsrBOZ8Y.css`, screenshot
- https://overbrowsing.com/ — HTML, `assets/css/main.css`, screenshot
- https://www.schemadesign.com/ — HTML, screenshot
- https://press.stripe.com/ — HTML, screenshot (opening state only)
- https://illuminating-radioactivity.com/ — HTML, screenshot
- https://www.earlystudies.com/ — HTML, `_next/static/css/9045e2c9d36474be.css` (surveyed, not selected)
- https://www.semiconbio.com/ — HTML (surveyed, not selected)
- https://heritage-research.org/ — **inaccessible**, no DNS record

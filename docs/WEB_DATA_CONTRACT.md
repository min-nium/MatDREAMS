# Provisional web graph data contract

`matdreams-web-graph-v0.1-draft` is a draft frontend interchange format. It is
not the research pipeline's schema and does not require pipeline changes. There
is no active public release, configured release pin, graph view, or research
data in this scaffold. `public/data/` is intentionally empty. RHEA and Ni
Superalloy are supported future system identifiers, not assertions that either
system currently has an approved public graph.

## Reference metadata only

The supplied research reference is release `rhea-system-chart-20261024-v4`,
mapper `conservative-context-v5`, and source contract
`system-chart-contract-v1.2`. Its audit reported:

| Audit item | Reported count |
| --- | ---: |
| Selected paper IDs | 1,561 |
| Selected claims | 3,297 |
| Canonical concepts | 6,073 |
| Role nodes | 6,130 |
| Relation families | 3,194 |

These values are nonpublic reference metadata, not publication approval or a
description of a shipped dataset. No source graph SHA-256 was supplied. Do not
invent one, turn these values into a default release, or infer coverage for Ni
Superalloy from this RHEA reference.

## Draft payload

Types live in `src/types/graph.ts`; runtime validation lives in
`src/data/validateGraph.ts`. Every object has exactly the documented fields;
unknown fields are rejected. Empty collections are valid and mean only that
this export contains no corresponding items.

| Field | Required content |
| --- | --- |
| `contractVersion` | Exactly `matdreams-web-graph-v0.1-draft` |
| `system` | `RHEA` or `Ni Superalloy`; one system per export |
| `source` | Exact upstream `release`, `mapper`, `contract`, `sourceGraphSha256` |
| `publication` | `status: approved`, independently recorded `approvalId`, valid `approvedOn` date (`YYYY-MM-DD`) |
| `concepts` | Array of `{ id, label, scientific }` |
| `nodes` | Array of `{ id, conceptId, label, role, scientific }` |
| `relations` | Array of `{ id, source, target, label, direction, scientific }` |

IDs are nonempty, opaque upstream identifiers. They are unique within each
collection and stable across exports when the upstream entity is unchanged;
the frontend must not generate IDs from labels. `conceptId` must reference an
included concept; relation `source` and `target` must reference included node
IDs. Separate role nodes can reference the same concept. A subset export must
include every referenced concept and endpoint. No missing endpoint is invented.

Labels and role strings preserve upstream spelling and semantics. Relation
`direction` is explicitly `directed` or `undirected`; `source` and `target`
retain their supplied order. The frontend neither merges concepts nor reverses,
infers, or relabels relations. IDs, labels, roles, units, and uncertainty strings
are returned unchanged by validation.

Every concept, node, and relation includes `scientific.evidenceReview`, one of
`unreviewed`, `reviewed`, or `disputed`. Optional `scientific.unit` and
`scientific.uncertainty` preserve nonempty upstream text; absence means
unspecified, not dimensionless or certain. This limited draft does not model
numeric measurements, statistical uncertainty, evidence records, citations,
relation-family aggregation, or convergence metrics. Agree on a versioned
extension before those are exported; do not flatten them into invented strings.

Publication approval permits public distribution. Evidence review describes
scientific review status. `reviewed` alone is not a claim of verified truth,
and public approval never upgrades `unreviewed` or `disputed` evidence. Future
views must show these distinctions accessibly and provide a readable graph
alternative.

## Release pin and loading

`ApprovedReleasePin` is a separately reviewed frontend input, never metadata
trusted from a downloaded export. It contains the expected frontend contract,
system, complete source identity, publication approval, a single JSON
`fileName`, and `exportSha256`. Both digests use 64 lowercase hexadecimal
characters. No production pin is defined in this repository.

`loadApprovedGraph()` rejects an absent or invalid pin before making any
request. With a reviewed pin it resolves only
`${import.meta.env.BASE_URL}data/${fileName}`. Filenames cannot contain paths,
URLs, encoded separators, or traversal. The Vite base preserves the
`/MatDREAMS/` deployment path. Fetch omits credentials and rejects redirects.

Loading checks the SHA-256 of the exact response bytes against `exportSha256`
before decoding UTF-8 JSON. It then rejects unsupported contracts, unknown
fields, invalid structures, duplicate IDs, dangling references, missing
approval, and any mismatch in system, release, mapper, source contract, source
graph SHA, approval ID, or approval date. `validatePublicGraph()` performs the
structural/identity checks only; use the loader for downloaded bytes. Failures
throw `GraphDataError` with a stable error code and a useful message. Future UI
must surface loading, empty, and failure states instead of substituting data.

The source graph SHA binds the export to the source identity independently
provided by Research Codex. This website compares that value to the reviewed
pin; it does not possess, fetch, or recompute the private source graph. The
public export SHA verifies the transferred artifact, not the correctness of
its science. It lives outside the payload to avoid a self-referential digest.

## Future approval and transfer

1. Research Codex prepares a minimal, publication-safe derivative in the
   independent research repository. It preserves upstream identity, labels,
   direction, units, uncertainty, and review status. Research Codex supplies the
   true source graph SHA and a description of the selected subset and omissions.
2. A scientific/data owner explicitly approves public distribution of that exact
   derivative, including any licensing restrictions. The approval records an
   ID and date. It is separate from scientific evidence review. No release name,
   audit count, or internal verification result supplies this permission.
3. Research Codex supplies the approved artifact and its raw-byte SHA-256 through
   an explicit handoff. Website Codex independently reviews the artifact,
   publication approval, identities, field contents, and digest before copying
   only that approved derivative into `public/data/` and adding the reviewed pin.
   Re-review any changed bytes; never reuse a pin for a different artifact.
4. Website Codex runs validation, tests, and the production build, inspects the
   resulting public files, and obtains any separately required publication or
   deployment authorization. Graph implementation and deployment remain future
   work. Support and approval are evaluated separately for each system.

Do not copy current research JSON, PDFs, caches, quotations, provenance records,
absolute local paths, or full graph exports. The website must never read the
research repository as a runtime or build input, or modify it to meet this
draft. Unknown-field rejection is an accident guard, not a privacy sanitizer:
even allowed string fields require human publication review. `.gitignore` and
SHA checks do not grant publication permission.

`tests/fixtures/synthetic-graph.ts` contains a tiny, clearly marked synthetic
fixture with invented test identities and hashes. It stays outside `src/` and
`public/`, is never imported by application code, and makes no research claims.

/** Provisional frontend format; this does not prescribe a research pipeline schema. */
export const WEB_GRAPH_CONTRACT = 'matdreams-web-graph-v0.1-draft' as const;

export type MaterialSystem = 'RHEA' | 'Ni Superalloy';
export type EvidenceReviewStatus = 'unreviewed' | 'reviewed' | 'disputed';

export interface SourceReleaseIdentity {
  release: string;
  mapper: string;
  contract: string;
  /** SHA-256 of the upstream source graph, supplied by Research Codex. */
  sourceGraphSha256: string;
}

export interface PublicationApproval {
  status: 'approved';
  approvalId: string;
  approvedOn: string;
}

export interface ScientificMetadata {
  /** Review status is independent of permission to publish. */
  evidenceReview: EvidenceReviewStatus;
  /** Preserve upstream text and units without normalization or inference. */
  unit?: string;
  uncertainty?: string;
}

export interface GraphConcept {
  id: string;
  label: string;
  scientific: ScientificMetadata;
}

export interface GraphNode {
  id: string;
  conceptId: string;
  label: string;
  role: string;
  scientific: ScientificMetadata;
}

export interface GraphRelation {
  id: string;
  source: string;
  target: string;
  label: string;
  direction: 'directed' | 'undirected';
  scientific: ScientificMetadata;
}

export interface PublicGraphExport {
  contractVersion: typeof WEB_GRAPH_CONTRACT;
  system: MaterialSystem;
  source: SourceReleaseIdentity;
  publication: PublicationApproval;
  concepts: GraphConcept[];
  nodes: GraphNode[];
  relations: GraphRelation[];
}

/** Supplied independently after both export and publication review; no default exists. */
export interface ApprovedReleasePin {
  contractVersion: typeof WEB_GRAPH_CONTRACT;
  system: MaterialSystem;
  source: SourceReleaseIdentity;
  publication: PublicationApproval;
  /** A single JSON filename inside public/data/, never a URL or arbitrary path. */
  fileName: string;
  /** SHA-256 of the exact public export bytes, kept outside the export itself. */
  exportSha256: string;
}

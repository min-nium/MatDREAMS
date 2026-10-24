import {
  WEB_GRAPH_CONTRACT,
  type ApprovedReleasePin,
  type PublicGraphExport,
} from '../../src/types/graph';

/** SYNTHETIC TEST DATA ONLY: no claims, labels, identities, or hashes are research results. */
export const syntheticGraph: PublicGraphExport = {
  contractVersion: WEB_GRAPH_CONTRACT,
  system: 'RHEA',
  source: {
    release: 'synthetic-test-release',
    mapper: 'synthetic-test-mapper',
    contract: 'synthetic-test-source-contract',
    sourceGraphSha256: '1'.repeat(64),
  },
  publication: {
    status: 'approved',
    approvalId: 'synthetic-test-approval',
    approvedOn: '2026-01-01',
  },
  concepts: [{
    id: 'synthetic:concept-a',
    label: 'Synthetic concept A',
    scientific: { evidenceReview: 'unreviewed' },
  }],
  nodes: [
    {
      id: 'synthetic:node-a',
      conceptId: 'synthetic:concept-a',
      label: 'Synthetic role node A',
      role: 'Synthetic role A',
      scientific: { evidenceReview: 'unreviewed', unit: 'synthetic-unit', uncertainty: 'Synthetic uncertainty only' },
    },
    {
      id: 'synthetic:node-b',
      conceptId: 'synthetic:concept-a',
      label: 'Synthetic role node B',
      role: 'Synthetic role B',
      scientific: { evidenceReview: 'disputed' },
    },
  ],
  relations: [{
    id: 'synthetic:relation-a',
    source: 'synthetic:node-b',
    target: 'synthetic:node-a',
    label: 'Synthetic relation only',
    direction: 'directed',
    scientific: { evidenceReview: 'unreviewed' },
  }],
};

export function syntheticPin(exportSha256: string): ApprovedReleasePin {
  return {
    contractVersion: WEB_GRAPH_CONTRACT,
    system: syntheticGraph.system,
    source: { ...syntheticGraph.source },
    publication: { ...syntheticGraph.publication },
    fileName: 'synthetic-test-graph.json',
    exportSha256,
  };
}

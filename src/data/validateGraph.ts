import {
  WEB_GRAPH_CONTRACT,
  type ApprovedReleasePin,
  type MaterialSystem,
  type PublicationApproval,
  type PublicGraphExport,
  type SourceReleaseIdentity,
} from '../types/graph';

export type GraphDataErrorCode =
  | 'release-not-approved'
  | 'invalid-pin'
  | 'invalid-data'
  | 'unsupported-contract'
  | 'identity-mismatch'
  | 'integrity-mismatch'
  | 'integrity-unavailable'
  | 'network-error'
  | 'invalid-json';

export class GraphDataError extends Error {
  readonly code: GraphDataErrorCode;

  constructor(code: GraphDataErrorCode, message: string) {
    super(message);
    this.name = 'GraphDataError';
    this.code = code;
  }
}

const SHA256 = /^[a-f0-9]{64}$/;

function invalid(message: string): never {
  throw new GraphDataError('invalid-data', message);
}

function object(
  value: unknown,
  path: string,
  required: string[],
  optional: string[] = [],
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalid(`${path} must be an object.`);
  }
  const result = value as Record<string, unknown>;
  if (required.some((key) => !Object.hasOwn(result, key))) {
    return invalid(`${path} is missing a required field.`);
  }
  const allowed = new Set([...required, ...optional]);
  if (Object.keys(result).some((key) => !allowed.has(key))) {
    return invalid(`${path} contains an unsupported field.`);
  }
  return result;
}

function text(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return invalid(`${path} must be a nonempty string.`);
  }
  return value;
}

function sha256(value: unknown, path: string): string {
  const result = text(value, path);
  if (!SHA256.test(result)) return invalid(`${path} must be a lowercase SHA-256 digest.`);
  return result;
}

function system(value: unknown): MaterialSystem {
  if (value !== 'RHEA' && value !== 'Ni Superalloy') {
    return invalid('system must be RHEA or Ni Superalloy.');
  }
  return value;
}

function sourceIdentity(value: unknown): SourceReleaseIdentity {
  const source = object(value, 'source', ['release', 'mapper', 'contract', 'sourceGraphSha256']);
  return {
    release: text(source.release, 'source.release'),
    mapper: text(source.mapper, 'source.mapper'),
    contract: text(source.contract, 'source.contract'),
    sourceGraphSha256: sha256(source.sourceGraphSha256, 'source.sourceGraphSha256'),
  };
}

function publicationApproval(value: unknown): PublicationApproval {
  const approval = object(value, 'publication', ['status', 'approvalId', 'approvedOn']);
  if (approval.status !== 'approved') return invalid('Publication approval is required.');
  const approvedOn = text(approval.approvedOn, 'publication.approvedOn');
  const date = new Date(`${approvedOn}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(approvedOn) ||
      !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== approvedOn) {
    return invalid('publication.approvedOn must be a valid YYYY-MM-DD date.');
  }
  return {
    status: 'approved',
    approvalId: text(approval.approvalId, 'publication.approvalId'),
    approvedOn,
  };
}

function contract(value: unknown): void {
  if (value !== WEB_GRAPH_CONTRACT) {
    throw new GraphDataError('unsupported-contract', 'This frontend graph contract is unsupported.');
  }
}

/** Runtime-check the independently reviewed pin before resolving or fetching a file. */
export function validateReleasePin(value: unknown): ApprovedReleasePin {
  if (value === undefined || value === null) {
    throw new GraphDataError('release-not-approved', 'No approved public graph release is configured.');
  }
  try {
    const pin = object(value, 'release pin', [
      'contractVersion', 'system', 'source', 'publication', 'fileName', 'exportSha256',
    ]);
    contract(pin.contractVersion);
    const fileName = text(pin.fileName, 'fileName');
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.json$/.test(fileName) || fileName.includes('..')) {
      return invalid('fileName must be one local JSON filename inside public/data/.');
    }
    return {
      contractVersion: WEB_GRAPH_CONTRACT,
      system: system(pin.system),
      source: sourceIdentity(pin.source),
      publication: publicationApproval(pin.publication),
      fileName,
      exportSha256: sha256(pin.exportSha256, 'exportSha256'),
    };
  } catch (error) {
    if (error instanceof GraphDataError) {
      throw new GraphDataError('invalid-pin', error.message);
    }
    throw error;
  }
}

function scientificMetadata(value: unknown, path: string): void {
  const scientific = object(value, path, ['evidenceReview'], ['unit', 'uncertainty']);
  if (typeof scientific.evidenceReview !== 'string' ||
      !['unreviewed', 'reviewed', 'disputed'].includes(scientific.evidenceReview)) {
    return invalid(`${path}.evidenceReview is unsupported.`);
  }
  for (const key of ['unit', 'uncertainty']) {
    if (Object.hasOwn(scientific, key)) text(scientific[key], `${path}.${key}`);
  }
}

function records(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) return invalid(`${path} must be an array.`);
  return value as unknown[];
}

function uniqueId(value: unknown, ids: Set<string>, path: string): string {
  const id = text(value, `${path}.id`);
  if (ids.has(id)) return invalid(`${path} contains a duplicate ID.`);
  ids.add(id);
  return id;
}

/** Structural and identity validation only; loadApprovedGraph also verifies exact file bytes. */
export function validatePublicGraph(value: unknown, expected: ApprovedReleasePin): PublicGraphExport {
  const pin = validateReleasePin(expected);
  const graph = object(value, 'graph', [
    'contractVersion', 'system', 'source', 'publication', 'concepts', 'nodes', 'relations',
  ]);
  contract(graph.contractVersion);
  const actualSystem = system(graph.system);
  const actualSource = sourceIdentity(graph.source);
  const actualPublication = publicationApproval(graph.publication);
  const sourceKeys: (keyof SourceReleaseIdentity)[] = [
    'release', 'mapper', 'contract', 'sourceGraphSha256',
  ];
  const publicationKeys: (keyof PublicationApproval)[] = ['status', 'approvalId', 'approvedOn'];
  if (actualSystem !== pin.system ||
      sourceKeys.some((key) => actualSource[key] !== pin.source[key]) ||
      publicationKeys.some((key) => actualPublication[key] !== pin.publication[key])) {
    throw new GraphDataError('identity-mismatch', 'The graph does not match the approved release pin.');
  }

  const conceptIds = new Set<string>();
  for (const value of records(graph.concepts, 'concepts')) {
    const item = object(value, 'concept', ['id', 'label', 'scientific']);
    uniqueId(item.id, conceptIds, 'concept');
    text(item.label, 'concept.label');
    scientificMetadata(item.scientific, 'concept.scientific');
  }

  const nodeIds = new Set<string>();
  for (const value of records(graph.nodes, 'nodes')) {
    const item = object(value, 'node', ['id', 'conceptId', 'label', 'role', 'scientific']);
    uniqueId(item.id, nodeIds, 'node');
    if (!conceptIds.has(text(item.conceptId, 'node.conceptId'))) {
      return invalid('A node references an absent concept.');
    }
    text(item.label, 'node.label');
    text(item.role, 'node.role');
    scientificMetadata(item.scientific, 'node.scientific');
  }

  const relationIds = new Set<string>();
  for (const value of records(graph.relations, 'relations')) {
    const item = object(value, 'relation', [
      'id', 'source', 'target', 'label', 'direction', 'scientific',
    ]);
    uniqueId(item.id, relationIds, 'relation');
    if (!nodeIds.has(text(item.source, 'relation.source')) ||
        !nodeIds.has(text(item.target, 'relation.target'))) {
      return invalid('A relation references an absent node.');
    }
    text(item.label, 'relation.label');
    if (item.direction !== 'directed' && item.direction !== 'undirected') {
      return invalid('relation.direction must explicitly be directed or undirected.');
    }
    scientificMetadata(item.scientific, 'relation.scientific');
  }

  // Return the validated object unchanged: IDs, labels, units, and direction stay upstream-owned.
  return value as PublicGraphExport;
}

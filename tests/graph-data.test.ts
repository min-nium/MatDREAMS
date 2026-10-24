import { describe, expect, it, vi } from 'vitest';
import { loadApprovedGraph, publicGraphUrl } from '../src/data/loadGraph';
import { validatePublicGraph, validateReleasePin } from '../src/data/validateGraph';
import { syntheticGraph, syntheticPin } from './fixtures/synthetic-graph';

const structuralPin = syntheticPin('2'.repeat(64));

async function hash(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

describe('provisional public graph validation (synthetic test data only)', () => {
  it('preserves IDs, scientific text, units, uncertainty, direction, and unreviewed status', () => {
    const graph = structuredClone(syntheticGraph);
    graph.concepts[0]!.label = '  Synthetic label α  ';
    const validated = validatePublicGraph(graph, structuralPin);
    expect(validated).toBe(graph);
    expect(validated).toEqual(graph);
    expect(validated.relations[0]?.source).toBe('synthetic:node-b');
    expect(validated.relations[0]?.scientific.evidenceReview).toBe('unreviewed');
  });

  it('supports each future system without implying a release is available', () => {
    const graph = structuredClone(syntheticGraph);
    graph.system = 'Ni Superalloy';
    expect(validatePublicGraph(graph, { ...structuralPin, system: 'Ni Superalloy' }).system)
      .toBe('Ni Superalloy');
  });

  it('rejects unsupported frontend contracts', () => {
    expect(() => validatePublicGraph({ ...syntheticGraph, contractVersion: 'future-contract' }, structuralPin))
      .toThrow(expect.objectContaining({ code: 'unsupported-contract' }));
  });

  it.each(['release', 'mapper', 'contract', 'sourceGraphSha256'] as const)(
    'rejects a mismatched source %s',
    (field) => {
      const graph = structuredClone(syntheticGraph);
      graph.source[field] = field === 'sourceGraphSha256' ? '3'.repeat(64) : 'other-synthetic-identity';
      expect(() => validatePublicGraph(graph, structuralPin))
        .toThrow(expect.objectContaining({ code: 'identity-mismatch' }));
    },
  );

  it('rejects publication approval or material system mismatches', () => {
    expect(() => validatePublicGraph({ ...syntheticGraph, system: 'Ni Superalloy' }, structuralPin))
      .toThrow(expect.objectContaining({ code: 'identity-mismatch' }));
    const graph = structuredClone(syntheticGraph);
    graph.publication.approvalId = 'other-synthetic-approval';
    expect(() => validatePublicGraph(graph, structuralPin))
      .toThrow(expect.objectContaining({ code: 'identity-mismatch' }));
  });

  it('rejects absent publication approval independently of evidence review', () => {
    expect(() => validatePublicGraph({ ...syntheticGraph, publication: { status: 'pending' } }, structuralPin))
      .toThrow(expect.objectContaining({ code: 'invalid-data' }));
    expect(() => validateReleasePin({ ...structuralPin, publication: null }))
      .toThrow(expect.objectContaining({ code: 'invalid-pin' }));
  });

  it('rejects invalid approval dates and malformed SHA values', () => {
    expect(() => validateReleasePin({
      ...structuralPin,
      publication: { ...structuralPin.publication, approvedOn: '2026-13-01' },
    })).toThrow(expect.objectContaining({ code: 'invalid-pin' }));
    expect(() => validateReleasePin({ ...structuralPin, exportSha256: 'unknown' }))
      .toThrow(expect.objectContaining({ code: 'invalid-pin' }));
  });

  it.each(['concepts', 'nodes', 'relations'] as const)('rejects duplicate %s IDs', (collection) => {
    const graph = structuredClone(syntheticGraph);
    graph[collection].push({ ...graph[collection][0]! } as never);
    expect(() => validatePublicGraph(graph, structuralPin))
      .toThrow(expect.objectContaining({ code: 'invalid-data' }));
  });

  it('rejects dangling concept and relation endpoint references', () => {
    const graph = structuredClone(syntheticGraph);
    graph.nodes[0]!.conceptId = 'synthetic:absent-concept';
    expect(() => validatePublicGraph(graph, structuralPin)).toThrow('absent concept');
    graph.nodes[0]!.conceptId = syntheticGraph.nodes[0]!.conceptId;
    graph.relations[0]!.target = 'synthetic:absent-node';
    expect(() => validatePublicGraph(graph, structuralPin)).toThrow('absent node');
  });

  it('rejects unknown fields and unsupported evidence statuses', () => {
    expect(() => validatePublicGraph({ ...syntheticGraph, quotations: [] }, structuralPin))
      .toThrow('unsupported field');
    const graph = structuredClone(syntheticGraph);
    Object.assign(graph.nodes[0]!.scientific, { evidenceReview: 'verified' });
    expect(() => validatePublicGraph(graph, structuralPin)).toThrow('evidenceReview is unsupported');
  });

  it('rejects evidence status arrays instead of coercing them into a supported string', () => {
    const graph = structuredClone(syntheticGraph);
    Object.assign(graph.nodes[0]!.scientific, { evidenceReview: ['reviewed'] });
    expect(() => validatePublicGraph(graph, structuralPin))
      .toThrow(expect.objectContaining({ code: 'invalid-data' }));
  });

  it.each(['../graph.json', 'https://example.test/graph.json', '/data/graph.json', 'graph%2fsecret.json'])(
    'rejects unsafe public export filename %s',
    (fileName) => {
      expect(() => validateReleasePin({ ...structuralPin, fileName }))
        .toThrow(expect.objectContaining({ code: 'invalid-pin' }));
    },
  );
});

describe('approved public graph loading (synthetic test data only)', () => {
  it('makes no request when an independently approved pin is absent or invalid', async () => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(loadApprovedGraph(undefined, fetcher))
      .rejects.toMatchObject({ code: 'release-not-approved' });
    await expect(loadApprovedGraph({ ...structuralPin, fileName: '../private.json' }, fetcher))
      .rejects.toMatchObject({ code: 'invalid-pin' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('loads a byte-verified export from the Vite base under public/data/', async () => {
    const json = JSON.stringify(syntheticGraph);
    const pin = syntheticPin(await hash(json));
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(json));
    // Vitest normalizes BASE_URL to /; exercise the actual GitHub Pages deployment base.
    vi.stubEnv('BASE_URL', '/MatDREAMS/');
    try {
      await expect(loadApprovedGraph(pin, fetcher)).resolves.toEqual(syntheticGraph);
      expect(publicGraphUrl(pin)).toBe('/MatDREAMS/data/synthetic-test-graph.json');
      expect(fetcher).toHaveBeenCalledWith(publicGraphUrl(pin), { credentials: 'omit', redirect: 'error' });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('rejects changed raw bytes even when the parsed graph is otherwise identical', async () => {
    const json = JSON.stringify(syntheticGraph);
    const pin = syntheticPin(await hash(json));
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(`${json}\n`));
    await expect(loadApprovedGraph(pin, fetcher)).rejects.toMatchObject({ code: 'integrity-mismatch' });
  });

  it('rejects invalid JSON after verifying the exact received bytes', async () => {
    const json = '{ synthetic invalid JSON';
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(json));
    await expect(loadApprovedGraph(syntheticPin(await hash(json)), fetcher))
      .rejects.toMatchObject({ code: 'invalid-json' });
  });

  it('fails visibly when the environment cannot verify SHA-256', async () => {
    const digest = vi.spyOn(crypto.subtle, 'digest').mockRejectedValueOnce(new Error('Synthetic crypto failure'));
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(syntheticGraph)));
    try {
      await expect(loadApprovedGraph(structuralPin, fetcher))
        .rejects.toMatchObject({ code: 'integrity-unavailable' });
    } finally {
      digest.mockRestore();
    }
  });

  it('surfaces HTTP and network failures without accepting a graph', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));
    await expect(loadApprovedGraph(structuralPin, fetcher)).rejects.toMatchObject({ code: 'network-error' });
    fetcher.mockRejectedValue(new Error('Synthetic network failure'));
    await expect(loadApprovedGraph(structuralPin, fetcher)).rejects.toMatchObject({ code: 'network-error' });
  });
});

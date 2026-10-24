import { type ApprovedReleasePin, type PublicGraphExport } from '../types/graph';
import { GraphDataError, validatePublicGraph, validateReleasePin } from './validateGraph';

/** Resolve only a reviewed filename under Vite's deployment base and public/data/. */
export function publicGraphUrl(pin: ApprovedReleasePin): string {
  const approved = validateReleasePin(pin);
  return `${import.meta.env.BASE_URL}data/${approved.fileName}`;
}

/**
 * No pin means no request. The application intentionally configures no active release.
 * The injectable fetch implementation permits isolated tests without a server or data export.
 */
export async function loadApprovedGraph(
  expected?: ApprovedReleasePin,
  fetcher: typeof fetch = globalThis.fetch,
): Promise<PublicGraphExport> {
  const pin = validateReleasePin(expected);
  let response: Response;
  try {
    response = await fetcher(publicGraphUrl(pin), { credentials: 'omit', redirect: 'error' });
  } catch {
    throw new GraphDataError('network-error', 'The approved public graph could not be requested.');
  }
  if (!response.ok) {
    throw new GraphDataError('network-error', 'The approved public graph could not be loaded.');
  }

  let bytes: ArrayBuffer;
  try {
    bytes = await response.arrayBuffer();
  } catch {
    throw new GraphDataError('network-error', 'The approved public graph could not be read.');
  }
  let digest: ArrayBuffer;
  try {
    digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  } catch {
    throw new GraphDataError('integrity-unavailable', 'SHA-256 verification is unavailable in this environment.');
  }
  const actualSha256 = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  if (actualSha256 !== pin.exportSha256) {
    throw new GraphDataError('integrity-mismatch', 'The public graph file does not match its approved SHA-256.');
  }

  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown;
  } catch {
    throw new GraphDataError('invalid-json', 'The approved public graph is not valid UTF-8 JSON.');
  }
  return validatePublicGraph(value, pin);
}

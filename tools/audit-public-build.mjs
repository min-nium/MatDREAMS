import { createHash } from 'node:crypto'
import { lstat, readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

// This allowlist is for the current public preview, not future research releases.
// A new asset type or dataset requires an explicit publication review first.
const maxTotalBytes = 2 * 1024 * 1024
const approvedFonts = new Map([
  ['plex-mono-400', 'e8993d946649b9d01abb1ed06d574b19d8ea3e66b5c3948602db335c44c18e56'],
  ['plex-mono-500', '41201b658a328b9d00368215c2f1102770f80b15952ab82631e4006255e6365d'],
  ['plex-sans-400', 'b5ad7bd39f996144915f0ad9849a90183b27d8c28ad97ed98af5b1bebc51f6b1'],
  ['plex-sans-600', 'fff0ab3a88b0b4aa0b693e4f0201359a15183b08e3fa5696d1918d8f0ade8ad5'],
  ['plex-serif-400', '324a502545695a3e8dd9e9d9273ec56e3aa2a729689807756b9439e2c7a48071'],
])
const forbidden = [
  ['machine-specific path', /(?:\/home\/|\/Users\/|\/tmp\/|[A-Z]:\\(?:Users|Research)\\|file:\/\/)/i],
  ['private research location', /5_LLMforCCAs|__matdreams_local__/i],
  ['local service address', /(?:\b(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?\b|\[::1\])/i],
  ['frozen research release', /rhea-system-chart-\d{8}|conservative-context-v\d+/i],
  ['research record identity', /\b(?:concept|rel|rhea)_[a-f0-9]{8,}\b/i],
  ['research checksum or unreviewed digest', /\b[a-f0-9]{64}\b/i],
  ['original evidence record', /(?:["']?\b(?:quote|quotation|source_quote|source_block_sha(?:256)?|extraction_provenance|source_paths)["']?\s*:|\bsource_block_sha(?:256)?\b)/i],
  ['embedded graph record', /["']?\b(?:concept_id|claim_id|paper_id|relation_family_id|graph_sha256)["']?\s*:/i],
  ['private key', /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
  ['credential', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|sk-[A-Za-z0-9_-]{24,})\b/],
  ['assigned credential', /["']?(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)["']?\s*[:=]\s*["'][^"']{8,}["']/i],
  ['source map', /sourceMappingURL\s*=/i],
]
export async function auditPublicBuild(directory = 'dist') {
  const root = resolve(directory)
  const files = new Map()
  const readable = new Map()
  let totalBytes = 0

  function fail(message) {
    throw new Error(message)
  }

  function fileKind(path) {
    if (path === 'index.html') return { kind: 'text', limit: 64 * 1024 }
    if (['.nojekyll', 'assets/.gitkeep', 'data/.gitkeep'].includes(path)) return { kind: 'empty', limit: 0 }
    if (/^assets\/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{8,}\.js$/.test(path)) return { kind: 'text', limit: 1024 * 1024 }
    if (/^assets\/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{8,}\.css$/.test(path)) return { kind: 'text', limit: 256 * 1024 }
    const font = /^assets\/(plex-(?:mono-(?:400|500)|sans-(?:400|600)|serif-400))-[A-Za-z0-9_-]{8,}\.woff2$/.exec(path)
    if (font) return { kind: 'font', limit: 256 * 1024, font: font[1] }
    fail(`Unapproved public file: ${path}`)
  }

  async function visit(relative = '') {
    const absolute = resolve(root, relative)
    const info = await lstat(absolute)
    if (info.isSymbolicLink()) fail(`Symbolic link is not permitted: ${relative || '.'}`)
    if (info.isDirectory()) {
      if (!['', 'assets', 'data'].includes(relative)) fail(`Unapproved public directory: ${relative}`)
      for (const name of (await readdir(absolute)).sort()) await visit(relative ? `${relative}/${name}` : name)
      return
    }
    if (!info.isFile() || info.nlink !== 1) fail(`Only regular files without hard links are permitted: ${relative}`)
    const policy = fileKind(relative)
    if (info.size > policy.limit) fail(`Public file exceeds its reviewed size limit: ${relative}`)
    totalBytes += info.size
    if (totalBytes > maxTotalBytes || files.size >= 32) fail('Public artifact exceeds the reviewed total size or file count')
    const bytes = await readFile(absolute)
    files.set(relative, createHash('sha256').update(bytes).digest('hex'))
    if (policy.kind === 'font') {
      if (files.get(relative) !== approvedFonts.get(policy.font)) fail(`Font differs from the approved bundled asset: ${relative}`)
    } else if (policy.kind === 'text') {
      const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      if (content.includes('\0')) fail(`Unexpected binary content: ${relative}`)
      for (const [label, pattern] of forbidden) if (pattern.test(content)) fail(`Publication scan found ${label} in ${relative}`)
      readable.set(relative, content)
    }
  }

  function checkReferences() {
    const html = readable.get('index.html')
    if (!html) fail('The public artifact must contain index.html')
    let scripts = 0
    let styles = 0
    for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
      const reference = match[1]
      if (reference.startsWith('#')) continue
      if (!reference.startsWith('/MatDREAMS/assets/')) fail('HTML resource does not use the reviewed project-site base')
      const path = reference.slice('/MatDREAMS/'.length)
      if (!files.has(path)) fail(`HTML references a missing public asset: ${path}`)
      if (path.endsWith('.js')) scripts++
      if (path.endsWith('.css')) styles++
    }
    if (!scripts || !styles) fail('The public HTML must reference built JavaScript and CSS')
    for (const [path, content] of readable) {
      if (!path.endsWith('.css')) continue
      for (const match of content.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        const reference = match[1]
        if (!reference.startsWith('/MatDREAMS/assets/') || !files.has(reference.slice('/MatDREAMS/'.length))) {
          fail(`CSS references an unapproved or missing asset: ${path}`)
        }
      }
    }
  }
  await visit()
  checkReferences()
  const manifest = [...files].map(([path, sha]) => `${sha}  ${path}`).join('\n')
  return {
    fileCount: files.size,
    totalBytes,
    manifestSha256: createHash('sha256').update(manifest).digest('hex'),
  }
}

if (import.meta.main) {
  try {
    const result = await auditPublicBuild(process.argv[2] ?? 'dist')
    console.log(`Public build audit passed: ${result.fileCount} files, ${result.totalBytes} bytes; manifest SHA-256 ${result.manifestSha256}`)
    console.log('Only reviewed application assets are permitted. This technical scan does not grant publication approval.')
  } catch (error) {
    // Never echo matched text, a quotation, credential, or an absolute local path.
    const message = error instanceof Error && !('code' in error) ? error.message : 'Public artifact could not be read'
    console.error(`Public build audit failed: ${message}`)
    process.exitCode = 1
  }
}

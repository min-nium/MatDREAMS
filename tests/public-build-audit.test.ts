import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Entirely synthetic public artifacts. These fixtures contain no research data.
const script = pathToFileURL(resolve('tools/audit-public-build.mjs')).href
const { auditPublicBuild } = await import(/* @vite-ignore */ script) as {
  auditPublicBuild: (path: string) => Promise<{ fileCount: number }>
}
let directory: string
const js = 'assets/index-SYNTHETIC.js'

function write(path: string, content: string) {
  writeFileSync(join(directory, path), content)
}
function audit() {
  return auditPublicBuild(directory)
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'matdreams-synthetic-public-'))
  mkdirSync(join(directory, 'assets'))
  write('index.html', '<!doctype html><title>Synthetic public preview</title><script type="module" src="/MatDREAMS/assets/index-SYNTHETIC.js"></script><link rel="stylesheet" href="/MatDREAMS/assets/index-SYNTHETIC.css">')
  write(js, 'console.log("Synthetic public preview")')
  write('assets/index-SYNTHETIC.css', 'body{color:#111}')
})
afterEach(() => rmSync(directory, { recursive: true, force: true }))

describe('public artifact publication boundary', () => {
  it('accepts the bounded synthetic static artifact', async () => {
    await expect(audit()).resolves.toMatchObject({ fileCount: 3 })
  })
  it.each([
    ['data.json', '{}'], ['paper.pdf', 'SYNTHETIC'],
    ['assets/screenshot-SYNTHETIC.png', 'SYNTHETIC'], ['assets/index-SYNTHETIC.js.map', '{}'],
  ])('rejects unapproved file %s', async (path, content) => {
    write(path, content)
    await expect(audit()).rejects.toThrow(/Unapproved public file/)
  })
  it.each([
    '/home/synthetic/private', 'http://127.0.0.1:5177/graph', 'http://[::1]:5177/graph', '/__matdreams_local__/graph',
    'rhea-system-chart-20990101-v999', 'concept_0123456789abcdef',
    '"quote":"SYNTHETIC TEXT"', '"source_block_sha256":"SYNTHETIC"',
    '"concept_id":"SYNTHETIC"', 'quote:"SYNTHETIC TEXT"', 'paper_id:"SYNTHETIC"', '-----BEGIN PRIVATE KEY-----',
    'github_pat_SYNTHETIC_ONLY_NOT_A_REAL_TOKEN',
  ])('rejects synthetic forbidden marker %s', async marker => {
    write(js, marker)
    await expect(audit()).rejects.toThrow(/Publication scan found/)
  })
  it('rejects a symlink rather than following it into another directory', async () => {
    symlinkSync('index-SYNTHETIC.js', join(directory, 'assets/linked-SYNTHETIC.js'))
    await expect(audit()).rejects.toThrow(/Symbolic link/)
  })
  it('rejects an oversized script', async () => {
    write(js, 'x'.repeat(1024 * 1024 + 1))
    await expect(audit()).rejects.toThrow(/size limit/)
  })
  it('rejects a font with an approved name but unreviewed bytes', async () => {
    write('assets/plex-sans-400-SYNTHETIC.woff2', 'SYNTHETIC NOT A FONT')
    await expect(audit()).rejects.toThrow(/Font differs/)
  })
  it('rejects the wrong base path and missing assets', async () => {
    write('index.html', '<script src="/assets/index-SYNTHETIC.js"></script>')
    await expect(audit()).rejects.toThrow(/project-site base/)
    write('index.html', '<script src="/MatDREAMS/assets/missing-SYNTHETIC.js"></script>')
    await expect(audit()).rejects.toThrow(/missing public asset/)
  })
})

import { Fragment, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { localResearchEnabled, researchDocumentUrl } from '../../data/researchClient'
import { documentMatches, safeResearchLink, splitResearchDocument } from './researchMarkdown'

function Inline({ text }: { text: string }) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^\s)]+\))/g)
  return tokens.map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`')) return <code key={index}>{token.slice(1, -1)}</code>
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={index}>{token.slice(2, -2)}</strong>
    const link = /^\[([^\]]+)\]\(([^\s)]+)\)$/.exec(token)
    if (link) {
      const href = safeResearchLink(link[2] ?? '')
      return href ? <a key={index} href={href} target="_blank" rel="noreferrer">{link[1]}</a> : <Fragment key={index}>{link[1]}</Fragment>
    }
    return <Fragment key={index}>{token}</Fragment>
  })
}

/** React escapes every source string; source Markdown is never inserted as HTML. */
export function ResearchMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''
    if (!line.trim()) { i += 1; continue }
    if (/^\s*```/.test(line)) {
      const code: string[] = []
      i += 1
      while (i < lines.length && !/^\s*```/.test(lines[i] ?? '')) { code.push(lines[i] ?? ''); i += 1 }
      i += 1
      blocks.push(<pre key={blocks.length}><code>{code.join('\n')}</code></pre>)
      continue
    }
    const heading = /^#{2,6} (.+)$/.exec(line)
    if (heading) {
      blocks.push(<h3 key={blocks.length}><Inline text={heading[1] ?? ''} /></h3>)
      i += 1
      continue
    }
    if (line.trim().startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? '')) {
      const cells = (value: string) => value.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'))
      const headers = cells(line)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) { rows.push(cells(lines[i] ?? '')); i += 1 }
      blocks.push(<div className="research-document__table" key={blocks.length} tabIndex={0} role="region" aria-label="Documentation table"><table><thead><tr>{headers.map((cell, index) => <th scope="col" key={index}><Inline text={cell} /></th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, j) => <td key={j}><Inline text={cell} /></td>)}</tr>)}</tbody></table></div>)
      continue
    }
    const list = /^\s*(?:[-*]|\d+\.) (.+)$/.exec(line)
    if (list) {
      const ordered = /^\s*\d+\./.test(line)
      const items: string[] = []
      while (i < lines.length) {
        const item = /^\s*(?:[-*]|\d+\.) (.+)$/.exec(lines[i] ?? '')
        if (!item) break
        items.push(item[1] ?? '')
        i += 1
      }
      const children = items.map((item, index) => <li key={index}><Inline text={item} /></li>)
      blocks.push(ordered ? <ol key={blocks.length}>{children}</ol> : <ul key={blocks.length}>{children}</ul>)
      continue
    }
    if (/^\s*---+\s*$/.test(line)) { i += 1; continue }
    const paragraph: string[] = [line]
    i += 1
    while (i < lines.length && (lines[i] ?? '').trim() && !/^(?:#{2,6} |\s*```|\s*[-*] |\s*\d+\. |\s*\|)/.test(lines[i] ?? '')) { paragraph.push(lines[i] ?? ''); i += 1 }
    blocks.push(<p key={blocks.length}><Inline text={paragraph.join(' ')} /></p>)
  }
  return <div className="research-document__body">{blocks}</div>
}

export function ResearchDocument({ documentKey, title, initialSection = '' }: { documentKey: string; title: string; initialSection?: string }) {
  const [loaded, setLoaded] = useState<{ key: string; markdown?: string; error?: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(initialSection)
  useEffect(() => {
    if (!localResearchEnabled) return
    const controller = new AbortController()
    void fetch(researchDocumentUrl(documentKey), { signal: controller.signal, credentials: 'omit', redirect: 'error' }).then(async (response) => {
      if (!response.ok) throw new Error(`Authoritative document is unavailable (${response.status}).`)
      return response.text()
    }).then((markdown) => setLoaded({ key: documentKey, markdown })).catch((error: unknown) => {
      if (!controller.signal.aborted) setLoaded({ key: documentKey, error: error instanceof Error ? error.message : 'Document could not be loaded.' })
    })
    return () => controller.abort()
  }, [documentKey, attempt])
  const markdown = loaded?.key === documentKey ? loaded.markdown ?? '' : ''
  const sections = useMemo(() => splitResearchDocument(markdown), [markdown])
  const filtered = sections.filter((section) => documentMatches(section, query))
  const current = filtered.find((section) => section.id === selected) ?? filtered[0]
  if (!localResearchEnabled) return null
  return <section className="research-document" aria-label={title}>
    <div className="research-document__heading"><h2>{title}</h2><a className="control" href={researchDocumentUrl(documentKey, true)} download>Download Markdown</a></div>
    <p className="research-content__caption">Authoritative research documentation, read locally. Commands are documentation; this interface does not execute them.</p>
    {loaded?.key === documentKey && loaded.error ? <div role="alert"><p>{loaded.error}</p><button type="button" className="control" onClick={() => setAttempt((value) => value + 1)}>Retry document</button></div>
      : loaded?.key === documentKey && !markdown ? <p>The source document is empty. No manual content is available.</p>
      : !markdown ? <p role="status">Loading the source document…</p>
      : <><div className="research-document__tools">
        <label>Search this document<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a method, command or limitation" /></label>
        <label>Document section<select value={current?.id ?? ''} onChange={(event) => setSelected(event.target.value)}>{filtered.length ? filtered.map((section) => <option key={section.id} value={section.id}>{section.title}</option>) : <option value="">No matching section</option>}</select></label>
      </div><p className="research-content__caption" role="status">{filtered.length} of {sections.length} sections match.</p>
        {current ? <article className="research-document__section"><h3>{current.title}</h3><ResearchMarkdown markdown={current.markdown} /></article> : <p>No section matches. Try a broader term or clear the search.</p>}</>}
  </section>
}

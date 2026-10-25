/** Small, fence-aware document parser. Research text is fetched only in local mode. */
export interface ResearchDocumentSection {
  id: string
  title: string
  markdown: string
}

export function splitResearchDocument(markdown: string): ResearchDocumentSection[] {
  const sections: ResearchDocumentSection[] = []
  let title = 'Release and scope'
  let lines: string[] = []
  let fenced = false
  const finish = () => {
    const body = lines.join('\n').trim()
    if (body) sections.push({ id: `section-${sections.length}`, title, markdown: body })
    lines = []
  }
  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*```/.test(line)) fenced = !fenced
    const heading = !fenced && /^## (.+)$/.exec(line)
    if (heading) {
      finish()
      title = heading[1] ?? 'Documentation'
    } else if (fenced || !/^# /.test(line)) {
      lines.push(line)
    }
  }
  finish()
  return sections
}

/** Markdown links cannot execute scripts, open files or access arbitrary adapter paths. */
export function safeResearchLink(value: string): string | null {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

export function documentMatches(section: ResearchDocumentSection, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase('en')
  return !normalized || `${section.title}\n${section.markdown}`.toLocaleLowerCase('en').includes(normalized)
}

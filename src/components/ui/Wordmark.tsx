import { wordmarkSegments } from '../../app/routes'

interface WordmarkProps {
  /** Shown beneath the wordmark in the site header. */
  tagline?: string
}

/**
 * The MatDREAMS wordmark, built from the same seven segments as the section
 * navigation. Rendering it from `wordmarkSegments` rather than a literal string
 * means the identity device cannot drift out of sync with the routes.
 */
export function Wordmark({ tagline }: WordmarkProps) {
  return (
    <div className="masthead">
      <a className="wordmark" href="#/" aria-label="MatDREAMS — home">
        {wordmarkSegments.map((segment, index) => (
          <span className="wordmark__seg" key={`${segment}-${index}`} aria-hidden="true">
            {segment}
          </span>
        ))}
      </a>
      {tagline ? <span className="wordmark__rule">{tagline}</span> : null}
    </div>
  )
}

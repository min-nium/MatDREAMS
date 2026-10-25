import '../styles/research.css'
import './ResearchContent.css'

const project = 'https://github.com/min-nium/MatDREAMS'

export function SupportsPage() {
  return (
    <section className="research-page research-content">
      <h1>Supports</h1>
      <p className="research-content__lead">Help make materials knowledge more inspectable.</p>
      <section className="research-content__section"><h2>About MatDREAMS</h2><p>MatDREAMS is an interactive materials-science research website connecting concept learning, source-linked relationships, bounded scenario exploration and reproducibility documentation. The current local demonstration integrates the RHEA System Chart. Ni Superalloy is pending integration.</p><p>The homepage tetrahedron presents the materials paradigm. It is a conceptual diagram, not a research result or quantitative prediction.</p><div className="research-links"><a className="control" href={project} target="_blank" rel="noreferrer">GitHub project ↗</a><a className="control" href={`${project}/issues`} target="_blank" rel="noreferrer">External issue tracker ↗</a></div></section>
      <section className="research-content__section"><h2>Research team</h2><p>Team names, roles, affiliations and contact details have not been supplied for publication in this interface. A verified team directory will be added when those materials are available.</p></section>
      <div className="research-content__columns">
        <section className="research-content__section"><span className="label">Contribute evidence</span><h2>Suggest a missing paper</h2><p>Open a GitHub issue with the article title, DOI or public publisher link, its relevance to the selected materials system and the relationship that deserves inspection.</p><p>Suggestions enter review. A submission does not automatically become a selected claim or an approved graph relation.</p><a className="control" href={`${project}/issues/new?title=Missing%20paper%20suggestion`} target="_blank" rel="noreferrer">Draft an external suggestion ↗</a></section>
        <section className="research-content__section"><span className="label">Improve the instrument</span><h2>Report an error</h2><p>Include the page, release ID, original concept or relation-family ID, steps to reproduce, and expected versus observed behavior. Separate interface faults from terminology, evidence interpretation and source-identity concerns.</p><p>Use public identifiers and your own explanation. Keep private source text, nonredistributable papers and credentials out of public issues.</p><a className="control" href={`${project}/issues/new?title=MatDREAMS%20error%20report`} target="_blank" rel="noreferrer">Draft an external report ↗</a></section>
      </div>
      <aside className="research-content__section research-notice"><h2>How reporting works</h2><p>These links open GitHub. GitHub access and sign-in may be required. MatDREAMS has no submission backend; nothing is sent from this page and no form response is stored here.</p><p>Frontend fixes, scientific adjudication and publication approval follow separate review paths. User suggestions do not modify the frozen research graph.</p></aside>
      <nav className="research-links" aria-label="Project guidance"><a className="control" href="#/manual">Read the Manual</a><a className="control" href="#/materials">Understand the System Chart</a></nav>
    </section>
  )
}

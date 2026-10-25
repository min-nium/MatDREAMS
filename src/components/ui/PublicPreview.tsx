import '../../pages/ResearchContent.css'

interface PreviewSection {
  heading: string
  paragraphs: readonly string[]
}

interface PreviewContent {
  lead: string
  sections: readonly PreviewSection[]
}

const previewContent: Record<string, PreviewContent> = {
  Materials: {
    lead: 'MatDREAMS is an interactive materials-science research website for learning concepts and inspecting literature-derived relationships.',
    sections: [
      {
        heading: 'The scientific problem',
        paragraphs: [
          'Materials research connects processing, intermediate states, properties and performance. Relevant findings are distributed across papers, expressed with different terminology and measured under different conditions. Comparing them requires preserving what each source actually reports.',
          'The System Chart organizes concepts and reported relationships so researchers can move from an overview toward supporting sources. A connected chart is an aid to inspection; it does not establish a validated materials-design recipe.',
        ],
      },
      {
        heading: 'From literature to a System Chart',
        paragraphs: [
          'The workflow records literature selection, extracts reported claims, maps terminology conservatively, constructs typed relation families and projects the resulting graph for exploration. Original claims, direction, conditions and evidence status must remain traceable through these stages.',
          'RHEA and Ni Superalloy are materials-system selections in the interface. No approved public scientific dataset is available for either selection in this preview.',
        ],
      },
      {
        heading: 'What this preview provides',
        paragraphs: [
          'These pages explain the research approach and the capabilities of the presenter-operated private demonstration. Research graph records, evidence quotations and analysis artifacts are withheld from this public website.',
          'The homepage tetrahedron illustrates the materials paradigm. It is a conceptual navigation aid, not a quantitative model or a scientific result.',
        ],
      },
    ],
  },
  Definition: {
    lead: 'Terminology normalization makes concept identities easier to inspect while retaining distinctions that matter physically.',
    sections: [
      {
        heading: 'Why terminology needs review',
        paragraphs: [
          'Different papers can use different names for a similar quantity, or similar names for quantities measured under different conditions. Spelling similarity alone does not establish scientific equivalence.',
          'Conservative normalization records proposed mappings while preserving original terms and unresolved identities. Units, loading mode, measurement context and uncertainty must not disappear through a convenient display label.',
        ],
      },
      {
        heading: 'Learning a concept in the private demonstration',
        paragraphs: [
          'An authorized researcher can search the indexed concepts, inspect an identity and its available terminology record, then follow associated relation families. Definitions are shown only where a record is available; missing definitions remain explicit.',
          'A terminology assignment supports interpretation. It does not independently validate every source claim or settle a disputed scientific meaning.',
        ],
      },
      {
        heading: 'Public terminology records are unavailable',
        paragraphs: [
          'This preview does not publish the private concept index, normalization records or source-derived definitions. Public access requires a separately reviewed and approved release.',
        ],
      },
    ],
  },
  Relations: {
    lead: 'The System Chart connects concept exploration with inspection of reported relationships and their supporting evidence.',
    sections: [
      {
        heading: 'Explore a graph without confusing it with a result',
        paragraphs: [
          'The private demonstration separates the complete indexed graph from the bounded subset currently drawn on the canvas. Search and record indexes provide access beyond the overview, including concepts with no displayed relationship.',
          'Relation families retain their source direction, type, polarity and conditions. Adjacency alone does not establish causality, agreement between papers or a physically compatible engineering route.',
        ],
      },
      {
        heading: 'The presenter-operated exploration sequence',
        paragraphs: [
          'On an authorized local workstation, select a concept, inspect its connected relation families, select a family, then open its supporting-paper and original-evidence records. Source identity and review status remain visible where available; absent fields are stated explicitly.',
          'Fit graph restores the currently rendered neighborhood. Read labels, canvas zoom and pan support closer inspection; neighborhood expansion adds displayed families. Browser zoom is a separate control. Returning to the overview recovers the initial exploration state.',
        ],
      },
      {
        heading: 'The public graph is unavailable',
        paragraphs: [
          'No graph search, private evidence or paper records are served by this public preview. The full research demonstration runs separately on the presenter’s workstation and is not a publicly accessible data service.',
        ],
      },
    ],
  },
  Engineering: {
    lead: 'Scenario exploration helps researchers inspect questions about connections between materials concepts.',
    sections: [
      {
        heading: 'Inspect possible connections',
        paragraphs: [
          'The private demonstration can trace bounded graph paths between selected concepts and expose the original relation families along a path. Researchers can inspect what supports each step and which conditions require further examination.',
          'A path through reported relationships is not a validated processing instruction. Compatible compositions, specimens, measurements and service conditions require separate scientific assessment.',
        ],
      },
      {
        heading: 'Keep exploratory changes distinct',
        paragraphs: [
          'Exploration can distinguish original relationships from a researcher’s hypothetical changes. A hypothetical connection is a question to investigate; it must not become an inferred research finding or alter the frozen source graph.',
          'The interface does not provide a verified physical predictor or certify an engineering route.',
        ],
      },
      {
        heading: 'Public scenario tools are unavailable',
        paragraphs: [
          'The graph needed for scenario exploration has not been approved for public redistribution. This page describes the private demonstration and does not offer public calculations or fabricated example results.',
        ],
      },
    ],
  },
  Analysis: {
    lead: 'Graph construction, technical validation, scientific validation and publication permission answer different questions.',
    sections: [
      {
        heading: 'Construction and technical validation',
        paragraphs: [
          'Construction organizes extracted claims, concept mappings and relation families into a traceable graph. Technical validation checks matters such as data structure, identifiers, references and consistency with the selected release.',
          'Structural accumulation analysis can examine how a graph changes as literature is added. Such a measure concerns the constructed graph; it does not by itself demonstrate literature completeness or scientific truth.',
        ],
      },
      {
        heading: 'Scientific validation remains separate',
        paragraphs: [
          'Scientific assessment asks whether an interpretation is supported by its source, whether publication identity is correct and whether relationships remain meaningful under the relevant physical conditions. Repeated identifiers or multiple supporting records are not automatically independent replication.',
          'A technically consistent graph may still contain uncertainty, disagreement or unresolved concepts. These limits must remain visible during exploration.',
        ],
      },
      {
        heading: 'No public analysis release',
        paragraphs: [
          'Private analysis figures, summary statistics and source documents are withheld from this preview. Successful software checks do not grant permission to publish research artifacts; each public release requires a separate owner publication decision.',
        ],
      },
    ],
  },
  Manual: {
    lead: 'Use this public preview to understand the workflow, and the authorized private demonstration to inspect research records.',
    sections: [
      {
        heading: 'Start with the public pages',
        paragraphs: [
          'Materials introduces the scientific problem and construction workflow. Definition explains terminology normalization. Relations describes evidence navigation. Engineering explains bounded scenario exploration, and Analysis distinguishes technical checks from scientific assessment.',
          'The homepage and all section routes are available for presentation. Pages that require research data clearly identify that public functionality is unavailable.',
        ],
      },
      {
        heading: 'Request a presenter-operated demonstration',
        paragraphs: [
          'An authorized presenter can open the separate local research mode on a workstation with the required frozen artifacts. Begin with the overview, search a concept, select a relation family and inspect its supporting paper and evidence.',
          'Use Fit graph after selecting or expanding a neighborhood. Use Read labels and pan for close inspection, then return to the overview. Keep the complete indexed graph distinct from the subset being rendered.',
        ],
      },
      {
        heading: 'Availability and reproduction limits',
        paragraphs: [
          'The public deployment contains the website and explanatory content. It does not provide private research artifacts, local source documents or a public research-data endpoint. Cloning the frontend alone does not reproduce the private research demonstration.',
          'The project repository documents the frontend. Research reproduction and publication of scientific artifacts require their own reviewed materials and authorization.',
        ],
      },
    ],
  },
}

export function PublicPreview({ title }: { title: string }) {
  const content = previewContent[title]
  return <div className="research-content">
    <aside className="research-notice" role="note">
      <h2>Public preview · research data unavailable</h2>
      <p>No approved public research export is configured. This website explains MatDREAMS; private graph and evidence access remains in the separate local demonstration.</p>
    </aside>
    {content && <>
      <p className="research-content__lead">{content.lead}</p>
      {content.sections.map(section => <section className="research-content__section" key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </section>)}
    </>}
    <nav className="research-links" aria-label={`Continue exploring ${title}`}>
      <a className="control" href="#/materials">About the System Chart</a>
      <a className="control" href="#/relations">Exploration guide</a>
      <a className="control" href="https://github.com/min-nium/MatDREAMS" target="_blank" rel="noreferrer">GitHub project ↗</a>
    </nav>
  </div>
}

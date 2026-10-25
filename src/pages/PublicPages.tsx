import { PublicPreview } from '../components/ui/PublicPreview'
import '../styles/research.css'

function PublicSection({ title }: { title: string }) {
  return <section className="research-page"><h1>{title}</h1><PublicPreview title={title} /></section>
}

export function MaterialsPage() { return <PublicSection title="Materials" /> }
export function DefinitionPage() { return <PublicSection title="Definition" /> }
export function RelationsPage() { return <PublicSection title="Relations" /> }
export function EngineeringPage() { return <PublicSection title="Engineering" /> }
export function AnalysisPage() { return <PublicSection title="Analysis" /> }
export function ManualPage() { return <PublicSection title="Manual" /> }

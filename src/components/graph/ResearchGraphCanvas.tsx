import { useMemo, useRef, useState } from 'react'
import type { LegacyCore, IndexedView, ResearchDisplay, ResearchNode, ResearchRelation } from '../../types/research'
import './researchGraph.css'

interface Props {
  display: ResearchDisplay
  view: IndexedView
  core: LegacyCore
  selectedNode: string | null
  selectedEdge: string | null
  onNode: (node: ResearchNode) => void
  onEdge: (edge: ResearchRelation) => void
}

/** Role columns and Bézier geometry adapted from legacy app.js drawChart. */
export function ResearchGraphCanvas({ display, view, core, selectedNode, selectedEdge, onNode, onEdge }: Props) {
  const layout = useMemo(() => {
    const roles = ['Processing', 'Intermediate State', 'Property', 'Performance']
    if (display.nodes.some((node) => !roles.includes(node.role))) roles.push('Other roles')
    const width = roles.length * 255 + 45
    const colWidth = (width - 24 - 34 * (roles.length - 1)) / roles.length
    const groups = roles.map((role) => core.columnNodes(view, [...display.nodes], role))
    const height = 60 + Math.max(4, ...groups.map((group) => group.length)) * 82
    const positions = new Map<string, { x: number; y: number; w: number; h: number }>()
    groups.forEach((group, column) => group.forEach((node, row) => positions.set(node.id, { x: 12 + column * (colWidth + 34), y: 45 + row * 82, w: colWidth, h: 68 })))
    return { roles, width, height, colWidth, positions }
  }, [display.nodes, view, core])
  const fit = Math.min(1, 580 / layout.height)
  const focusPosition = selectedNode ? layout.positions.get(selectedNode) : null
  const initialScale = focusPosition ? 2 : fit
  const [scale, setScale] = useState(initialScale)
  const [offset, setOffset] = useState(focusPosition ? { x: layout.width / 2 - (focusPosition.x + focusPosition.w / 2) * initialScale, y: 280 - (focusPosition.y + 34) * initialScale } : { x: (layout.width - layout.width * fit) / 2, y: 0 })
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  return <div className="research-canvas dark-field">
    <div className="canvas-controls">
      <button onClick={() => setScale((value) => Math.min(3, value * 1.25))} aria-label="Zoom in graph">+</button>
      <button onClick={() => setScale((value) => Math.max(0.08, value / 1.25))} aria-label="Zoom out graph">−</button>
      <button onClick={() => { setScale(fit); setOffset({ x: 0, y: 0 }) }}>Fit graph</button>
      <button onClick={() => {
        const readable = Math.min(3, layout.width / (svg.current?.getBoundingClientRect().width || layout.width))
        setScale(readable)
        setOffset(focusPosition ? { x: layout.width / 2 - (focusPosition.x + focusPosition.w / 2) * readable, y: 280 - (focusPosition.y + 34) * readable } : { x: 0, y: 0 })
      }}>Read labels</button>
      <button onClick={() => setOffset((value) => ({ ...value, x: value.x + 80 }))} aria-label="Pan graph right">→</button>
      <button onClick={() => setOffset((value) => ({ ...value, x: value.x - 80 }))} aria-label="Pan graph left">←</button>
      <button onClick={() => setOffset((value) => ({ ...value, y: value.y + 80 }))} aria-label="Pan graph down">↓</button>
      <button onClick={() => setOffset((value) => ({ ...value, y: value.y - 80 }))} aria-label="Pan graph up">↑</button>
      <span>{Math.round(scale * 100)}% · Drag empty canvas to pan</span>
    </div>
    <svg ref={svg} viewBox={`0 0 ${layout.width} 620`} role="group" aria-label={`Graph canvas: ${display.nodes.length} displayed nodes and ${display.edges.length} displayed relation families`}
      onPointerDown={(event) => { if ((event.target as Element).closest('[role="button"]')) return; event.currentTarget.setPointerCapture(event.pointerId); setDrag({ x: event.clientX, y: event.clientY }) }}
      onPointerMove={(event) => { if (!drag) return; const ratio = layout.width / event.currentTarget.getBoundingClientRect().width; setOffset((value) => ({ x: value.x + (event.clientX - drag.x) * ratio, y: value.y + (event.clientY - drag.y) * ratio })); setDrag({ x: event.clientX, y: event.clientY }) }}
      onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
      <defs><marker id="research-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9z" fill="currentColor" /></marker></defs>
      <g transform={`translate(${offset.x} ${offset.y}) scale(${scale})`}>
        {layout.roles.map((role, i) => <g key={role}><rect className="graph-column" x={9 + i * (layout.colWidth + 34)} y={8} width={layout.colWidth + 6} height={layout.height - 16} /><text className="graph-role" x={22 + i * (layout.colWidth + 34)} y={28}>{role}</text></g>)}
        {display.edges.map((edge) => {
          const a = layout.positions.get(edge.source), b = layout.positions.get(edge.target)
          if (!a || !b) return null
          const ay = a.y + 34, by = b.y + 34
          let path: string
          if (edge.source === edge.target) path = `M${a.x + a.w},${ay - 13} C${a.x + a.w + 35},${ay - 33} ${a.x + a.w + 35},${ay + 33} ${a.x + a.w},${ay + 13}`
          else if (Math.abs(a.x - b.x) < 1) path = `M${a.x + a.w},${ay} C${a.x + a.w + 28},${ay} ${a.x + a.w + 28},${by} ${b.x + b.w},${by}`
          else { const ax = a.x < b.x ? a.x + a.w : a.x, bx = a.x < b.x ? b.x : b.x + b.w; const mid = (ax + bx) / 2; path = `M${ax},${ay} C${mid},${ay} ${mid},${by} ${bx},${by}` }
          return <g key={edge.id} role="button" tabIndex={0} aria-label={`Select relation ${edge.id}: ${view.nodes.get(edge.source)?.label} ${edge.directed ? 'to' : 'with'} ${view.nodes.get(edge.target)?.label}; ${edge.relation_type}; ${edge.polarity}`} className={`graph-edge ${edge.id === selectedEdge ? 'is-selected' : ''}`} onClick={() => onEdge(edge)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onEdge(edge) } }}>
            <title>{edge.relation_type} · {edge.polarity} · {edge.support} provisional paper IDs</title><path className="graph-edge-hit" d={path} /><path className="graph-edge-line" d={path} markerEnd={edge.directed ? 'url(#research-arrow)' : undefined} strokeDasharray={edge.polarity === 'negative' ? '6 4' : undefined} />
          </g>
        })}
        {display.nodes.map((node) => {
          const p = layout.positions.get(node.id)
          if (!p) return null
          return <g key={node.id} className={`graph-node ${node.id === selectedNode ? 'is-selected' : ''}`} role="button" tabIndex={0} aria-label={`Select concept ${node.label}, ${node.role}, ID ${node.id}`} onClick={() => onNode(node)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onNode(node) } }}>
            <title>{node.label} · {node.id} · {node.role}</title><rect x={p.x} y={p.y} width={p.w} height={p.h} /><text x={p.x + 10} y={p.y + 22}>{core.wrapLabel(node.label, 25, 2).map((line, index) => <tspan key={index} x={p.x + 10} dy={index ? 15 : 0}>{line}</tspan>)}</text><text className="graph-support" x={p.x + 10} y={p.y + 57}>{node.paper_count} paper IDs · {node.id.slice(-7)}</text>
          </g>
        })}
      </g>
    </svg>
    {!display.nodes.length && <p>No nodes match the current drawing filters. This is not evidence of no scientific effect.</p>}
  </div>
}

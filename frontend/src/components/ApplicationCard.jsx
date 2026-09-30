import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export default function ApplicationCard({ app, dragging = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const inner = (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-3)] p-3">
      <div className="text-sm font-medium leading-snug text-white">
        {app.role_title}
      </div>
      {app.company?.name && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Building2 size={12} />
          <span className="truncate">{app.company.name}</span>
        </div>
      )}
    </div>
  )

  if (dragging) {
    return (
      <div className="cursor-grabbing rounded-lg border border-[var(--accent)] bg-[var(--bg-3)] p-3 shadow-lg">
        <div className="text-sm font-medium text-white">{app.role_title}</div>
        {app.company?.name && (
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            {app.company.name}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <Link to={`/applications/${app.id}`} onClick={(e) => e.stopPropagation?.()}>
        {inner}
      </Link>
    </div>
  )
}
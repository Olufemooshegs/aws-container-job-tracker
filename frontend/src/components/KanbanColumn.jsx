import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ApplicationCard from './ApplicationCard'
import { STATUS_META } from '../constants'

export default function KanbanColumn({ status, apps }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = STATUS_META[status]

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[400px] flex-col rounded-xl border p-3 transition ${
        isOver
          ? 'border-[var(--accent)] bg-[var(--bg-3)]'
          : 'border-[var(--border)] bg-[var(--bg-2)]'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: meta.color }}
          />
          <span className="text-sm font-semibold text-white">{meta.label}</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{apps.length}</span>
      </div>

      <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2">
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}

          {apps.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[var(--border)] py-8 text-center text-xs text-[var(--text-muted)]">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

import { applicationsApi, companiesApi } from '../api'
import { STATUS_ORDER, STATUS_META } from '../constants'
import KanbanColumn from '../components/KanbanColumn'
import ApplicationCard from '../components/ApplicationCard'
import NewApplicationModal from '../components/NewApplicationModal'

export default function Applications() {
  const qc = useQueryClient()
  const [activeApp, setActiveApp] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  })
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list(),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => applicationsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    onError: () => toast.error('Failed to update'),
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = apps.filter((a) => a.status === status)
    return acc
  }, {})

  const handleDragStart = (e) => {
    const app = apps.find((a) => a.id === e.active.id)
    setActiveApp(app)
  }

  const handleDragEnd = (e) => {
    setActiveApp(null)
    const { active, over } = e
    if (!over) return

    // Determine target column: either dropped on a column or on another card
    let targetStatus = over.id
    if (!STATUS_ORDER.includes(targetStatus)) {
      const overApp = apps.find((a) => a.id === over.id)
      if (!overApp) return
      targetStatus = overApp.status
    }

    const currentApp = apps.find((a) => a.id === active.id)
    if (!currentApp || currentApp.status === targetStatus) return

    updateStatus.mutate({ id: currentApp.id, status: targetStatus })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Drag cards between columns to update status
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          <Plus size={16} />
          New application
        </button>
      </div>

      {isLoading ? (
        <div className="text-[var(--text-muted)]">Loading…</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                apps={grouped[status] || []}
              />
            ))}
          </div>

          <DragOverlay>
            {activeApp ? <ApplicationCard app={activeApp} dragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {modalOpen && (
        <NewApplicationModal
          companies={companies}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            qc.invalidateQueries({ queryKey: ['applications'] })
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
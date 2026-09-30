import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Trash2, ExternalLink, X } from 'lucide-react'
import { companiesApi } from '../api'

export default function Companies() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list(),
  })

  const deleteCompany = useMutation({
    mutationFn: (id) => companiesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Deleted')
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Companies you're tracking
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          <Plus size={16} />
          New company
        </button>
      </div>

      {isLoading ? (
        <div className="text-[var(--text-muted)]">Loading…</div>
      ) : companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--text-muted)]">
          No companies yet. Add one to start tracking applications.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <div
              key={c.id}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-5 transition hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white">{c.name}</h3>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${c.name}?`)) deleteCompany.mutate(c.id)
                  }}
                  className="rounded p-1 text-[var(--text-muted)] opacity-0 transition group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {c.website && (
                <a
                  href={c.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                >
                  <ExternalLink size={11} />
                  {new URL(c.website).hostname}
                </a>
              )}

              {c.notes && (
                <p className="mt-3 line-clamp-2 text-sm text-[var(--text-muted)]">
                  {c.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <NewCompanyModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            qc.invalidateQueries({ queryKey: ['companies'] })
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function NewCompanyModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [notes, setNotes] = useState('')

  const create = useMutation({
    mutationFn: companiesApi.create,
    onSuccess: () => {
      toast.success('Company added')
      onCreated()
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    create.mutate({ name, website: website || null, notes: notes || null })
  }

  const inputClass =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New company</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-3)] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Google"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Website (optional)
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://google.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {create.isPending ? 'Creating…' : 'Create company'}
          </button>
        </form>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { applicationsApi } from '../api'
import { STATUS_ORDER, STATUS_META } from '../constants'

export default function NewApplicationModal({ companies, onClose, onCreated }) {
  const [roleTitle, setRoleTitle] = useState('')
  const [companyId, setCompanyId] = useState(companies[0]?.id || '')
  const [status, setStatus] = useState('wishlist')
  const [jobUrl, setJobUrl] = useState('')

  const create = useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      toast.success('Application added')
      onCreated()
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to create')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    create.mutate({
      role_title: roleTitle,
      company_id: Number(companyId),
      status,
      job_url: jobUrl || null,
    })
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
          <h2 className="text-lg font-semibold text-white">New application</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-3)] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--text-muted)]">
            Add a company first before creating an application.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                Role title
              </label>
              <input
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Senior Backend Engineer"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                Company
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className={inputClass}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                Job URL (optional)
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={create.isPending}
              className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {create.isPending ? 'Creating…' : 'Create application'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
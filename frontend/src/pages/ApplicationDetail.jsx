import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Calendar, ExternalLink, Trash2, Plus, Building2,
} from 'lucide-react'
import { format } from 'date-fns'

import { applicationsApi, interviewsApi } from '../api'
import { STATUS_ORDER, STATUS_META } from '../constants'

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const appId = Number(id)

  const { data: app, isLoading } = useQuery({
    queryKey: ['applications', appId],
    queryFn: () => applicationsApi.get(appId),
  })
  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews', appId],
    queryFn: () => interviewsApi.list(appId),
  })

  const updateApp = useMutation({
    mutationFn: (data) => applicationsApi.update(appId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Updated')
    },
  })

  const deleteApp = useMutation({
    mutationFn: () => applicationsApi.delete(appId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Deleted')
      navigate('/applications')
    },
  })

  const createInterview = useMutation({
    mutationFn: (data) => interviewsApi.create(appId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews', appId] })
      toast.success('Interview added')
    },
  })

  const deleteInterview = useMutation({
    mutationFn: (iid) => interviewsApi.delete(iid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews', appId] })
    },
  })

  if (isLoading) return <div className="text-[var(--text-muted)]">Loading…</div>
  if (!app) return <div className="text-[var(--text-muted)]">Not found</div>

  const meta = STATUS_META[app.status]

  return (
    <div>
      <Link
        to="/applications"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to applications
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{app.role_title}</h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Building2 size={14} />
                  <span>{app.company?.name}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Delete this application?')) deleteApp.mutate()
                }}
                className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {app.job_url && (
              <a
                href={app.job_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
              >
                <ExternalLink size={14} />
                View original posting
              </a>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_ORDER.map((s) => {
                  const m = STATUS_META[s]
                  const active = app.status === s
                  return (
                    <button
                      key={s}
                      onClick={() => updateApp.mutate({ status: s })}
                      className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                      style={{
                        background: active ? m.color : `${m.color}22`,
                        color: active ? 'white' : m.color,
                      }}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {app.notes && (
              <div className="mt-6">
                <div className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                  Notes
                </div>
                <div className="whitespace-pre-wrap text-sm text-[var(--text)]">
                  {app.notes}
                </div>
              </div>
            )}
          </div>

          {/* Interviews */}
          <InterviewsSection
            interviews={interviews}
            onAdd={(data) => createInterview.mutate(data)}
            onDelete={(iid) => deleteInterview.mutate(iid)}
          />
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
            <div className="text-xs font-medium text-[var(--text-muted)]">Created</div>
            <div className="mt-1 text-sm text-white">
              {app.created_at ? format(new Date(app.created_at), 'PP') : '—'}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
            <div className="text-xs font-medium text-[var(--text-muted)]">
              Last updated
            </div>
            <div className="mt-1 text-sm text-white">
              {app.updated_at ? format(new Date(app.updated_at), 'PPp') : '—'}
            </div>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{ borderColor: `${meta.color}55`, background: `${meta.color}11` }}
          >
            <div className="text-xs font-medium" style={{ color: meta.color }}>
              Current status
            </div>
            <div className="mt-1 text-lg font-semibold text-white">{meta.label}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InterviewsSection({ interviews, onAdd, onDelete }) {
  const [date, setDate] = useState('')
  const [roundName, setRoundName] = useState('')
  const [notes, setNotes] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!date) return
    onAdd({
      scheduled_at: new Date(date).toISOString(),
      round_name: roundName || null,
      notes: notes || null,
      outcome: 'pending',
    })
    setDate('')
    setRoundName('')
    setNotes('')
  }

  const inputClass =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]'

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Interviews</h2>

      {interviews.length === 0 && (
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          No interviews scheduled yet.
        </p>
      )}

      <div className="space-y-3">
        {interviews.map((iv) => (
          <div
            key={iv.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-3)] p-3"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Calendar size={14} className="text-[var(--accent)]" />
                {iv.scheduled_at ? format(new Date(iv.scheduled_at), 'PPp') : '—'}
              </div>
              {iv.round_name && (
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  {iv.round_name}
                </div>
              )}
              {iv.notes && (
                <div className="mt-1 text-xs text-[var(--text-muted)]">{iv.notes}</div>
              )}
            </div>
            <button
              onClick={() => onDelete(iv.id)}
              className="rounded p-1 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="mt-5 space-y-3 border-t border-[var(--border)] pt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Round (e.g. Phone screen)"
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            className={inputClass}
          />
        </div>
        <input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          <Plus size={14} />
          Add interview
        </button>
      </form>
    </div>
  )
}
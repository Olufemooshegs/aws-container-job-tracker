import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Briefcase, Building2, Send, MessageSquare, Award, XCircle, Target,
} from 'lucide-react'
import { applicationsApi, companiesApi } from '../api'
import { STATUS_META } from '../constants'

export default function Dashboard() {
  const { data: apps = [], isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  })
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list(),
  })

  const counts = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  const stats = [
    { key: 'total', label: 'Total applications', value: apps.length, icon: Briefcase, color: '#6366f1' },
    { key: 'applied', label: 'Applied', value: counts.applied || 0, icon: Send, color: '#3b82f6' },
    { key: 'interview', label: 'Interviews', value: counts.interview || 0, icon: MessageSquare, color: '#f59e0b' },
    { key: 'offer', label: 'Offers', value: counts.offer || 0, icon: Award, color: '#10b981' },
    { key: 'rejected', label: 'Rejected', value: counts.rejected || 0, icon: XCircle, color: '#ef4444' },
    { key: 'wishlist', label: 'Wishlist', value: counts.wishlist || 0, icon: Target, color: '#8b5cf6' },
    { key: 'companies', label: 'Companies', value: companies.length, icon: Building2, color: '#06b6d4' },
  ]

  const recent = apps.slice(0, 5)
  const loading = appsLoading || companiesLoading

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Your job search at a glance
        </p>
      </div>

      {loading ? (
        <div className="text-[var(--text-muted)]">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.key}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                    <Icon size={16} style={{ color: s.color }} />
                  </div>
                  <div className="mt-2 text-3xl font-bold text-white">{s.value}</div>
                </div>
              )
            })}
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent applications</h2>
              <Link
                to="/applications"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
                No applications yet.{' '}
                <Link to="/applications" className="text-[var(--accent)] hover:underline">
                  Add your first one →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-2)]">
                {recent.map((app) => {
                  const meta = STATUS_META[app.status]
                  return (
                    <Link
                      key={app.id}
                      to={`/applications/${app.id}`}
                      className="flex items-center justify-between gap-4 p-4 transition hover:bg-[var(--bg-3)]"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-white">
                          {app.role_title}
                        </div>
                        <div className="truncate text-sm text-[var(--text-muted)]">
                          {app.company?.name}
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: `${meta.color}22`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

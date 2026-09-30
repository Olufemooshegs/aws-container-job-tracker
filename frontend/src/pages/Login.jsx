import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Briefcase } from 'lucide-react'
import { useAuth } from '../auth'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password, fullName)
        toast.success('Account created!')
      } else {
        await login(email, password)
        toast.success('Welcome back!')
      }
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-3)] px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none transition focus:border-[var(--accent)]'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]">
            <Briefcase size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isRegister
              ? 'Track every application in one place'
              : 'Sign in to continue to Job Tracker'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6"
        >
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>

          <div className="text-center text-sm text-[var(--text-muted)]">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
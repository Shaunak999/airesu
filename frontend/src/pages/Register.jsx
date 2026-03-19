import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../api'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password_confirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const phraseCloud = [
    'Quantify project impact',
    'Highlight collaboration',
    'Show internship-ready outcomes',
    'Map skills to job description',
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== password_confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await auth.register(username, email, password, password_confirm)
      navigate('/login', { state: { message: 'Account created. Please sign in.' } })
    } catch (err) {
      const data = err.response?.data
      if (!err.response) {
        setError(`Cannot reach server at ${API_BASE}. Check backend status and CORS_ALLOWED_ORIGINS.`)
        return
      }
      if (typeof data === 'object' && data !== null) {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join(', ')
        setError(msg || `Server error (${err.response.status})`)
      } else {
        setError(data?.detail || data || `Registration failed (${err.response.status})`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] bottom-[18%] h-32 w-32 rounded-full bg-blue-500/10 blur-2xl animate-float" />
        <div className="absolute right-[12%] top-[15%] h-28 w-28 rounded-full bg-indigo-300/20 blur-2xl animate-pulse-soft" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6">
        <div className="hidden lg:flex surface-card p-8 animate-fade-up flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile Strategy</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 leading-tight headline">
              Create your workspace and improve resume quality with measurable clarity.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {phraseCloud.map((item, idx) => (
              <span key={item} className="phrase-chip rounded-xl px-3 py-2 text-xs motion-safe:animate-drift" style={{ animationDelay: `${idx * 0.25}s` }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full surface-card p-8 animate-pop">
        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2 tracking-tight headline">
          Create account
        </h1>
        <p className="text-slate-600 text-center text-sm mb-8">
          Join Resume Studio and start improving role alignment
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-up">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="soft-input"
              placeholder="Username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="soft-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="soft-input"
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={password_confirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="soft-input"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 primary-btn"
          >
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-700 hover:text-blue-600 transition-colors">
            Sign in
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}

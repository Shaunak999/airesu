import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../api'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const highlights = [
    'Tailor resume content to role requirements',
    'Improve ATS keyword match before applying',
    'Track missing skills and close gaps faster',
  ]

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message)
      window.history.replaceState({}, '', location.pathname)
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await auth.login(username, password)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      navigate('/dashboard')
    } catch (err) {
      if (!err.response) {
        setError(`Cannot reach server at ${API_BASE}. Check backend status and CORS_ALLOWED_ORIGINS.`)
        return
      }
      setError(err.response?.data?.detail || err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden isolate">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[12%] top-[18%] h-32 w-32 rounded-full bg-blue-500/10 blur-2xl animate-float" />
        <div className="absolute right-[15%] bottom-[20%] h-28 w-28 rounded-full bg-indigo-300/20 blur-2xl animate-pulse-soft" />
        <div className="absolute left-[22%] top-[20%] hidden xl:block h-24 w-24 rounded-full border border-blue-300/40">
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-blue-500/70 -translate-x-1/2 -translate-y-1/2 animate-orbit" />
        </div>
        <div className="absolute right-[20%] bottom-[18%] hidden xl:block h-28 w-28 rounded-full border border-indigo-300/40">
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-indigo-500/70 -translate-x-1/2 -translate-y-1/2 animate-orbit [animation-delay:1.8s]" />
        </div>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden 2xl:block max-w-[220px]">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-3">Career Toolkit</p>
          <div className="flex flex-col gap-2">
            {highlights.map((item, idx) => (
              <span key={item} className="phrase-chip rounded-xl px-3 py-2 text-[11px] motion-safe:animate-drift" style={{ animationDelay: `${idx * 0.3}s` }}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden 2xl:block">
          <div className="phrase-chip rounded-2xl px-4 py-2 text-[11px] uppercase tracking-[0.2em] mb-2">
            ATS Keyword Coverage
          </div>
          <div className="phrase-chip rounded-2xl px-4 py-2 text-[11px] uppercase tracking-[0.2em]">
            Recruiter Readability
          </div>
        </div>
      </div>

      <div className="w-full max-w-md surface-card p-8 animate-pop relative z-10">
        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2 tracking-tight headline">
          Resume Studio
        </h1>
        <p className="text-slate-600 text-center text-sm mb-8">
          Sign in to optimize your resume for role-fit applications
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm animate-fade-up">
              {message}
            </div>
          )}
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
              placeholder="Your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-700 hover:text-blue-600 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

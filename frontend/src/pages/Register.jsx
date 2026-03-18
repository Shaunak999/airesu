import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password_confirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')


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
        setError('Cannot reach server at . Check backend status and CORS_ALLOWED_ORIGINS.')
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
        <div className="absolute left-[10%] bottom-[18%] h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl animate-float" />
        <div className="absolute right-[12%] top-[15%] h-28 w-28 rounded-full bg-cyan-400/15 blur-2xl animate-pulse-soft" />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/75 backdrop-blur-xl p-8 shadow-2xl shadow-slate-950/60 animate-pop">
        <h1 className="text-3xl font-bold text-center text-emerald-300 mb-2 tracking-tight">
          Create account
        </h1>
        <p className="text-slate-300 text-center text-sm mb-8">
          Join to start analyzing your resume
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-up">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300"
              placeholder="Username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300"
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm password</label>
            <input
              type="password"
              value={password_confirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-300 text-slate-900 font-semibold hover:from-emerald-300 hover:to-cyan-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-300 hover:text-emerald-200 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


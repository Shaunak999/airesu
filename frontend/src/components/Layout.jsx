import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  const nav = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/upload', label: 'Upload Resume' },
    { to: '/match', label: 'Job Match' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink to="/dashboard" className="text-xl font-semibold text-emerald-400">
            AI Resume Analyzer
          </NavLink>
          <nav className="flex items-center gap-6">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="text-sm text-slate-400 hover:text-red-400 transition"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

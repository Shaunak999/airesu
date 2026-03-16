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
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-8 left-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl animate-pulse-soft" />
        <div className="absolute top-28 right-10 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl animate-float" />
      </div>
      <header className="border-b border-slate-800/80 bg-slate-900/65 backdrop-blur-xl animate-fade-up">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink to="/dashboard" className="text-xl font-semibold text-emerald-300 tracking-wide">
            AI Resume Analyzer
          </NavLink>
          <nav className="flex items-center gap-3 sm:gap-4">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-emerald-200 bg-emerald-500/20 border border-emerald-400/30 shadow-sm shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-full text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 animate-fade-up-delay">
        <Outlet />
      </main>
    </div>
  )
}

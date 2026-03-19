import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  const phrases = [
    'ATS-friendly resume',
    'Impact-focused bullet points',
    'Role-fit skill alignment',
    'Keyword coverage map',
  ]

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
        <div className="absolute top-8 left-10 h-28 w-28 rounded-full bg-blue-400/10 blur-2xl animate-pulse-soft" />
        <div className="absolute top-28 right-10 h-24 w-24 rounded-full bg-indigo-300/20 blur-2xl animate-float" />
        <div className="absolute inset-x-0 bottom-6 hidden md:flex justify-center gap-3 px-4">
          {phrases.map((text, idx) => (
            <span
              key={text}
              className={`phrase-chip rounded-full px-3 py-1 text-xs tracking-wide motion-safe:animate-drift ${
                idx % 2 === 0 ? 'motion-safe:[animation-delay:0.5s]' : 'motion-safe:[animation-delay:1.2s]'
              }`}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xl animate-fade-up">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink to="/dashboard" className="text-xl font-semibold text-slate-900 tracking-wide headline">
            Resume Studio
          </NavLink>
          <nav className="flex items-center gap-3 sm:gap-4">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-blue-700 bg-blue-100 border border-blue-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-full text-slate-600 hover:text-red-600 hover:bg-red-100/70 transition-all duration-300"
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

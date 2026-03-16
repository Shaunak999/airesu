import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboard } from '../api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboard
      .get()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
        {error}
      </div>
    )
  }

  if (!data?.has_resume) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-slate-200 mb-2">No resume yet</h2>
        <p className="text-slate-400 mb-6">{data?.message || 'Upload a PDF resume to get started.'}</p>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-medium hover:bg-emerald-400"
        >
          Upload Resume
        </Link>
      </div>
    )
  }

  const { resume, skills_found } = data
  const detectedSkills = skills_found || []
  const targetSkills = [
    'Python',
    'JavaScript',
    'React',
    'Django',
    'SQL',
    'Docker',
    'AWS',
    'Git',
    'REST API',
    'CI/CD',
  ]
  const matchedTargetSkills = targetSkills.filter((skill) =>
    detectedSkills.some((found) => found.toLowerCase() === skill.toLowerCase())
  )
  const coverage = targetSkills.length
    ? Math.round((matchedTargetSkills.length / targetSkills.length) * 100)
    : 0
  const coverageBarWidth = `${coverage}%`
  const chartData = targetSkills.map((skill) => ({
    name: skill,
    covered: matchedTargetSkills.includes(skill) ? 100 : 0,
  }))

  const suggestions = [
    'Add Docker experience',
    'Mention cloud platforms',
    'Include GitHub projects',
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-2">{data.message}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800/80 border border-slate-700 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Latest resume
          </h3>
          <p className="text-slate-100 font-semibold truncate">{resume?.original_filename || 'Resume'}</p>
          <p className="text-slate-400 text-sm mt-2">
            Uploaded {resume?.created_at ? new Date(resume.created_at).toLocaleDateString() : ''}
          </p>
          <Link to="/upload" className="mt-4 inline-block text-sm text-emerald-300 hover:text-emerald-200">
            Upload new resume
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800/80 border border-slate-700 shadow-lg md:col-span-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Skills detected
          </h3>
          {detectedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detectedSkills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-200 text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No skills extracted from this resume.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Skill Coverage
          </h3>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-300">Coverage</span>
            <span className="text-emerald-300 font-semibold">{coverage}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-700/70 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: coverageBarWidth }} />
          </div>
          <p className="mt-3 text-sm text-slate-400">
            {matchedTargetSkills.length} of {targetSkills.length} target skills detected.
          </p>
          <p className="mt-1 text-sm text-slate-500">Skill Coverage: {coverage}%</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Suggestions
          </h3>
          <ul className="space-y-2 text-slate-200">
            {suggestions.map((item) => (
              <li key={item} className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
                - {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-lg">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Skill Coverage Chart
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: 'rgba(15, 23, 42, 0.45)' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
              />
              <Bar dataKey="covered" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.covered > 0 ? '#34d399' : '#475569'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-lg">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Get match score
        </h3>
        <p className="text-slate-300 mb-4">
          Paste a job description in the Match tab to see how well your resume fits and which skills you're missing.
        </p>
        <Link
          to="/match"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-medium hover:bg-emerald-400"
        >
          Go to Job Match
        </Link>
      </div>
    </div>
  )
}

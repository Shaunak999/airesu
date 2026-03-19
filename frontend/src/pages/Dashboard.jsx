import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboard, resumes } from '../api'
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
  const [allResumes, setAllResumes] = useState([])
  const [latestRanking, setLatestRanking] = useState(null)

  useEffect(() => {
    try {
      const cached = localStorage.getItem('latest_ranking')
      if (cached) setLatestRanking(JSON.parse(cached))
    } catch (_) {
      setLatestRanking(null)
    }

    Promise.all([dashboard.get(), resumes.list()])
      .then(([dashboardRes, resumesRes]) => {
        setData(dashboardRes.data)
        setAllResumes(resumesRes.data || [])
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-500">Loading dashboard...</div>
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
        <h2 className="text-xl font-semibold text-slate-800 mb-2">No resumes yet</h2>
        <p className="text-slate-600 mb-6">{data?.message || 'Upload candidate resumes to get started.'}</p>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500"
        >
          Upload Candidate Resume
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
  const resumeIdSet = new Set(allResumes.map((item) => item.id))
  const validRankedCandidates = (latestRanking?.ranked_candidates || []).filter((candidate) =>
    resumeIdSet.has(candidate.resume_id)
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 headline">Dashboard</h1>
        <p className="text-slate-600 mt-2">{data.message}</p>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Active Job Description</p>
        {data.active_job_profile ? (
          <div>
            <p className="text-slate-900 font-semibold">{data.active_job_profile.title}</p>
            <p className="text-slate-600 text-sm mt-1 line-clamp-2">
              {data.active_job_profile.description}
            </p>
            <p className="text-slate-500 text-xs mt-2">Total resumes uploaded: {data.resumes_count || 0}</p>
          </div>
        ) : (
          <p className="text-slate-600 text-sm">No active job description. Add one from the Match page.</p>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="p-4 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Latest resume
          </h3>
          <p className="text-slate-900 font-semibold truncate">{resume?.original_filename || 'Resume'}</p>
          <p className="text-slate-600 text-sm mt-2">
            Uploaded {resume?.created_at ? new Date(resume.created_at).toLocaleDateString() : ''}
          </p>
          <Link to="/upload" className="mt-4 inline-block text-sm text-blue-700 hover:text-blue-600">
            Upload new resume
          </Link>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg md:col-span-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Skills detected
          </h3>
          {detectedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detectedSkills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm"
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

      <div className="p-4 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Uploaded Resumes
        </h3>
        {allResumes.length > 0 ? (
          <div className="space-y-2">
            {allResumes.map((item, idx) => (
              <Link
                key={item.id}
                to={`/resumes/${item.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:border-blue-200 hover:bg-blue-50/40 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {idx + 1}. {item.original_filename}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                  </p>
                </div>
                <span className="text-xs text-blue-700 font-semibold">View</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No resumes uploaded yet.</p>
        )}
      </div>

      {validRankedCandidates.length > 0 && (
        <div className="p-4 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Latest Ranked Candidates
          </h3>
          <div className="space-y-2">
            {validRankedCandidates.map((candidate) => (
              <Link
                key={candidate.resume_id}
                to={`/resumes/${candidate.resume_id}`}
                state={{ candidate, jobTitle: latestRanking?.job_profile?.title }}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:border-blue-200 hover:bg-blue-50/40 transition"
              >
                <p className="text-sm font-medium text-slate-800 truncate">
                  #{candidate.rank} {candidate.resume_name}
                </p>
                <span className="text-xs text-blue-700 font-semibold">{candidate.match_score}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="p-4 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Skill Coverage
          </h3>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-700">Coverage</span>
            <span className="text-blue-700 font-semibold">{coverage}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500" style={{ width: coverageBarWidth }} />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {matchedTargetSkills.length} of {targetSkills.length} target skills detected.
          </p>
          <p className="mt-1 text-sm text-slate-500">Skill Coverage: {coverage}%</p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Suggestions
          </h3>
          <ul className="space-y-2 text-slate-700">
            {suggestions.map((item) => (
              <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                - {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Skill Coverage Chart
        </h3>
        <div className="h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#334155' }}
              />
              <Bar dataKey="covered" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.covered > 0 ? '#2563eb' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Get match score
        </h3>
        <p className="text-slate-700 mb-4">
          Paste a job description in the Match tab to see how well your resume fits and which skills you're missing.
        </p>
        <Link
          to="/match"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500"
        >
          Go to Job Match
        </Link>
      </div>
    </div>
  )
}

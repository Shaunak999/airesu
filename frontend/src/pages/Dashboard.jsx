import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboard } from '../api'

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">{data.message}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
            Latest resume
          </h3>
          <p className="text-slate-200 font-medium">{resume?.original_filename || 'Resume'}</p>
          <p className="text-slate-500 text-sm mt-1">
            Uploaded {resume?.created_at ? new Date(resume.created_at).toLocaleDateString() : ''}
          </p>
          <Link to="/upload" className="mt-3 inline-block text-sm text-emerald-400 hover:underline">
            Upload new resume
          </Link>
        </div>

        <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
            Skills detected
          </h3>
          {skills_found?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills_found.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-sm"
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

      <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
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

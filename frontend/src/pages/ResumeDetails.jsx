import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { resumes } from '../api'

export default function ResumeDetails() {
  const { id } = useParams()
  const location = useLocation()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const candidateMeta = location.state?.candidate
  const jobTitle = location.state?.jobTitle

  useEffect(() => {
    resumes
      .get(id)
      .then(({ data }) => setResume(data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Resume not found for this account. Re-rank or open from Uploaded Resumes.')
          return
        }
        setError(err.response?.data?.detail || 'Failed to load resume details')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-slate-500">Loading resume...</div>
  }

  if (error) {
    return <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 headline">Resume Details</h1>
          <p className="text-slate-600 mt-1">{resume?.original_filename}</p>
        </div>
        <Link to="/dashboard" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
          Back to Dashboard
        </Link>
      </div>

      {candidateMeta && (
        <div className="p-5 rounded-2xl bg-white/85 border border-slate-200 shadow-lg space-y-2">
          <p className="text-sm text-slate-500 uppercase tracking-wider">Ranking Snapshot</p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700">Rank #{candidateMeta.rank}</span>
            <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold">
              Match {candidateMeta.match_score}%
            </span>
            {jobTitle && <span className="text-slate-600">Role: {jobTitle}</span>}
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Skills</h2>
        {resume?.skills?.length ? (
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No skills detected.</p>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Extracted Text</h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-6 max-h-[60vh] overflow-auto bg-slate-50 border border-slate-200 rounded-xl p-4">
          {resume?.extracted_text || 'No extracted text available.'}
        </pre>
      </div>
    </div>
  )
}

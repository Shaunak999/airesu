import { useEffect, useState } from 'react'
import { jobProfile, match } from '../api'

export default function Match() {
  const [title, setTitle] = useState('Active Job Description')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    jobProfile
      .get()
      .then(({ data }) => {
        const active = data?.job_profile
        if (active) {
          setTitle(active.title || 'Active Job Description')
          setJobDescription(active.description || '')
        }
      })
      .catch(() => {
        // no-op; page still usable without preload
      })
  }, [])

  const saveJobDescription = async () => {
    if (!jobDescription.trim()) {
      setError('Add a job description before saving.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await jobProfile.save(title.trim() || 'Active Job Description', jobDescription.trim())
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save job description')
    } finally {
      setSaving(false)
    }
  }

  const runScreening = async (e) => {
    e.preventDefault()
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    try {
      await jobProfile.save(title.trim() || 'Active Job Description', jobDescription.trim())
      const { data } = await match.analyze()
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Screening failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 headline">Recruiter Screening</h1>
        <p className="text-slate-600 mb-1">
          Save one active job description, then rank all uploaded resumes by compatibility.
        </p>
      </div>

      <form onSubmit={runScreening} className="space-y-4 surface-card p-5 sm:p-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-up">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Role title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="soft-input"
            placeholder="Senior Frontend Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Active job description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-white/85 border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 resize-y transition-all duration-300"
            placeholder="Paste the full job description used for candidate screening..."
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={saveJobDescription} disabled={saving} className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">
            {saving ? 'Saving...' : 'Save Active JD'}
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2.5 primary-btn">
            {loading ? 'Ranking resumes...' : 'Rank All Resumes'}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-5 animate-fade-up">
          <div className="p-5 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Screening Summary</h3>
            <p className="text-slate-800">
              {result?.job_profile?.title || 'Active Job Description'} - {result.total_resumes || 0} resumes ranked
            </p>
            <p className="text-slate-600 text-sm mt-2">{result.message}</p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Ranked Candidates</h3>
            {result.ranked_candidates?.length > 0 ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-2 pr-3">Rank</th>
                        <th className="py-2 pr-3">Resume</th>
                        <th className="py-2 pr-3">Score</th>
                        <th className="py-2 pr-3">Matched Skills</th>
                        <th className="py-2">Missing Skills</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.ranked_candidates.map((candidate) => (
                        <tr key={candidate.resume_id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 pr-3 font-semibold text-slate-800">#{candidate.rank}</td>
                          <td className="py-3 pr-3 text-slate-700">{candidate.resume_name}</td>
                          <td className="py-3 pr-3">
                            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                              {candidate.match_score}%
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-slate-700">{candidate.skills_found?.length || 0}</td>
                          <td className="py-3 text-slate-700">{candidate.missing_skills?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {result.ranked_candidates.map((candidate) => (
                    <div key={candidate.resume_id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800 text-sm">#{candidate.rank} {candidate.resume_name}</p>
                        <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold shrink-0">
                          {candidate.match_score}%
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-600 flex gap-4">
                        <span>Matched: {candidate.skills_found?.length || 0}</span>
                        <span>Missing: {candidate.missing_skills?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-600">No resumes available to rank.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

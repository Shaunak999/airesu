import { useState } from 'react'
import { match } from '../api'

export default function Match() {
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const { data } = await match.analyze(jobDescription.trim())
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Job Description Match</h1>
      <p className="text-slate-400 mb-6">
        Paste a job description below. We'll compare it with your uploaded resume and show match score, skills found, and missing skills.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Job description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-y"
            placeholder="Paste the full job description here..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get Match Score'}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
              Match Score
            </h3>
            <p className="text-4xl font-bold text-emerald-400">{result.match_score}%</p>
          </div>

          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
              Skills found in your resume
            </h3>
            {result.skills_found?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.skills_found.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">None detected from job requirements.</p>
            )}
          </div>

          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
              Missing skills
            </h3>
            {result.missing_skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">You have all required skills we detected.</p>
            )}
          </div>

          {result.suggestions?.length > 0 && (
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                Suggestions
              </h3>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

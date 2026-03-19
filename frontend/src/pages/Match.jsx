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
    <div className="max-w-3xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2 headline">Job Description Match</h1>
        <p className="text-slate-600 mb-1">
          Paste a job description below. We'll compare it with your uploaded resume and show match score, skills found, and missing skills.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 surface-card p-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-up">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Job description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-white/85 border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 resize-y transition-all duration-300"
            placeholder="Paste the full job description here..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 primary-btn"
        >
          {loading ? 'Analyzing...' : 'Get Match Score'}
        </button>
      </form>

      {result && (
        <div className="mt-2 space-y-6 animate-fade-up">
          <div className="p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
              Match Score
            </h3>
            <p className="text-5xl font-bold text-blue-700">{result.match_score}%</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
              Skills found in your resume
            </h3>
            {result.skills_found?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.skills_found.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">None detected from job requirements.</p>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
              Missing skills
            </h3>
            {result.missing_skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-sm"
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
            <div className="p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                Suggestions
              </h3>
              <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
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

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
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Job Description Match</h1>
        <p className="text-slate-300 mb-1">
          Paste a job description below. We'll compare it with your uploaded resume and show match score, skills found, and missing skills.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-700/80 bg-slate-900/75 backdrop-blur p-6 shadow-xl shadow-slate-950/50">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-up">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Job description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 resize-y transition-all duration-300"
            placeholder="Paste the full job description here..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-300 text-slate-900 font-semibold hover:from-emerald-300 hover:to-cyan-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? 'Analyzing...' : 'Get Match Score'}
        </button>
      </form>

      {result && (
        <div className="mt-2 space-y-6 animate-fade-up">
          <div className="p-6 rounded-2xl bg-slate-900/75 border border-slate-700/80 shadow-lg shadow-slate-950/50">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
              Match Score
            </h3>
            <p className="text-5xl font-bold text-emerald-300">{result.match_score}%</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/75 border border-slate-700/80 shadow-lg shadow-slate-950/50">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
              Skills found in your resume
            </h3>
            {result.skills_found?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.skills_found.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">None detected from job requirements.</p>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/75 border border-slate-700/80 shadow-lg shadow-slate-950/50">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
              Missing skills
            </h3>
            {result.missing_skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm"
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
            <div className="p-6 rounded-2xl bg-slate-900/75 border border-slate-700/80 shadow-lg shadow-slate-950/50">
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

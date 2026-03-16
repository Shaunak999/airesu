import { useState } from 'react'
import { resumes } from '../api'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a PDF file')
      return
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const { data } = await resumes.upload(file)
      setResult(data)
      setFile(null)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Upload Resume</h1>
        <p className="text-slate-300 mb-1">
          Upload a PDF resume. We'll extract text and detect skills automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/75 backdrop-blur p-6 shadow-xl shadow-slate-950/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-up">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">PDF file</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full rounded-xl border border-dashed border-slate-600/80 bg-slate-800/50 p-3 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-emerald-400 file:to-cyan-300 file:text-slate-900 file:font-semibold hover:file:from-emerald-300 hover:file:to-cyan-200 transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-300 text-slate-900 font-semibold hover:from-emerald-300 hover:to-cyan-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? 'Processing...' : 'Upload & Extract'}
          </button>
        </form>
      </div>

      {result && (
        <div className="mt-2 p-6 rounded-2xl bg-slate-900/75 border border-slate-700/80 shadow-lg shadow-slate-950/50 space-y-4 animate-fade-up">
          <h3 className="text-lg font-semibold text-emerald-300">Resume processed</h3>
          <p className="text-slate-300 text-sm">
            <strong>File:</strong> {result.original_filename}
          </p>
          {result.skills?.length > 0 && (
            <div>
              <p className="text-slate-300 text-sm mb-2"><strong>Skills found:</strong></p>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

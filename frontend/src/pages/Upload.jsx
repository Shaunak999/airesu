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
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Upload Resume</h1>
      <p className="text-slate-400 mb-6">
        Upload a PDF resume. We'll extract text and detect skills automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">PDF file</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:font-medium hover:file:bg-slate-600"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="px-4 py-2.5 rounded-lg bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Upload & Extract'}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-6 rounded-xl bg-slate-800/50 border border-slate-700 space-y-4">
          <h3 className="text-lg font-semibold text-emerald-400">Resume processed</h3>
          <p className="text-slate-400 text-sm">
            <strong>File:</strong> {result.original_filename}
          </p>
          {result.skills?.length > 0 && (
            <div>
              <p className="text-slate-400 text-sm mb-2"><strong>Skills found:</strong></p>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-sm"
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

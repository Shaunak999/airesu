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
        <h1 className="text-4xl font-bold text-slate-900 mb-2 headline">Upload Resume</h1>
        <p className="text-slate-600 mb-1">
          Upload a PDF resume. We'll extract text and detect skills automatically.
        </p>
      </div>

      <div className="surface-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-up">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">PDF file</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-indigo-500 file:text-white file:font-semibold hover:file:from-blue-500 hover:file:to-indigo-400 transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className="px-5 py-2.5 primary-btn"
          >
            {loading ? 'Processing...' : 'Upload & Extract'}
          </button>
        </form>
      </div>

      {result && (
        <div className="mt-2 p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg space-y-4 animate-fade-up">
          <h3 className="text-lg font-semibold text-slate-900">Resume processed</h3>
          <p className="text-slate-700 text-sm">
            <strong>File:</strong> {result.original_filename}
          </p>
          {result.skills?.length > 0 && (
            <div>
              <p className="text-slate-700 text-sm mb-2"><strong>Skills found:</strong></p>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm"
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

import { useState } from 'react'
import { resumes } from '../api'

export default function Upload() {
  const [files, setFiles] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!files.length) {
      setError('Please select at least one PDF file')
      return
    }

    const invalid = files.find((file) => !file.name.toLowerCase().endsWith('.pdf'))
    if (invalid) {
      setError(`Invalid file: ${invalid.name}. Only PDF files are supported.`)
      return
    }

    setError('')
    setResult(null)
    setLoading(true)
    try {
      const { data } = await resumes.uploadMany(files)
      setResult(data)
      setFiles([])
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 headline">Upload Resumes</h1>
        <p className="text-slate-600 mb-1">
          Upload one or multiple candidate PDF resumes in one batch.
        </p>
      </div>

      <div className="surface-card p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-up">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Candidate resumes (PDF)</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-indigo-500 file:text-white file:font-semibold hover:file:from-blue-500 hover:file:to-indigo-400 transition-all duration-300"
            />
            <p className="mt-2 text-xs text-slate-500">
              {files.length ? `${files.length} file(s) selected` : 'No files selected'}
            </p>
          </div>

          <button type="submit" disabled={loading || !files.length} className="px-5 py-2.5 primary-btn">
            {loading ? 'Processing batch...' : 'Upload Batch'}
          </button>
        </form>
      </div>

      {result && (
        <div className="mt-2 p-5 sm:p-6 rounded-2xl bg-white/85 border border-slate-200 shadow-lg space-y-4 animate-fade-up">
          <h3 className="text-lg font-semibold text-slate-900">Batch upload completed</h3>
          <p className="text-slate-700 text-sm">
            Uploaded: <strong>{result.uploaded_count || 0}</strong> - Failed: <strong>{result.failed_count || 0}</strong>
          </p>

          {result.uploaded?.length > 0 && (
            <div>
              <p className="text-slate-700 text-sm mb-2"><strong>Uploaded resumes:</strong></p>
              <ul className="space-y-2">
                {result.uploaded.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {item.original_filename} - {item.skills?.length || 0} skills detected
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.failed?.length > 0 && (
            <div>
              <p className="text-slate-700 text-sm mb-2"><strong>Failed files:</strong></p>
              <ul className="space-y-2">
                {result.failed.map((item, idx) => (
                  <li key={`${item.filename}-${idx}`} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {item.filename}: {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

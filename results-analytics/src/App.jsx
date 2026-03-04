import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { fetchAcademicResult } from './services/api'
import StudentInfo from './components/StudentInfo'
import SemesterTable from './components/SemesterTable'
import AnalyticsSummary from './components/AnalyticsSummary'
import SGPATrend from './components/charts/SGPATrend'
import GradeDistribution from './components/charts/GradeDistribution'
import SubjectPerformance from './components/charts/SubjectPerformance'
import SemesterComparison from './components/charts/SemesterComparison'
import InternalVsExternal from './components/charts/InternalVsExternal'

export default function App() {
  const [rollNumber, setRollNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  async function handleFetch() {
    const trimmed = rollNumber.trim()
    if (!trimmed) {
      setError('Please enter a roll number.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await fetchAcademicResult(trimmed)
      if (!data || (!data.name && !data.rollNumber)) {
        setError('No results found for this roll number. Please check and try again.')
      } else {
        setResult(data)
      }
    } catch (err) {
      if (err.response) {
        setError(`API error (${err.response.status}): ${err.response.data?.message || 'Failed to fetch results.'}`)
      } else if (err.request) {
        setError('Network error: Unable to reach the server. Please check your connection.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleFetch()
  }

  const semesters = result?.semesters || []

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
      <Analytics />
      {/* Header */}
      <header className="bg-[#1e293b] border-b border-slate-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            JNTUH Results Analytics
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-slate-700 mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Enter Roll Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 237W1A0501"
              className="flex-1 bg-slate-900 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              onClick={handleFetch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              {loading ? 'Fetching…' : 'Get Analytics'}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400">Fetching results…</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="bg-red-900/40 border border-red-500/50 rounded-xl px-6 py-4 text-red-300 mb-6">
            <span className="font-semibold">Error: </span>{error}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            <StudentInfo student={result} />
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Semester Results</h2>
            {Array.isArray(semesters) && semesters.length > 0 ? (
              semesters.map((sem, idx) => (
                <SemesterTable
                  key={idx}
                  semester={sem.semester || `Semester ${idx + 1}`}
                  subjects={sem.subjects || []}
                  sgpa={sem.sgpa}
                />
              ))
            ) : (
              <p className="text-slate-400">No semester data available.</p>
            )}

            {/* Analytics Dashboard */}
            {semesters.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-100 mb-6">📊 Analytics Dashboard</h2>
                <AnalyticsSummary semesters={semesters} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <SGPATrend semesters={semesters} />
                  <GradeDistribution semesters={semesters} />
                  <SubjectPerformance semesters={semesters} />
                  <SemesterComparison semesters={semesters} />
                  <div className="md:col-span-2">
                    <InternalVsExternal semesters={semesters} />
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

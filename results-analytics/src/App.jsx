import { useState } from 'react';
import { fetchAcademicResult } from './services/api';
import SearchBar from './components/SearchBar';
import StudentInfo from './components/StudentInfo';
import SemesterTable from './components/SemesterTable';
import AnalyticsSummary from './components/AnalyticsSummary';
import SGPATrend from './components/charts/SGPATrend';
import GradeDistribution from './components/charts/GradeDistribution';
import SubjectPerformance from './components/charts/SubjectPerformance';
import SemesterComparison from './components/charts/SemesterComparison';
import InternalVsExternal from './components/charts/InternalVsExternal';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [semesters, setSemesters] = useState([]);

  async function handleSearch(rollNumber) {
    setLoading(true);
    setError(null);
    setStudentData(null);
    setSemesters([]);
    try {
      const data = await fetchAcademicResult(rollNumber);
      // Normalize: data may have a student info object and a list of semesters
      const student = data.studentInfo || data.student || data.studentDetails || null;
      const semList = data.semesters || data.results || data.semesterResults || [];
      setStudentData(student);
      setSemesters(semList);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch results.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-6 px-4 mb-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-white mb-1">
            🎓 JNTUH Results Analytics
          </h1>
          <p className="text-center text-gray-400 text-sm mb-6">
            Search by roll number to view academic results &amp; analytics
          </p>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Student Info */}
        {studentData && <StudentInfo student={studentData} />}

        {/* Semester Tables */}
        {semesters.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4">📋 Semester Results</h2>
            {semesters.map((sem, i) => (
              <SemesterTable key={i} semester={sem} />
            ))}
          </section>
        )}

        {/* Analytics Dashboard */}
        {semesters.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6">📊 Analytics Dashboard</h2>

            {/* Summary Cards */}
            <AnalyticsSummary semesters={semesters} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Empty state */}
        {!loading && semesters.length === 0 && !error && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">Enter a roll number above to view results and analytics</p>
          </div>
        )}
      </main>
    </div>
  );
}

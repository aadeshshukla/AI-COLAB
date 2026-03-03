import { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [rollNumber, setRollNumber] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (rollNumber.trim()) onSearch(rollNumber.trim().toUpperCase());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-lg mx-auto">
      <input
        type="text"
        value={rollNumber}
        onChange={(e) => setRollNumber(e.target.value)}
        placeholder="Enter Roll Number (e.g. 20B91A0501)"
        className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Loading...' : 'Search'}
      </button>
    </form>
  );
}

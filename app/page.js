'use client';
import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setAnalysis('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (data.result) {
        setAnalysis(data.result);
      } else {
        setAnalysis('❌ Error analyzing code. Please check your API key.');
      }
    } catch (err) {
      setAnalysis('❌ Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">
          🐞 AI Bug Finder & Code Reviewer
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Paste your code below to detect bugs and optimize performance.
        </p>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your C++, Java, or JavaScript code here..."
          className="w-full h-48 p-4 rounded-lg bg-slate-800 border border-slate-700 text-green-400 font-mono text-sm focus:outline-none focus:border-blue-500 mb-4"
        />

        <button
          onClick={analyzeCode}
          disabled={loading || !code.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-all"
        >
          {loading ? 'Analyzing Code...' : 'Find Bugs 🔍'}
        </button>

        {analysis && (
          <div className="mt-6 p-4 rounded-lg bg-slate-800 border border-slate-700 text-gray-200">
            <h2 className="text-lg font-semibold mb-2 text-blue-300">Analysis Results:</h2>
            <p className="whitespace-pre-wrap">{analysis}</p>
          </div>
        )}
      </div>
    </main>
  );
}
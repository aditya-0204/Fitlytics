import React, { useEffect, useState } from 'react';
import { getAISuggestions } from '../utils/aiInsights';

export function AIInsights({ acwr = 0, performanceDrop = 0, recovery = 100, stress = 0, modelId = null }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchSuggestions() {
      setLoading(true);
      try {
        const suggestionText = await getAISuggestions({
          acwr,
          performanceDrop,
          recoveryScore: recovery,
          stressLevel: stress,
          modelId: modelId || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1-mini',
        });
        if (isMounted) {
          setResult(suggestionText);
        }
      } catch (err) {
        if (isMounted) {
          setResult(`Error: ${err.message || 'Unable to fetch AI suggestions'}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [acwr, performanceDrop, recovery, stress]);

  return (
    <section className="mb-8">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Suggestions</h3>
          <span className="text-xs text-gray-500">Powered by OpenAI/Gemini</span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Generating insights...</p>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{result}</p>
        )}
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, ShieldAlert } from 'lucide-react';
import { calculateAcwr, detectOvertraining, analyzePerformanceDegradation, predictInjuryRisk, calculateReadinessScore } from '../utils/athleteMonitoringUtils';
import { getAISuggestions } from '../utils/aiInsights';
import { getMLPredictions } from '../utils/mlService';

function metricCard({ title, value, unit = '', status = null, color = 'bg-blue-500' }) {
  const valueText = String(value ?? '');
  const compactValueClass = valueText.length > 12 ? 'text-2xl' : 'text-3xl';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{title}</div>
      <div className={`${compactValueClass} font-semibold text-gray-900 dark:text-white leading-tight`}>
        {value}
        {unit && <span className="text-base font-medium ml-1">{unit}</span>}
      </div>
      {status && (
        <p
          className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-snug"
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export function AthleteMonitoringPanel({ wearableData = [], performanceData = [] }) {
  const acwr = useMemo(() => calculateAcwr(wearableData), [wearableData]);
  const overtraining = useMemo(() => detectOvertraining(acwr), [acwr]);
  const degradation = useMemo(() => analyzePerformanceDegradation(performanceData), [performanceData]);
  const injury = useMemo(() => predictInjuryRisk(wearableData), [wearableData]);
  const readiness = useMemo(() => calculateReadinessScore(wearableData, performanceData), [wearableData, performanceData]);

  const [suggestions, setSuggestions] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlError, setMlError] = useState('');

  const parseRiskScore = (value, fallback) => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return Math.max(0, Math.min(100, Math.round(value)));
    }

    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('high')) return 80;
    if (normalized.includes('medium') || normalized.includes('moderate')) return 55;
    if (normalized.includes('low')) return 25;

    return fallback;
  };

  const parseReadinessScore = (value, fallback) => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return Math.max(0, Math.min(100, Math.round(value)));
    }

    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('high') || normalized.includes('ready') || normalized.includes('fit')) return 85;
    if (normalized.includes('medium') || normalized.includes('moderate')) return 60;
    if (normalized.includes('low') || normalized.includes('not')) return 35;

    return fallback;
  };

  useEffect(() => {
    async function loadML() {
      try {
        const latest = wearableData?.[wearableData.length - 1] || {};
        const result = await getMLPredictions({
          latest,
          acwr,
          performanceDrop: degradation.changePct || 0,
          activity: 'Training',
        });
        setMlPrediction(result);
        setMlError('');
      } catch (error) {
        setMlPrediction(null);
        setMlError(error?.message || 'ML model unavailable');
      }
    }

    if (wearableData?.length) {
      loadML();
    }
  }, [wearableData, acwr, degradation.changePct]);

  const displayedInjuryScore = useMemo(
    () => (mlPrediction ? parseRiskScore(mlPrediction.injuryRisk, injury.score) : injury.score),
    [mlPrediction, injury.score]
  );

  const displayedReadiness = useMemo(
    () => (mlPrediction ? parseReadinessScore(mlPrediction.readinessStatus, readiness) : readiness),
    [mlPrediction, readiness]
  );

  const mlOvertrainingText = useMemo(() => {
    if (!mlPrediction) return '';
    const v = mlPrediction.overtrainingRisk;
    return typeof v === 'number' ? `Model overtraining risk: ${Math.round(v)}%` : `Model overtraining risk: ${String(v)}`;
  }, [mlPrediction]);

  useEffect(() => {
    async function load() {
      setLoadingSuggestions(true);

      const latest = wearableData?.[wearableData.length - 1] || {};
      const aiText = await getAISuggestions({
        acwr,
        performanceDrop: degradation.changePct || 0,
        recoveryScore: Number(latest.recovery_score ?? 100),
        stressLevel: Number(latest.stress_level ?? 0),
      });

      setSuggestions(aiText);
      setLoadingSuggestions(false);
    }

    if (wearableData?.length) {
      load();
    }
  }, [wearableData, acwr, degradation.changePct, injury.level, readiness]);

  const chartData = useMemo(() => {
    return wearableData.map((item) => ({
      date: item.date,
      trainingLoad: item.training_load,
      recovery: item.recovery_score,
    }));
  }, [wearableData]);

  const trendStatusText =
    degradation.trend === 'Insufficient data'
      ? 'Add at least 6 performance entries'
      : `${degradation.changePct}% vs last week`;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="dark:text-white">Athlete Monitoring</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {metricCard({ title: 'ACWR', value: acwr ?? 'N/A', unit: '', status: mlOvertrainingText || overtraining.message })}
        {metricCard({ title: 'Performance Trend', value: degradation.trend, unit: '', status: trendStatusText })}
        {metricCard({ title: 'Injury Risk', value: `${displayedInjuryScore}`, unit: '%', status: mlPrediction ? 'Based on trained ML model' : injury.description })}
        {metricCard({ title: 'Readiness Score', value: displayedReadiness, unit: '/100', status: mlPrediction ? 'Based on trained ML model' : 'Higher is better' })}
      </div>

      {mlPrediction ? (
        <p className="text-xs text-green-700 dark:text-green-300 mb-4">ML model is active for injury/readiness predictions.</p>
      ) : mlError ? (
        <p className="text-xs text-amber-700 dark:text-amber-300 mb-4">ML model fallback to rule-based logic: {mlError}</p>
      ) : null}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="mb-4 dark:text-white">Training Load & Recovery Timeline</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="trainingLoad" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="recovery" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="dark:text-white">AI Suggestions</h3>
          {loadingSuggestions ? <span className="text-sm text-gray-500">Loading...</span> : null}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {loadingSuggestions ? 'Generating detailed plan...' : suggestions || 'Awaiting AI suggestions...'}
        </div>
      </div>
    </section>
  );
}

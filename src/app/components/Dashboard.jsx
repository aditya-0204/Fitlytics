import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { calculateTrainingLoad, cleanData } from '../utils/dataProcessing';
import { calculateAcuteLoad, calculateChronicLoad, calculateACWR } from '../utils/featureEngineering';
import { calculateBaseline, calculatePerformanceDrop } from '../utils/performanceAnalysis';
import { getInjuryRisk } from '../utils/injuryRisk';
import { evaluateReadiness } from '../utils/readiness';

const statusColor = {
  'Safe': 'bg-green-100 text-green-700',
  'Good': 'bg-green-100 text-green-700',
  'Undertraining': 'bg-yellow-100 text-yellow-700',
  'Elevated': 'bg-yellow-100 text-yellow-700',
  'Moderate': 'bg-yellow-100 text-yellow-700',
  'High Risk': 'bg-red-100 text-red-700',
  'Poor': 'bg-red-100 text-red-700',
  'Low Risk': 'bg-green-100 text-green-700',
  'Medium Risk': 'bg-yellow-100 text-yellow-700',
};

const metaTooltip = {
  acwr: 'ACWR: ratio of recent 7-day acute load to 28-day chronic load.',
  performance: 'Performance drop relative to baseline (first 7 days).',
  risk: 'Injury risk derived from ACWR, performance drop, and recovery.',
  readiness: 'Readiness from sleep, recovery, and stress metrics.',
};

function SummaryCard({ title, value, status, tooltipText }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
        <span className="text-xs text-gray-400" title={tooltipText}>i</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {status ? (
        <span className={`inline-flex items-center px-2 py-1 mt-2 text-xs font-medium rounded-full ${statusColor[status] ?? 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      ) : null}
    </div>
  );
}

export function Dashboard({ wearableData = [] }) {
  const cleaned = cleanData(wearableData);
  const prepared = calculateTrainingLoad(cleaned);

  const acute = calculateAcuteLoad(prepared, 7);
  const chronic = calculateChronicLoad(prepared, 28);
  const acwr = calculateACWR(acute, chronic);

  const baseline = calculateBaseline(prepared);
  const latestDistance = prepared.length ? prepared[prepared.length - 1].distance : 0;
  const performance = calculatePerformanceDrop(baseline, latestDistance);

  const latestInterim = prepared.length ? prepared[prepared.length - 1] : {};
  const injuryRisk = getInjuryRisk({ acwr: acwr.ratio, performance_drop: performance.dropPercentage, recovery_score: latestInterim.recovery_score });
  const readiness = evaluateReadiness({
    sleep_hours: latestInterim.sleep_hours,
    recovery_score: latestInterim.recovery_score,
    stress_level: latestInterim.stress_level,
    recent_load: latestInterim.training_load,
  });

  const chartData = prepared.map((row) => ({
    date: row.date,
    heart_rate: row.heart_rate,
    distance: row.distance,
    training_load: row.training_load,
  }));

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Athlete Monitoring Summary</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="ACWR" value={acwr.ratio.toFixed(2)} status={acwr.status} tooltipText={metaTooltip.acwr} />
        <SummaryCard title="Performance Drop" value={`${performance.dropPercentage.toFixed(2)}%`} status={performance.status} tooltipText={metaTooltip.performance} />
        <SummaryCard title="Injury Risk" value={injuryRisk} status={injuryRisk} tooltipText={metaTooltip.risk} />
        <SummaryCard title="Readiness" value={readiness} status={readiness} tooltipText={metaTooltip.readiness} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Heart Rate Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="heart_rate" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Distance Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="distance" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Training Load</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="training_load" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

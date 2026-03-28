export function calculateBaseline(data) {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const first7 = sorted.slice(0, 7);
  const totalDistance = first7.reduce((sum, row) => sum + Number(row.distance ?? 0), 0);
  return first7.length ? Number((totalDistance / first7.length).toFixed(2)) : 0;
}

export function calculatePerformanceDrop(baseline, current) {
  const base = Number(baseline ?? 0);
  const cur = Number(current ?? 0);
  if (base <= 0) {
    return { dropPercentage: 0, status: 'No baseline' };
  }
  const dropPercentage = Number((((base - cur) / base) * 100).toFixed(2));
  const status = dropPercentage > 15 ? 'Significant Degradation' : 'Stable';
  return {
    dropPercentage,
    status,
  };
}

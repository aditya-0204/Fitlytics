export function calculateAcuteLoad(data, days = 7) {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const recent = sorted.slice(-days);
  const total = recent.reduce((sum, row) => sum + Number(row.training_load ?? 0), 0);
  return recent.length ? total / recent.length : 0;
}

export function calculateChronicLoad(data, days = 28) {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const recent = sorted.slice(-days);
  const total = recent.reduce((sum, row) => sum + Number(row.training_load ?? 0), 0);
  return recent.length ? total / recent.length : 0;
}

export function calculateACWR(acute, chronic) {
  const acuteValue = Number(acute ?? 0);
  const chronicValue = Number(chronic ?? 0);
  const ratio = chronicValue > 0 ? Number((acuteValue / chronicValue).toFixed(2)) : 0;

  let status = 'Unknown';
  if (ratio < 0.8) status = 'Undertraining';
  else if (ratio >= 0.8 && ratio <= 1.3) status = 'Safe';
  else if (ratio > 1.5) status = 'Overtraining Risk';
  else status = 'Elevated';

  return {
    acute: acuteValue,
    chronic: chronicValue,
    ratio,
    status,
  };
}

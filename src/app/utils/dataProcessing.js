export function cleanData(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((row) => {
      const { date, heart_rate, distance, sleep_hours, recovery_score, stress_level } = row;
      return (
        date &&
        typeof heart_rate === 'number' &&
        typeof distance === 'number' &&
        typeof sleep_hours === 'number' &&
        typeof recovery_score === 'number' &&
        typeof stress_level === 'number'
      );
    })
    .map((row) => ({ ...row }));
}

export function normalizeData(data) {
  if (!Array.isArray(data) || data.length === 0) return [];

  const metrics = ['heart_rate', 'distance', 'training_load', 'sleep_hours', 'recovery_score', 'stress_level'];
  const ranges = metrics.reduce((acc, key) => {
    const values = data.map((row) => Number(row[key] ?? 0));
    acc[key] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
    return acc;
  }, {});

  return data.map((row) => {
    const normalized = { ...row };
    metrics.forEach((key) => {
      const value = Number(row[key] ?? 0);
      const { min, max } = ranges[key];
      normalized[key] = max === min ? 0.5 : (value - min) / (max - min);
    });
    return normalized;
  });
}

export function calculateTrainingLoad(data) {
  if (!Array.isArray(data)) return [];

  return data.map((row) => {
    const heart_rate = Number(row.heart_rate ?? 0);
    const distance = Number(row.distance ?? 0);
    const training_load = Number((heart_rate * distance).toFixed(2));
    return {
      ...row,
      training_load,
    };
  });
}

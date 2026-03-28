export function evaluateReadiness({ sleep_hours = 0, recovery_score = 0, stress_level = 100, recent_load = 0 } = {}) {
  const goodSleep = sleep_hours > 7;
  const highRecovery = recovery_score > 70;
  const lowStress = stress_level < 40;

  if (goodSleep && highRecovery && lowStress) return 'Good';
  if ((goodSleep && highRecovery) || (highRecovery && lowStress) || (goodSleep && lowStress)) return 'Moderate';

  return 'Poor';
}

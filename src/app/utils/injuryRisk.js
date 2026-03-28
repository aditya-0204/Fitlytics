export function getInjuryRisk({ acwr = 0, performance_drop = 0, recovery_score = 100 }) {
  const ratio = Number(acwr ?? 0);
  const drop = Number(performance_drop ?? 0);
  const recovery = Number(recovery_score ?? 100);

  if (ratio > 1.5 && drop > 15 && recovery < 50) {
    return 'High Risk';
  }

  const moderateConditions = [ratio > 1.3, drop > 10, recovery < 60].filter(Boolean).length;
  if (moderateConditions >= 2) {
    return 'Medium Risk';
  }

  return 'Low Risk';
}

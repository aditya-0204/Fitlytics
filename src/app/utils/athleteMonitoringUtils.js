export function average(values) {
  if (!values?.length) return 0;
  return values.reduce((sum, v) => sum + (v || 0), 0) / values.length;
}

export function calculateAcwr(wearableData, acuteWindow = 7, chronicWindow = 28) {
  if (!wearableData?.length) return null;

  const sliceSorted = [...wearableData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const end = sliceSorted.length;

  const acuteSlice = sliceSorted.slice(Math.max(0, end - acuteWindow), end);
  const chronicSlice = sliceSorted.slice(Math.max(0, end - chronicWindow), end);

  const acuteAvg = average(acuteSlice.map((d) => Number(d.training_load) || 0));
  const chronicAvg = average(chronicSlice.map((d) => Number(d.training_load) || 0));

  if (!chronicAvg || chronicAvg === 0) return null;

  const acwr = acuteAvg / chronicAvg;
  return Number(acwr.toFixed(2));
}

export function detectOvertraining(acwr) {
  if (acwr === null || acwr === undefined) {
    return { status: 'Unknown', message: 'Insufficient data to calculate ACWR' };
  }

  if (acwr >= 1.6) {
    return { status: 'High', message: 'ACWR > 1.6: High risk of overtraining' };
  }
  if (acwr >= 1.3) {
    return { status: 'Medium', message: 'ACWR 1.3-1.6: Moderate risk, consider recovery' };
  }

  return { status: 'Low', message: 'ACWR within safe range' };
}

export function analyzePerformanceDegradation(performanceData) {
  if (!performanceData?.length || performanceData.length < 6) {
    return { trend: 'Insufficient data', changePct: 0 };
  }

  const sorted = [...performanceData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const windowSize = Math.min(7, Math.floor(sorted.length / 2));
  const last7 = sorted.slice(-windowSize);
  const prev7 = sorted.slice(-2 * windowSize, -windowSize);

  const last7Avg = average(last7.map((p) => Number(p.score) || 0));
  const prev7Avg = average(prev7.map((p) => Number(p.score) || 0));

  if (!prev7Avg) return { trend: 'Stable', changePct: 0 };

  const changePct = Number((((last7Avg - prev7Avg) / prev7Avg) * 100).toFixed(1));
  let trend = 'Stable';

  if (changePct <= -4) trend = 'Degrading';
  else if (changePct >= 4) trend = 'Improving';

  return { trend, changePct, last7Avg: Number(last7Avg.toFixed(1)), prev7Avg: Number(prev7Avg.toFixed(1)) };
}

export function predictInjuryRisk(wearableData) {
  if (!wearableData?.length) {
    return { score: 0, level: 'Unknown', description: 'No dataset available' };
  }

  const latest = wearableData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const stress = Number(latest.stress_level || 0);
  const recovery = Number(latest.recovery_score || 0);
  const sleep = Number(latest.sleep_hours || 0);

  let riskScore = 15;
  riskScore += Math.min(40, Math.max(0, stress - 30));
  riskScore += Math.min(30, Math.max(0, 70 - recovery));
  riskScore += Math.min(15, Math.max(0, 7 - sleep) * 2);

  const acwr = calculateAcwr(wearableData);
  if (acwr !== null) {
    if (acwr >= 1.6) riskScore += 10;
    else if (acwr >= 1.3) riskScore += 5;
  }

  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  let level = 'Low';
  let description = 'Low risk. Continue current plan and monitor daily.';

  if (riskScore >= 70) {
    level = 'High';
    description = 'High risk. Reduce intensity and monitor closely.';
  } else if (riskScore >= 45) {
    level = 'Medium';
    description = 'Moderate risk. Increase recovery and manage load.';
  }

  return { score: riskScore, level, description };
}

export function calculateReadinessScore(wearableData, performanceData = []) {
  if (!wearableData?.length) return 0;

  const latest = wearableData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const recovery = Number(latest.recovery_score || 0);
  const sleep = Number(latest.sleep_hours || 0);
  const stress = Number(latest.stress_level || 0);

  const baseline = (recovery * 0.45 + Math.min(10, sleep) * 10 * 0.30 + (100 - stress) * 0.25) / 1; // roughly 0-100

  const perf = performanceData?.length ? average(performanceData.map((p) => Number(p.score) || 0)) : baseline;
  const score = Math.round(Math.min(100, Math.max(0, 0.8 * baseline + 0.2 * perf)));

  return score;
}

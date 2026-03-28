function cleanupText(text) {
  if (!text?.trim) {
    return '';
  }

  let cleaned = text.trim();

  // Remove common meta-intro phrasing and stray markdown heading markers.
  cleaned = cleaned.replace(/^as an expert sports performance ai[,:\s-]*/i, '');
  cleaned = cleaned.replace(/^i have (thoroughly )?analy[sz]ed the provided athlete data[.:\s-]*/i, '');
  cleaned = cleaned.replace(/^#+\s*$/gm, '');

  return cleaned.trim();
}

function extractJsonObject(raw) {
  if (!raw || typeof raw !== 'string') {
    return null;
  }

  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch ? fencedMatch[1] : raw;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function getAISuggestions({ acwr, performanceDrop, recoveryScore, stressLevel, modelId }) {
  try {
    const prompt = `Analyze this athlete profile and generate a practical coaching report.\n\nAthlete data:\nACWR: ${acwr}\nPerformance Drop: ${performanceDrop}%\nRecovery Score: ${recoveryScore}\nStress Level: ${stressLevel}\n\nOutput rules:\n- Start directly with "Injury Risk Level:" (no greeting, no introduction, no meta statements).\n- Do NOT write phrases like "As an expert sports performance AI" or "I have analyzed".\n- Write detailed content (minimum 700 words total).\n- For each section, include 1 detailed paragraph (4-6 sentences) plus 4-6 bullet points.\n- Keep language specific, direct, and actionable.\n\nUse these sections in this exact order:\n1. Injury Risk Level\n2. Training Recommendation\n3. Recovery Advice\n4. Immediate Action Plan (today + next 7 days)\n5. Short-Term Plan (next 2 weeks)\n6. Long-Term Strategy (4-8 weeks)`;

    const response = await fetch('/api/ai-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: modelId || import.meta.env.VITE_OPENAI_MODEL || 'gemini-2.5-flash',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Proxy API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return cleanupText(data.text || '');
  } catch (error) {
    console.error('getAISuggestions failed', error);
    return `Error fetching AI suggestions: ${error?.message || 'Unknown error'}`;
  }
}

export async function getAIRiskAndSafetyInsights({
  hydration,
  stress,
  trainingLoad,
  calories,
  heartRate,
  sleep,
  recovery,
  vo2Max,
  riskFactors = [],
  modelId,
}) {
  const fallback = {
    metricsSnapshot: [],
    riskAnalysis: [],
    safetyTips: [],
  };

  try {
    const riskInput = riskFactors.length > 0
      ? riskFactors.map((risk) => `${risk.factor || risk.name || 'Unknown Risk'} (${risk.level || 'Unknown'})`).join(', ')
      : 'None provided';

    const prompt = `Create structured coaching output from athlete data.\n\nAthlete data:\n- Hydration Level: ${hydration}%\n- Stress Level: ${stress}/100\n- Training Load: ${trainingLoad} AU\n- Daily Calories: ${calories} kcal\n- Resting Heart Rate: ${heartRate} bpm\n- Sleep Duration: ${sleep} hours\n- Recovery Score: ${recovery}/100\n- VO2 Max: ${vo2Max} ml/kg/min\n- Existing Risk Factors: ${riskInput}\n\nRules:\n- Return JSON only (no markdown, no preface).\n- Do not include phrases like "As an expert AI".\n- Use the exact metric values above in metricsSnapshot lines.\n- Keep risk levels strictly LOW, MEDIUM, or HIGH.\n\nJSON schema:\n{\n  "metricsSnapshot": [\n    "Hydration Level: ...",\n    "Stress Level: ...",\n    "Training Load: ...",\n    "Daily Calories: ..."\n  ],\n  "riskAnalysis": [\n    {"factor": "High Heart Rate", "level": "HIGH"},\n    {"factor": "Low Hydration", "level": "MEDIUM"}\n  ],\n  "safetyTips": [\n    "High Heart Rate: Monitor closely and avoid high-impact activities.",\n    "Low Hydration: Increase fluid intake and monitor urine color."\n  ]\n}`;

    const response = await fetch('/api/ai-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: modelId || import.meta.env.VITE_OPENAI_MODEL || 'gemini-2.5-flash',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Proxy API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const parsed = extractJsonObject(data.text || '');

    if (!parsed || typeof parsed !== 'object') {
      return fallback;
    }

    const metricsSnapshot = Array.isArray(parsed.metricsSnapshot)
      ? parsed.metricsSnapshot.map((item) => String(item).trim()).filter(Boolean)
      : [];

    const riskAnalysis = Array.isArray(parsed.riskAnalysis)
      ? parsed.riskAnalysis
          .map((item) => ({
            factor: String(item?.factor || '').trim(),
            level: String(item?.level || '').trim().toUpperCase(),
          }))
          .filter((item) => item.factor && ['LOW', 'MEDIUM', 'HIGH'].includes(item.level))
      : [];

    const safetyTips = Array.isArray(parsed.safetyTips)
      ? parsed.safetyTips.map((item) => String(item).trim()).filter(Boolean)
      : [];

    return { metricsSnapshot, riskAnalysis, safetyTips };
  } catch (error) {
    console.error('getAIRiskAndSafetyInsights failed', error);
    return fallback;
  }
}

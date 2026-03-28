function cleanupText(text) {
  return text?.trim ? text.trim() : '';
}

export async function getAISuggestions({ acwr, performanceDrop, recoveryScore, stressLevel, modelId }) {
  try {
    const prompt = `You are an expert sports performance AI.\n\nAnalyze the athlete data:\nACWR: ${acwr}\nPerformance Drop: ${performanceDrop}%\nRecovery Score: ${recoveryScore}\nStress Level: ${stressLevel}\n\nProvide an in-depth, narrative analysis. For each required heading, write a full paragraph (at least 3-4 sentences) followed by 3-4 supporting bullet points. Include these sections in this order:\n\n1. Injury risk level (explain rationale and key risk drivers)\n2. Training recommendation (detailed plan with sessions, load, progressions, and warnings)\n3. Recovery advice (sleep, nutrition, hydration, mobility, active recovery, and recovery weeks)\n4. Immediate action plan (today and next 7 days with concrete steps)\n5. Short-term plan (2-week roadmap, goals, and checkpoints)\n6. Long-term strategy (4-8 week progress path, adaptation cycles, prevention).\n\nUse 2-3 paragraphs where needed and avoid one-line answers; provide detailed, actionable content in every section.`;

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

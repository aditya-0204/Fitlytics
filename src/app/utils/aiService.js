const openAIKey = import.meta.env.VITE_OPENAI_API_KEY || '';

export async function fetchAISuggestions(prompt) {
  if (!openAIKey) {
    return [
      'Focus on gradual training load increase; avoid sudden spikes in daily load.',
      'Prioritize 8+ hours of sleep and consistent recovery routines for the next 3 days.',
      'Add a low-impact active recovery session and mobility work after high-intensity workouts.',
    ];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a sports performance assistant for athlete monitoring.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });
    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No AI text generated');
    }

    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 5);
  } catch (error) {
    console.error('AI fetch error', error);
    return [
      'Could not reach AI service. Use internal recommendations for now.',
      'Ensure API key is set in environment variables and retry.',
    ];
  }
}

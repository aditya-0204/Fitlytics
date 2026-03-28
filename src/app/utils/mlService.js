export async function getMLPredictions({ latest, acwr, performanceDrop, activity = 'Training' }) {
  const response = await fetch('/api/ml-predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latest,
      acwr,
      performanceDrop,
      activity,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ML API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

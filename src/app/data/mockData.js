// Player-specific health metrics
export const playerHealthMetrics = {
  '1': { // sangeeta phogat
    heartRate: { value: 65, trend: { value: 2, isPositive: false } },
    sleep: { value: 8.2, trend: { value: 10, isPositive: true } },
    recovery: { value: 92, trend: { value: 6, isPositive: true } },
    calories: { value: 2600, trend: { value: 15, isPositive: true } },
    vo2Max: { value: 58, trend: { value: 3, isPositive: true } },
    hydration: { value: 92, trend: { value: 5, isPositive: true } },
    stress: { value: 22, trend: { value: 8, isPositive: false } },
    trainingLoad: { value: 520, trend: { value: 12, isPositive: true } },
  },
  '2': { // abhishek singh
    heartRate: { value: 70, trend: { value: 1, isPositive: false } },
    sleep: { value: 7.2, trend: { value: 5, isPositive: true } },
    recovery: { value: 85, trend: { value: 3, isPositive: true } },
    calories: { value: 2500, trend: { value: 10, isPositive: true } },
    vo2Max: { value: 54, trend: { value: 2, isPositive: true } },
    hydration: { value: 85, trend: { value: 3, isPositive: true } },
    stress: { value: 28, trend: { value: 5, isPositive: false } },
    trainingLoad: { value: 480, trend: { value: 10, isPositive: true } },
  },
  '3': { // ellyse perry
    heartRate: { value: 75, trend: { value: 4, isPositive: true } },
    sleep: { value: 6.5, trend: { value: 3, isPositive: false } },
    recovery: { value: 78, trend: { value: 2, isPositive: true } },
    calories: { value: 2300, trend: { value: 8, isPositive: true } },
    vo2Max: { value: 48, trend: { value: 1, isPositive: true } },
    hydration: { value: 72, trend: { value: 2, isPositive: false } },
    stress: { value: 45, trend: { value: 10, isPositive: true } },
    trainingLoad: { value: 420, trend: { value: 5, isPositive: true } },
  },
  '4': { // PR Sreejesh
    heartRate: { value: 68, trend: { value: 3, isPositive: false } },
    sleep: { value: 7.8, trend: { value: 8, isPositive: true } },
    recovery: { value: 90, trend: { value: 5, isPositive: true } },
    calories: { value: 2550, trend: { value: 12, isPositive: true } },
    vo2Max: { value: 55, trend: { value: 2, isPositive: true } },
    hydration: { value: 90, trend: { value: 6, isPositive: true } },
    stress: { value: 25, trend: { value: 6, isPositive: false } },
    trainingLoad: { value: 500, trend: { value: 11, isPositive: true } },
  },
};

// Player-specific activities
export const playerActivities = {
  '1': [ // sangeeta phogat
    {
      id: '1',
      type: 'Running',
      duration: 50,
      intensity: 'high',
      caloriesBurned: 480,
      date: 'Jan 16, 2026',
      notes: 'Morning interval training'
    },
    {
      id: '2',
      type: 'Strength Training',
      duration: 65,
      intensity: 'high',
      caloriesBurned: 520,
      date: 'Jan 15, 2026',
    },
    {
      id: '3',
      type: 'Yoga & Stretching',
      duration: 35,
      intensity: 'low',
      caloriesBurned: 140,
      date: 'Jan 14, 2026',
      notes: 'Recovery and flexibility focus'
    },
    {
      id: '4',
      type: 'Swimming',
      duration: 45,
      intensity: 'medium',
      caloriesBurned: 400,
      date: 'Jan 13, 2026',
    },
  ],
  '2': [ // abhishek singh
    {
      id: '1',
      type: 'Cycling',
      duration: 60,
      intensity: 'medium',
      caloriesBurned: 450,
      date: 'Jan 16, 2026',
    },
    {
      id: '2',
      type: 'HIIT Training',
      duration: 40,
      intensity: 'high',
      caloriesBurned: 520,
      date: 'Jan 15, 2026',
      notes: 'Tough session but felt great'
    },
    {
      id: '3',
      type: 'Running',
      duration: 45,
      intensity: 'medium',
      caloriesBurned: 380,
      date: 'Jan 14, 2026',
    },
    {
      id: '4',
      type: 'Strength Training',
      duration: 55,
      intensity: 'high',
      caloriesBurned: 440,
      date: 'Jan 13, 2026',
    },
  ],
  '3': [ // ellyse perry
    {
      id: '1',
      type: 'Yoga & Stretching',
      duration: 30,
      intensity: 'low',
      caloriesBurned: 120,
      date: 'Jan 16, 2026',
      notes: 'Needed rest day'
    },
    {
      id: '2',
      type: 'Running',
      duration: 35,
      intensity: 'medium',
      caloriesBurned: 300,
      date: 'Jan 15, 2026',
    },
    {
      id: '3',
      type: 'Strength Training',
      duration: 50,
      intensity: 'medium',
      caloriesBurned: 380,
      date: 'Jan 13, 2026',
    },
    {
      id: '4',
      type: 'Walking',
      duration: 40,
      intensity: 'low',
      caloriesBurned: 180,
      date: 'Jan 12, 2026',
    },
  ],
  '4': [ // PR Sreejesh
    {
      id: '1',
      type: 'Goalkeeper Training',
      duration: 70,
      intensity: 'high',
      caloriesBurned: 550,
      date: 'Jan 16, 2026',
      notes: 'Reaction drills and positioning'
    },
    {
      id: '2',
      type: 'Strength Training',
      duration: 60,
      intensity: 'high',
      caloriesBurned: 480,
      date: 'Jan 15, 2026',
    },
    {
      id: '3',
      type: 'Running',
      duration: 40,
      intensity: 'medium',
      caloriesBurned: 360,
      date: 'Jan 14, 2026',
    },
    {
      id: '4',
      type: 'Agility Training',
      duration: 50,
      intensity: 'high',
      caloriesBurned: 420,
      date: 'Jan 13, 2026',
    },
  ],
};

// Player-specific performance data
export const playerPerformanceData = {
  '1': [ // sangeeta phogat
    { date: 'Jan 10', score: 85, heartRate: 67 },
    { date: 'Jan 11', score: 87, heartRate: 66 },
    { date: 'Jan 12', score: 89, heartRate: 65 },
    { date: 'Jan 13', score: 91, heartRate: 64 },
    { date: 'Jan 14', score: 90, heartRate: 65 },
    { date: 'Jan 15', score: 92, heartRate: 64 },
    { date: 'Jan 16', score: 94, heartRate: 65 },
  ],
  '2': [ // abhishek singh
    { date: 'Jan 10', score: 78, heartRate: 72 },
    { date: 'Jan 11', score: 80, heartRate: 71 },
    { date: 'Jan 12', score: 81, heartRate: 70 },
    { date: 'Jan 13', score: 83, heartRate: 70 },
    { date: 'Jan 14', score: 82, heartRate: 71 },
    { date: 'Jan 15', score: 85, heartRate: 70 },
    { date: 'Jan 16', score: 84, heartRate: 70 },
  ],
  '3': [ // ellyse perry
    { date: 'Jan 10', score: 72, heartRate: 77 },
    { date: 'Jan 11', score: 74, heartRate: 76 },
    { date: 'Jan 12', score: 73, heartRate: 76 },
    { date: 'Jan 13', score: 75, heartRate: 75 },
    { date: 'Jan 14', score: 76, heartRate: 75 },
    { date: 'Jan 15', score: 77, heartRate: 75 },
    { date: 'Jan 16', score: 78, heartRate: 75 },
  ],
  '4': [ // PR Sreejesh
    { date: 'Jan 10', score: 82, heartRate: 70 },
    { date: 'Jan 11', score: 84, heartRate: 69 },
    { date: 'Jan 12', score: 86, heartRate: 68 },
    { date: 'Jan 13', score: 85, heartRate: 68 },
    { date: 'Jan 14', score: 87, heartRate: 67 },
    { date: 'Jan 15', score: 89, heartRate: 68 },
    { date: 'Jan 16', score: 90, heartRate: 68 },
  ],
};

// Player-specific weekly activity
export const playerWeeklyActivity = {
  '1': [ // sangeeta phogat
    { day: 'Mon', minutes: 100 },
    { day: 'Tue', minutes: 85 },
    { day: 'Wed', minutes: 50 },
    { day: 'Thu', minutes: 120 },
    { day: 'Fri', minutes: 90 },
    { day: 'Sat', minutes: 35 },
    { day: 'Sun', minutes: 110 },
  ],
  '2': [ // abhishek singh
    { day: 'Mon', minutes: 90 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 45 },
    { day: 'Thu', minutes: 95 },
    { day: 'Fri', minutes: 75 },
    { day: 'Sat', minutes: 40 },
    { day: 'Sun', minutes: 100 },
  ],
  '3': [ // ellyse perry
    { day: 'Mon', minutes: 70 },
    { day: 'Tue', minutes: 50 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 85 },
    { day: 'Fri', minutes: 50 },
    { day: 'Sat', minutes: 35 },
    { day: 'Sun', minutes: 40 },
  ],
  '4': [ // PR Sreejesh
    { day: 'Mon', minutes: 95 },
    { day: 'Tue', minutes: 70 },
    { day: 'Wed', minutes: 50 },
    { day: 'Thu', minutes: 110 },
    { day: 'Fri', minutes: 80 },
    { day: 'Sat', minutes: 40 },
    { day: 'Sun', minutes: 105 },
  ],
};

// Player-specific risk factors
export const playerRiskFactors = {
  '1': [ // sangeeta phogat - Excellent condition
    { factor: 'Optimal Performance', level: 'Low' },
  ],
  '2': [ // abhishek singh - Good condition
    { factor: 'Slightly Elevated Heart Rate', level: 'Low' },
    { factor: 'Moderate Stress', level: 'Medium' },
  ],
  '3': [ // ellyse perry - Needs attention
    { factor: 'High Heart Rate', level: 'High' },
    { factor: 'Low Hydration', level: 'Medium' },
    { factor: 'High Stress', level: 'High' },
    { factor: 'Insufficient Sleep', level: 'Medium' },
  ],
  '4': [ // PR Sreejesh - Excellent condition
    { factor: 'Minor Recovery Needed', level: 'Low' },
  ],
};

const makeWearableSeries = (startDate, days, baseLoad, variation) => {
  const data = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    data.push({
      date: date.toISOString().split('T')[0],
      heart_rate: Math.round(60 + Math.random() * 20),
      distance: Number((5 + Math.random() * 10).toFixed(1)),
      training_load: Math.round(baseLoad + (Math.random() - 0.5) * variation),
      sleep_hours: Number((6 + Math.random() * 3).toFixed(1)),
      recovery_score: Math.round(60 + Math.random() * 40),
      stress_level: Math.round(20 + Math.random() * 60),
    });
  }
  return data;
};

const baseDate = new Date();
baseDate.setDate(baseDate.getDate() - 30);

export const playerWearableData = {
  '1': makeWearableSeries(baseDate, 30, 500, 140),
  '2': makeWearableSeries(baseDate, 30, 460, 130),
  '3': makeWearableSeries(baseDate, 30, 420, 120),
  '4': makeWearableSeries(baseDate, 30, 480, 130),
};

// Team players data
export const teamPlayers = [
  {
    id: '1',
    name: 'sangeeta phogat',
    position: 'Forward',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    stats: {
      healthScore: 92,
      activitiesThisWeek: 6,
      avgHeartRate: 65,
      performanceScore: 88,
    },
    status: 'excellent',
  },
  {
    id: '2',
    name: 'abhishek singh',
    position: 'Midfielder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    stats: {
      healthScore: 85,
      activitiesThisWeek: 5,
      avgHeartRate: 70,
      performanceScore: 82,
    },
    status: 'good',
  },
  {
    id: '3',
    name: 'ellyse perry',
    position: 'Defender',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    stats: {
      healthScore: 78,
      activitiesThisWeek: 4,
      avgHeartRate: 75,
      performanceScore: 76,
    },
    status: 'needsAttention',
  },
  {
    id: '4',
    name: 'PR Sreejesh',
    position: 'Goalkeeper',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    stats: {
      healthScore: 90,
      activitiesThisWeek: 5,
      avgHeartRate: 68,
      performanceScore: 85,
    },
    status: 'excellent',
  },
];

// Team-wide performance data (for coach view)
export const teamPerformanceData = [
  { date: 'Jan 10', score: 75, heartRate: 72 },
  { date: 'Jan 11', score: 78, heartRate: 70 },
  { date: 'Jan 12', score: 82, heartRate: 68 },
  { date: 'Jan 13', score: 80, heartRate: 69 },
  { date: 'Jan 14', score: 85, heartRate: 67 },
  { date: 'Jan 15', score: 83, heartRate: 68 },
  { date: 'Jan 16', score: 88, heartRate: 66 },
];

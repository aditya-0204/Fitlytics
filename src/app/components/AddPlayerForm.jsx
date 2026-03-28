import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Activity, Heart, Moon, Zap, Target } from 'lucide-react';

const PLAYER_TYPES_BY_SPORT = {
  Cricket: ['Batter', 'Opening Batter', 'Middle-Order Batter', 'All-Rounder', 'Fast Bowler', 'Medium Pacer', 'Spin Bowler', 'Wicketkeeper'],
  Football: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Striker', 'Winger', 'Center Back', 'Full Back'],
  Hockey: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Drag Flicker'],
  Basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  Volleyball: ['Setter', 'Outside Hitter', 'Opposite Hitter', 'Middle Blocker', 'Libero'],
  Tennis: ['Singles Specialist', 'Doubles Specialist', 'Baseline Player', 'All-Court Player'],
  Badminton: ['Singles Player', 'Doubles Player', 'Mixed Doubles Specialist', 'All-Round Player'],
  Athletics: ['Sprinter', 'Middle-Distance Runner', 'Long-Distance Runner', 'Jumper', 'Thrower', 'Decathlete'],
  Wrestling: ['Freestyle Wrestler', 'Greco-Roman Wrestler', 'Lightweight Wrestler', 'Heavyweight Wrestler'],
  Swimming: ['Freestyle Swimmer', 'Backstroke Swimmer', 'Breaststroke Swimmer', 'Butterfly Swimmer', 'Medley Swimmer'],
  Kabaddi: ['Raider', 'Defender', 'All-Rounder'],
  'Table Tennis': ['Attacking Player', 'Defensive Player', 'All-Round Player'],
};

export function AddPlayerForm({ onClose, onAddPlayer, coachSportType = 'Football' }) {
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    position: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    avatar: '',

    // Health Metrics (initial values)
    restingHeartRate: 70,
    sleepHours: 8,
    recoveryScore: 85,
    dailyCalories: 2500,
    vo2Max: 50,
    hydrationLevel: 85,
    stressLevel: 30,
    trainingLoad: 450,

    // ACWR + performance drop (this is used for AI suggestions)
    acwr: 1.2,
    performanceDrop: 0,

    // Extended meta fields
    experienceLevel: 'Intermediate',
    injuryHistory: '',
    emergencyContact: '',

    // Performance Data (will be generated)
    performanceScore: 80,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentActivities, setRecentActivities] = useState([
    {
      id: `new-activity-${Date.now()}`,
      type: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      caloriesBurned: '',
      intensity: 'medium',
      notes: '',
    },
  ]);

  const positions = PLAYER_TYPES_BY_SPORT[coachSportType] || PLAYER_TYPES_BY_SPORT.Football;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addRecentActivityRow = () => {
    setRecentActivities((prev) => [
      ...prev,
      {
        id: `new-activity-${Date.now()}-${prev.length}`,
        type: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        caloriesBurned: '',
        intensity: 'medium',
        notes: '',
      },
    ]);
  };

  const updateRecentActivity = (id, field, value) => {
    setRecentActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, [field]: value } : activity
      )
    );
  };

  const removeRecentActivityRow = (id) => {
    setRecentActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Numeric validations
    if (formData.height && (isNaN(formData.height) || formData.height < 100 || formData.height > 250)) {
      newErrors.height = 'Height must be between 100-250 cm';
    }
    if (formData.weight && (isNaN(formData.weight) || formData.weight < 30 || formData.weight > 150)) {
      newErrors.weight = 'Weight must be between 30-150 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Generate new player ID
      const newId = Date.now().toString();

      const generatePerformanceData = (baseScore) => {
        const today = new Date();
        return Array.from({ length: 7 }).map((_, idx) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - idx));
          const score = Math.max(40, Math.min(100, Math.round(baseScore + (Math.random() - 0.5) * 12)));
          return { date: d.toISOString().split('T')[0], score };
        });
      };

      const generateWeeklyActivity = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({ day, minutes: Math.floor(30 + Math.random() * 90) }));
      };

      const normalizedRecentActivities = recentActivities
        .filter((activity) => activity.type.trim().length > 0)
        .map((activity, idx) => ({
          id: `activity-${newId}-${idx + 1}`,
          type: activity.type.trim(),
          date: activity.date,
          duration: Number(activity.duration) || 0,
          caloriesBurned: Number(activity.caloriesBurned) || 0,
          intensity: activity.intensity || 'medium',
          notes: activity.notes?.trim() || '',
        }));

      const newPlayer = {
        id: newId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        sportType: coachSportType,
        dateOfBirth: formData.dateOfBirth,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        avatar: formData.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop`,

        // Health metrics
        healthMetrics: {
          heartRate: { value: formData.restingHeartRate, trend: { value: 0, isPositive: true } },
          sleep: { value: formData.sleepHours, trend: { value: 0, isPositive: true } },
          recovery: { value: formData.recoveryScore, trend: { value: 0, isPositive: true } },
          calories: { value: formData.dailyCalories, trend: { value: 0, isPositive: true } },
          vo2Max: { value: formData.vo2Max, trend: { value: 0, isPositive: true } },
          hydration: { value: formData.hydrationLevel, trend: { value: 0, isPositive: true } },
          stress: { value: formData.stressLevel, trend: { value: 0, isPositive: true } },
          trainingLoad: { value: formData.trainingLoad, trend: { value: 0, isPositive: true } },
        },

        // Stats for team overview
        stats: {
          healthScore: formData.recoveryScore,
          activitiesThisWeek: normalizedRecentActivities.length,
          avgHeartRate: formData.restingHeartRate,
          performanceScore: formData.performanceScore,
        },

        acwr: parseFloat(formData.acwr),
        performanceDrop: parseFloat(formData.performanceDrop),

        performanceData: generatePerformanceData(formData.performanceScore),
        weeklyActivity: generateWeeklyActivity(),
        riskFactors: [],
        wearableData: [],
        activities: normalizedRecentActivities,

        meta: {
          experienceLevel: formData.experienceLevel,
          injuryHistory: formData.injuryHistory,
          emergencyContact: formData.emergencyContact,
        },

        // Status used in PlayerCard
        status: 'good',
      };

      await onAddPlayer(newPlayer);
      onClose();
    } catch (error) {
      console.error('Error adding player:', error);
      setErrors({ submit: 'Failed to add player. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Player</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position *
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Sport: {coachSportType}
                </p>
                <select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="player@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange('avatar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Pro">Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Injury History
                </label>
                <input
                  type="text"
                  value={formData.injuryHistory}
                  onChange={(e) => handleInputChange('injuryHistory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="E.g., ankle sprain, knee pain"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>
          </div>

          {/* Physical Attributes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Physical Attributes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.height ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="175"
                  min="100"
                  max="250"
                />
                {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="70"
                  min="30"
                  max="150"
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
              </div>
            </div>
          </div>

          {/* Initial Health Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Initial Health Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resting Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={formData.restingHeartRate}
                  onChange={(e) => handleInputChange('restingHeartRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="40"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sleep Hours
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sleepHours}
                  onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recovery Score
                </label>
                <input
                  type="number"
                  value={formData.recoveryScore}
                  onChange={(e) => handleInputChange('recoveryScore', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Calories
                </label>
                <input
                  type="number"
                  value={formData.dailyCalories}
                  onChange={(e) => handleInputChange('dailyCalories', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="1000"
                  max="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VO2 Max
                </label>
                <input
                  type="number"
                  value={formData.vo2Max}
                  onChange={(e) => handleInputChange('vo2Max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="20"
                  max="80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hydration Level (%)
                </label>
                <input
                  type="number"
                  value={formData.hydrationLevel}
                  onChange={(e) => handleInputChange('hydrationLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stress Level
                </label>
                <input
                  type="number"
                  value={formData.stressLevel}
                  onChange={(e) => handleInputChange('stressLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Training Load
                </label>
                <input
                  type="number"
                  value={formData.trainingLoad}
                  onChange={(e) => handleInputChange('trainingLoad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ACWR
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.acwr}
                  onChange={(e) => handleInputChange('acwr', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Performance Drop (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.performanceDrop}
                  onChange={(e) => handleInputChange('performanceDrop', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recent Activities (Optional)
              </h3>
              <button
                type="button"
                onClick={addRecentActivityRow}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Activity Row
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <input
                    type="text"
                    value={activity.type}
                    onChange={(e) => updateRecentActivity(activity.id, 'type', e.target.value)}
                    className="md:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Activity type"
                  />
                  <input
                    type="date"
                    value={activity.date}
                    onChange={(e) => updateRecentActivity(activity.id, 'date', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    value={activity.duration}
                    onChange={(e) => updateRecentActivity(activity.id, 'duration', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Duration (min)"
                    aria-label="Duration in minutes"
                    title="Duration in minutes"
                  />
                  <input
                    type="number"
                    value={activity.caloriesBurned}
                    onChange={(e) => updateRecentActivity(activity.id, 'caloriesBurned', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Calories Burned (kcal)"
                    aria-label="Calories burned in kilocalories"
                    title="Calories burned in kilocalories"
                  />
                  <select
                    value={activity.intensity}
                    onChange={(e) => updateRecentActivity(activity.id, 'intensity', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeRecentActivityRow(activity.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    disabled={recentActivities.length === 1}
                  >
                    Remove
                  </button>
                  <input
                    type="text"
                    value={activity.notes}
                    onChange={(e) => updateRecentActivity(activity.id, 'notes', e.target.value)}
                    className="md:col-span-7 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Notes (optional)"
                  />
                </div>
              ))}
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding Player...' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Activity, AlertCircle, Lock, User, Trophy, Target } from 'lucide-react';

const SPORT_TO_COACH_TYPES = {
  Cricket: ['Batting Coach', 'Bowling Coach', 'Fielding Coach', 'Wicketkeeping Coach', 'Strategy Coach', 'Strength & Conditioning Coach'],
  Football: ['Head Coach', 'Assistant Coach', 'Goalkeeping Coach', 'Defensive Coach', 'Attacking Coach', 'Set-Piece Coach', 'Fitness Coach'],
  Hockey: ['Head Coach', 'Goalkeeping Coach', 'Defense Coach', 'Attack Coach', 'Penalty Corner Coach', 'Fitness Coach'],
  Basketball: ['Head Coach', 'Offensive Coach', 'Defensive Coach', 'Shooting Coach', 'Player Development Coach', 'Strength & Conditioning Coach'],
  Volleyball: ['Head Coach', 'Serving Coach', 'Blocking Coach', 'Defensive Coach', 'Setter Coach', 'Conditioning Coach'],
  Tennis: ['Head Coach', 'Technique Coach', 'Serve Coach', 'Mental Performance Coach', 'Fitness Coach'],
  Badminton: ['Head Coach', 'Singles Coach', 'Doubles Coach', 'Technique Coach', 'Fitness Coach'],
  Athletics: ['Sprints Coach', 'Endurance Coach', 'Jumps Coach', 'Throws Coach', 'Strength & Conditioning Coach'],
  Wrestling: ['Technique Coach', 'Strength Coach', 'Conditioning Coach', 'Tactical Coach'],
  Swimming: ['Freestyle Coach', 'Backstroke Coach', 'Breaststroke Coach', 'Butterfly Coach', 'Strength & Conditioning Coach'],
  Kabaddi: ['Raid Coach', 'Defense Coach', 'Strategy Coach', 'Conditioning Coach'],
  'Table Tennis': ['Technique Coach', 'Serve Coach', 'Footwork Coach', 'Tactical Coach', 'Mental Performance Coach'],
};

const SPORTS = Object.keys(SPORT_TO_COACH_TYPES);

export function Signup({ onSignup, onShowLogin, error }) {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'coach',
    sportType: SPORTS[0],
    coachType: SPORT_TO_COACH_TYPES[SPORTS[0]][0],
  });

  const coachTypes = useMemo(() => {
    return SPORT_TO_COACH_TYPES[formData.sportType] || [];
  }, [formData.sportType]);

  const updateField = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'sportType') {
        const nextCoachTypes = SPORT_TO_COACH_TYPES[value] || [];
        next.coachType = nextCoachTypes[0] || '';
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignup({
      name: formData.fullName,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      sportType: formData.sportType,
      coachType: formData.coachType,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign up as coach or player</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create password"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="coach">Coach</option>
                <option value="player">Player</option>
              </select>
            </div>

            {formData.role === 'coach' && (
              <>
                <div>
                  <label htmlFor="sportType" className="block text-sm dark:text-gray-300 mb-2">
                    Sport Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Trophy className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="sportType"
                      value={formData.sportType}
                      onChange={(e) => updateField('sportType', e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {SPORTS.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="coachType" className="block text-sm dark:text-gray-300 mb-2">
                    Coach Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Target className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="coachType"
                      value={formData.coachType}
                      onChange={(e) => updateField('coachType', e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {coachTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Sign Up
            </button>

            <button
              type="button"
              onClick={onShowLogin}
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-lg transition-colors"
            >
              Back To Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

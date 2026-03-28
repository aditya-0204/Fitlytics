import { useState, useEffect, useMemo } from 'react';
import { Activity, Heart, TrendingUp, Users, ChartBar, Moon, Droplet, Brain, Zap, Sun, LogOut, Plus } from 'lucide-react';
import { HealthMetricCard } from './components/HealthMetricCard';
import { ActivityCard } from './components/ActivityCard';
import { PerformanceChart } from './components/PerformanceChart';
import { PlayerCard } from './components/PlayerCard';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { RiskAnalysisCard } from './components/RiskAnalysisCard';
import { AthleteMonitoringPanel } from './components/AthleteMonitoringPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './components/Dashboard';
import { AIInsights } from './components/AIInsights';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { AddPlayerForm } from './components/AddPlayerForm';
import { authenticateUser, registerUser } from './utils/mockAuth';
import {
  playerHealthMetrics,
  playerActivities,
  playerPerformanceData,
  playerWeeklyActivity,
  playerRiskFactors,
  playerWearableData,
  teamPlayers,
} from './data/mockData';
import { cleanData, calculateTrainingLoad } from './utils/dataProcessing';
import { calculateAcuteLoad, calculateChronicLoad, calculateACWR } from './utils/featureEngineering';
import { calculateBaseline, calculatePerformanceDrop } from './utils/performanceAnalysis';

const getCoachTeamStorageKey = (coachUser) => `athleteDashboardTeamPlayers:${coachUser?.id || coachUser?.username || 'coach'}`;
const DEFAULT_COACH_USER = { id: 'coach-1', username: 'coach' };

const loadCoachTeamPlayers = (coachUser) => {
  if (!coachUser) {
    return teamPlayers;
  }

  try {
    const key = getCoachTeamStorageKey(coachUser);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    return [];
  }

  // Keep demo coach experience unchanged; new signed-up coaches start empty.
  return coachUser.username === 'coach' ? teamPlayers : [];
};

const loadSharedTeamPlayersForPlayerView = () => {
  try {
    const key = getCoachTeamStorageKey(DEFAULT_COACH_USER);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    return teamPlayers;
  }
  return teamPlayers;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [currentTeamPlayers, setCurrentTeamPlayers] = useState(teamPlayers);

  useEffect(() => {
    const storedUser = localStorage.getItem('athleteDashboardUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === 'coach') {
      setCurrentTeamPlayers(loadCoachTeamPlayers(user));
      return;
    }

    // Player view reads shared team data so coach updates are visible.
    setCurrentTeamPlayers(loadSharedTeamPlayersForPlayerView());
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'coach') {
      return;
    }
    localStorage.setItem(getCoachTeamStorageKey(user), JSON.stringify(currentTeamPlayers));
  }, [currentTeamPlayers, user]);

  const handleLogin = (username, password) => {
    const authenticatedUser = authenticateUser(username, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('athleteDashboardUser', JSON.stringify(authenticatedUser));
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleSignup = (signupData) => {
    const result = registerUser(signupData);
    if (result.ok) {
      setUser(result.user);
      localStorage.setItem('athleteDashboardUser', JSON.stringify(result.user));
      setLoginError('');
      setShowSignup(false);
    } else {
      setLoginError(result.error || 'Unable to create account');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPlayer(null);
    setShowAddPlayerForm(false);
    localStorage.removeItem('athleteDashboardUser');
  };

  const handleAddPlayer = async (newPlayer) => {
    // Add the new player to the current team players state
    setCurrentTeamPlayers(prev => [...prev, newPlayer]);
    // In a real app, this would also update the backend
  };

  const handleUpdatePlayer = (updatedPlayer) => {
    setCurrentTeamPlayers((prev) =>
      prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
    );
    setSelectedPlayer((prev) => (prev && prev.id === updatedPlayer.id ? updatedPlayer : prev));
  };

  const computedTeamPerformanceData = useMemo(() => {
    const byDate = new Map();

    currentTeamPlayers.forEach((player) => {
      const sourceData = Array.isArray(player.performanceData) && player.performanceData.length > 0
        ? player.performanceData
        : (playerPerformanceData[player.id] || []);

      if (sourceData.length > 0) {
        sourceData.forEach((entry) => {
          const date = entry?.date;
          const score = Number(entry?.score);
          if (!date || Number.isNaN(score)) {
            return;
          }
          const existing = byDate.get(date) || { total: 0, count: 0 };
          existing.total += score;
          existing.count += 1;
          byDate.set(date, existing);
        });
      } else if (player?.stats?.performanceScore !== undefined) {
        const today = new Date().toISOString().split('T')[0];
        const score = Number(player.stats.performanceScore);
        if (!Number.isNaN(score)) {
          const existing = byDate.get(today) || { total: 0, count: 0 };
          existing.total += score;
          existing.count += 1;
          byDate.set(today, existing);
        }
      }
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, data]) => ({
        date,
        score: Math.round(data.total / data.count),
      }));
  }, [currentTeamPlayers]);

  // If not authenticated, show login
  if (!user) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        {showSignup ? (
          <Signup
            onSignup={handleSignup}
            onShowLogin={() => {
              setShowSignup(false);
              setLoginError('');
            }}
            error={loginError}
          />
        ) : (
          <Login
            onLogin={handleLogin}
            error={loginError}
            onShowSignup={() => {
              setShowSignup(true);
              setLoginError('');
            }}
          />
        )}
      </div>
    );
  }

  // Get player-specific data
  const playerId = user.role === 'player' ? user.playerId : null;
  const currentUserPlayer = currentTeamPlayers.find(p => p.id === playerId);

  const healthMetrics = playerId
    ? currentUserPlayer?.healthMetrics || playerHealthMetrics[playerId] || null
    : null;
  const recentActivities = playerId
    ? currentUserPlayer?.activities || playerActivities[playerId] || []
    : [];
  const performanceData = playerId
    ? currentUserPlayer?.performanceData || playerPerformanceData[playerId] || []
    : [];
  const weeklyActivity = playerId
    ? currentUserPlayer?.weeklyActivity || playerWeeklyActivity[playerId] || []
    : [];
  const riskFactors = playerId
    ? currentUserPlayer?.riskFactors || playerRiskFactors[playerId] || []
    : [];

  const wearableData = playerId
    ? playerWearableData[playerId] || currentUserPlayer?.wearableData || []
    : [];

  const avgHealthScore = currentTeamPlayers.length > 0
    ? Math.round(currentTeamPlayers.reduce((sum, player) => sum + (player.stats?.healthScore || 0), 0) / currentTeamPlayers.length)
    : 0;
  const avgPerformanceScore = currentTeamPlayers.length > 0
    ? Math.round(currentTeamPlayers.reduce((sum, player) => sum + (player.stats?.performanceScore || 0), 0) / currentTeamPlayers.length)
    : 0;
  const activitiesTotal = currentTeamPlayers.reduce((sum, player) => sum + (player.stats?.activitiesThisWeek || 0), 0);
  const processedWearable = calculateTrainingLoad(cleanData(wearableData));
  const acute = calculateAcuteLoad(processedWearable, 7);
  const chronic = calculateChronicLoad(processedWearable, 28);
  const acwrObj = calculateACWR(acute, chronic);
  const baseline = calculateBaseline(processedWearable);
  const latestDistance = processedWearable.length ? processedWearable[processedWearable.length - 1].distance : 0;
  const performanceDropObj = calculatePerformanceDrop(baseline, latestDistance);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <ErrorBoundary>
        {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl dark:text-white">Athletic Performance Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.role === 'coach' ? 'Coach View' : `${user.name} - Player View`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'player' ? (
          // Player View
          <>
            {/* Health Metrics */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="dark:text-white">Health Metrics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <HealthMetricCard
                  title="Resting Heart Rate"
                  value={healthMetrics?.heartRate.value}
                  unit="bpm"
                  icon={Heart}
                  trend={healthMetrics?.heartRate.trend}
                  color="bg-red-500"
                />
                <HealthMetricCard
                  title="Sleep Duration"
                  value={healthMetrics?.sleep.value}
                  unit="hours"
                  icon={Moon}
                  trend={healthMetrics?.sleep.trend}
                  color="bg-indigo-500"
                />
                <HealthMetricCard
                  title="Recovery Score"
                  value={healthMetrics?.recovery.value}
                  unit="/100"
                  icon={TrendingUp}
                  trend={healthMetrics?.recovery.trend}
                  color="bg-green-500"
                />
                <HealthMetricCard
                  title="Daily Calories"
                  value={healthMetrics?.calories.value}
                  unit="kcal"
                  icon={Activity}
                  trend={healthMetrics?.calories.trend}
                  color="bg-orange-500"
                />
              </div>
            </section>

            {/* Additional Metrics */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="dark:text-white">Additional Metrics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <HealthMetricCard
                  title="VO2 Max"
                  value={healthMetrics?.vo2Max.value}
                  unit="ml/kg/min"
                  icon={Activity}
                  trend={healthMetrics?.vo2Max.trend}
                  color="bg-blue-500"
                />
                <HealthMetricCard
                  title="Hydration Level"
                  value={healthMetrics?.hydration.value}
                  unit="%"
                  icon={Droplet}
                  trend={healthMetrics?.hydration.trend}
                  color="bg-cyan-500"
                />
                <HealthMetricCard
                  title="Stress Level"
                  value={healthMetrics?.stress.value}
                  unit="/100"
                  icon={Brain}
                  trend={healthMetrics?.stress.trend}
                  color="bg-purple-500"
                />
                <HealthMetricCard
                  title="Training Load"
                  value={healthMetrics?.trainingLoad.value}
                  unit="AU"
                  icon={Zap}
                  trend={healthMetrics?.trainingLoad.trend}
                  color="bg-orange-500"
                />
              </div>
            </section>

            {/* Risk Analysis + Athlete Monitoring */}
            <section className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RiskAnalysisCard risks={riskFactors} />
                <AthleteMonitoringPanel
                  wearableData={playerWearableData[playerId]}
                  performanceData={performanceData}
                />
              </div>
            </section>

            {/* Performance Charts */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ChartBar className="w-5 h-5 text-gray-700" />
                <h2>Performance Trends</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceChart
                  data={performanceData}
                  type="line"
                  title="Performance Score (Last 7 Days)"
                  dataKey="score"
                  xAxisKey="date"
                  color="#3b82f6"
                />
                <PerformanceChart
                  data={weeklyActivity}
                  type="bar"
                  title="Weekly Activity Duration"
                  dataKey="minutes"
                  xAxisKey="day"
                  color="#10b981"
                />
              </div>
            </section>

            {/* Athlete Monitoring Dashboard */}
            <section className="mb-8">
              <Dashboard wearableData={playerWearableData[playerId]} />
            </section>

            {/* AI Guidance */}
            <section className="mb-8">
              <AIInsights
                acwr={acwrObj.ratio}
                performanceDrop={performanceDropObj.dropPercentage}
                recovery={healthMetrics?.recovery.value ?? 100}
                stress={healthMetrics?.stress.value ?? 0}
              />
            </section>

            {/* Recent Activities */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="dark:text-white">Recent Activities</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recentActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </section>
          </>
        ) : (
          // Coach View
          <>
            {/* Team Overview */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h2 className="dark:text-white">Team Overview</h2>
                </div>
                <button
                  onClick={() => setShowAddPlayerForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Player
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Players</p>
                      <p className="text-2xl dark:text-white">{currentTeamPlayers.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Health Score</p>
                      <p className="text-2xl dark:text-white">{avgHealthScore}/100</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Activities Today</p>
                      <p className="text-2xl dark:text-white">{activitiesTotal}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Performance</p>
                      <p className="text-2xl dark:text-white">{avgPerformanceScore}/100</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Team Performance Chart */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ChartBar className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="dark:text-white">Team Performance Trends</h2>
              </div>
              {currentTeamPlayers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Team performance trend will appear after you add players and activity data.
                  </p>
                </div>
              ) : (
                <PerformanceChart
                  data={computedTeamPerformanceData}
                  type="line"
                  title="Average Team Performance Score"
                  dataKey="score"
                  xAxisKey="date"
                  color="#8b5cf6"
                />
              )}
            </section>

            {/* Player Cards */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="dark:text-white">Player Health Status</h2>
              </div>
              {currentTeamPlayers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                  <h3 className="text-lg dark:text-white mb-2">No players added yet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Start by adding your first player to build your team overview.
                  </p>
                  <button
                    onClick={() => setShowAddPlayerForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Player
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentTeamPlayers.map((player) => (
                    <PlayerCard 
                      key={player.id} 
                      player={player}
                      onClick={() => setSelectedPlayer(player)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          onUpdatePlayer={handleUpdatePlayer}
        />
      )}

      {/* Add Player Form */}
      {showAddPlayerForm && (
        <AddPlayerForm
          onClose={() => setShowAddPlayerForm(false)}
          onAddPlayer={handleAddPlayer}
          coachSportType={user?.sportType || 'Football'}
        />
      )}
    </ErrorBoundary>
  </div>
  );
}

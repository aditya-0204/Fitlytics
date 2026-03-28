import { TrendingUp, Activity, Heart, Award } from 'lucide-react';

export function PlayerCard({ player, onClick }) {
  const statusColors = {
    excellent: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
    good: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
    needsAttention: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800',
  };

  const statusLabels = {
    excellent: 'Excellent',
    good: 'Good',
    needsAttention: 'Needs Attention',
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4 mb-4">
        <img 
          src={player.avatar} 
          alt={player.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="mb-1 dark:text-white">{player.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{player.position}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm border ${statusColors[player.status]}`}>
            {statusLabels[player.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Heart className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Health Score</p>
            <p className="text-sm dark:text-gray-200">{player.stats.healthScore}/100</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Activities</p>
            <p className="text-sm dark:text-gray-200">{player.stats.activitiesThisWeek} this week</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Heart Rate</p>
            <p className="text-sm dark:text-gray-200">{player.stats.avgHeartRate} bpm</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Performance</p>
            <p className="text-sm dark:text-gray-200">{player.stats.performanceScore}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}

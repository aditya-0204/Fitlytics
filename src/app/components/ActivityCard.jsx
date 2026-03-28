import { Clock, Zap, Target } from 'lucide-react';

export function ActivityCard({ activity }) {
  const intensityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="mb-1 dark:text-white">{activity.type}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${intensityColors[activity.intensity]}`}>
          {activity.intensity}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
            <p className="text-sm dark:text-gray-200">{activity.duration} min</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
            <p className="text-sm dark:text-gray-200">{activity.caloriesBurned} kcal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Intensity</p>
            <p className="text-sm dark:text-gray-200 capitalize">{activity.intensity}</p>
          </div>
        </div>
      </div>
      
      {activity.notes && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">{activity.notes}</p>
      )}
    </div>
  );
}

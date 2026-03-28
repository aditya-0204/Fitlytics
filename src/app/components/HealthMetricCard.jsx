export function HealthMetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend,
  color 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl dark:text-white">{value}</span>
            {unit && <span className="text-gray-500 dark:text-gray-400">{unit}</span>}
          </div>
          {trend && (
            <div className={`mt-2 text-sm ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

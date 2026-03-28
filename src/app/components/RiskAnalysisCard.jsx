import { AlertTriangle, ShieldAlert, TrendingDown } from 'lucide-react';

export function RiskAnalysisCard({ risks }) {
  const getRiskColor = (level) => {
    const normalizedLevel = level?.toLowerCase();
    switch (normalizedLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const getRiskIcon = (level) => {
    const normalizedLevel = level?.toLowerCase();
    switch (normalizedLevel) {
      case 'high':
        return <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getBorderColor = (level) => {
    const normalizedLevel = level?.toLowerCase();
    switch (normalizedLevel) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h3 className="dark:text-white">Risk Analysis</h3>
      </div>
      
      <div className="space-y-4">
        {risks.map((risk, index) => {
          // Support both formats: {factor, level} and {name, level, value, description}
          const name = risk.name || risk.factor;
          const level = risk.level;
          const description = risk.description;
          const value = risk.value;
          
          return (
            <div key={index} className="border-l-4 pl-4" style={{ borderColor: getBorderColor(level) }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getRiskIcon(level)}
                  <h4 className="dark:text-white">{name}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm border ${getRiskColor(level)}`}>
                  {level?.toUpperCase()}
                </span>
              </div>
              {description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{description}</p>}
              {value !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        level?.toLowerCase() === 'high' ? 'bg-red-500' : 
                        level?.toLowerCase() === 'medium' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{value}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, Heart, Activity, TrendingUp, Moon, Droplet, Brain, Zap, Download } from 'lucide-react';
import { HealthMetricCard } from './HealthMetricCard';
import { ActivityCard } from './ActivityCard';
import { PerformanceChart } from './PerformanceChart';
import { RiskAnalysisCard } from './RiskAnalysisCard';
import { AIInsights } from './AIInsights';
import { getAISuggestions, getAIRiskAndSafetyInsights } from '../utils/aiInsights';
import {
  playerHealthMetrics,
  playerActivities,
  playerPerformanceData,
  playerRiskFactors,
} from '../data/mockData';
import jsPDF from 'jspdf';

export function PlayerDetailModal({ player, onClose, onUpdatePlayer }) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    caloriesBurned: 400,
    intensity: 'medium',
    notes: '',
  });
  // Get player-specific data (with fallback to new/additive player payloads)
  const healthMetrics = playerHealthMetrics[player.id] || player.healthMetrics || {
    heartRate: { value: 0, trend: { value: 0, isPositive: true } },
    sleep: { value: 0, trend: { value: 0, isPositive: true } },
    recovery: { value: 0, trend: { value: 0, isPositive: true } },
    calories: { value: 0, trend: { value: 0, isPositive: true } },
    vo2Max: { value: 0, trend: { value: 0, isPositive: true } },
    hydration: { value: 0, trend: { value: 0, isPositive: true } },
    stress: { value: 0, trend: { value: 0, isPositive: true } },
    trainingLoad: { value: 0, trend: { value: 0, isPositive: true } },
  };
  const activities = player.activities || playerActivities[player.id] || [];
  const performanceData = player.performanceData || playerPerformanceData[player.id] || [];
  const riskFactors = player.riskFactors || playerRiskFactors[player.id] || [];

  // Helper function to get trend indicator
  const getTrendIndicator = (trendObj) => {
    if (!trendObj || typeof trendObj !== 'object') return '→';
    const trendValue = trendObj.value || 0;
    if (trendValue > 0) return '↑';
    if (trendValue < 0) return '↓';
    return '→';
  };

  // Helper function to get trend value
  const getTrendValue = (trendObj) => {
    if (!trendObj || typeof trendObj !== 'object') return 0;
    return Math.abs(trendObj.value || 0);
  };

  // Generate PDF report for download
  const generatePDFReport = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    const contentWidth = rightMargin - leftMargin;

    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Analyze trends to identify focus areas
    const focusAreas = [];
    if (healthMetrics.recovery.value < 70) {
      focusAreas.push('Recovery optimization - Current score is below optimal range');
    }
    if (healthMetrics.sleep.value < 7) {
      focusAreas.push('Sleep improvement - Increase sleep duration to 7-9 hours');
    }
    if (healthMetrics.hydration.value < 80) {
      focusAreas.push('Hydration management - Increase fluid intake throughout the day');
    }
    if (healthMetrics.stress.value > 65) {
      focusAreas.push('Stress reduction - Implement relaxation techniques');
    }
    if (healthMetrics.trainingLoad.value > 450) {
      focusAreas.push('Training load management - Monitor for overtraining');
    }
    if (healthMetrics.vo2Max.value < 45) {
      focusAreas.push('Cardiovascular endurance - Focus on aerobic capacity training');
    }

    // Calculate average performance
    const avgPerformance = performanceData.length > 0
      ? (performanceData.reduce((sum, d) => sum + d.score, 0) / performanceData.length).toFixed(1)
      : 'N/A';

    // Performance trend
    let performanceTrend = 'Stable';
    if (performanceData.length >= 2) {
      const recent = performanceData[performanceData.length - 1].score;
      const previous = performanceData[0].score;
      if (recent > previous + 5) performanceTrend = 'Improving';
      else if (recent < previous - 5) performanceTrend = 'Declining';
    }

    // Add player photo (convert to data URL)
    try {
      const imgData = await loadImageAsDataURL(player.avatar);
      pdf.addImage(imgData, 'JPEG', leftMargin, yPosition, 30, 30);
    } catch (error) {
      console.error('Failed to load player image:', error);
    }

    // Header with player info
    pdf.setFillColor(37, 99, 235); // Blue
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('ATHLETIC PERFORMANCE REPORT', pageWidth / 2, 10, { align: 'center' });

    // Player info next to photo
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text(player.name, leftMargin + 35, yPosition + 8);
    pdf.setFontSize(10);
    pdf.text(`Position: ${player.position}`, leftMargin + 35, yPosition + 15);
    pdf.text(`Status: ${player.status}`, leftMargin + 35, yPosition + 21);
    pdf.text(`Generated: ${date}`, leftMargin + 35, yPosition + 27);

    yPosition += 40;

    // Helper function to add section header
    const addSectionHeader = (title) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.setFillColor(59, 130, 246);
      pdf.rect(leftMargin, yPosition, contentWidth, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.text(title, leftMargin + 2, yPosition + 5.5);
      pdf.setTextColor(0, 0, 0);
      yPosition += 12;
    };

    // Helper function to add text with wrapping
    const addText = (text, size = 10, isBold = false) => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.setFontSize(size);
      if (isBold) pdf.setFont(undefined, 'bold');
      else pdf.setFont(undefined, 'normal');
      
      const lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, leftMargin, yPosition);
      yPosition += lines.length * (size * 0.4) + 2;
    };

    // Performance Summary
    addSectionHeader('PERFORMANCE SUMMARY');
    addText(`Overall Health Status: ${player.stats?.healthScore || 'N/A'}/100`);
    addText(`Performance Trend: ${performanceTrend}`);
    addText(`Average Performance Score: ${avgPerformance}/100`);
    yPosition += 3;

    // Health Metrics
    let aiRiskAndSafety = null;
    try {
      aiRiskAndSafety = await getAIRiskAndSafetyInsights({
        hydration: healthMetrics.hydration.value ?? 0,
        stress: healthMetrics.stress.value ?? 0,
        trainingLoad: healthMetrics.trainingLoad.value ?? 0,
        calories: healthMetrics.calories.value ?? 0,
        heartRate: healthMetrics.heartRate.value ?? 0,
        sleep: healthMetrics.sleep.value ?? 0,
        recovery: healthMetrics.recovery.value ?? 0,
        vo2Max: healthMetrics.vo2Max.value ?? 0,
        riskFactors,
      });
    } catch (error) {
      console.error('Failed to fetch AI risk/safety sections for PDF:', error);
    }

    addSectionHeader('HEALTH METRICS (CURRENT VALUES)');
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Primary Metrics:', leftMargin, yPosition);
    yPosition += 5;
    pdf.setFont(undefined, 'normal');

    const metrics = [
      `Resting Heart Rate: ${healthMetrics.heartRate.value} bpm (${getTrendIndicator(healthMetrics.heartRate.trend)} ${getTrendValue(healthMetrics.heartRate.trend)} from baseline)`,
      `Sleep Duration: ${healthMetrics.sleep.value} hours (${getTrendIndicator(healthMetrics.sleep.trend)} ${getTrendValue(healthMetrics.sleep.trend)})`,
      `Recovery Score: ${healthMetrics.recovery.value}/100 (${getTrendIndicator(healthMetrics.recovery.trend)} ${getTrendValue(healthMetrics.recovery.trend)})`,
      `VO2 Max: ${healthMetrics.vo2Max.value} ml/kg/min (${getTrendIndicator(healthMetrics.vo2Max.trend)} ${getTrendValue(healthMetrics.vo2Max.trend)})`,
    ];
    metrics.forEach(metric => addText(`  • ${metric}`, 9));
    
    yPosition += 2;
    pdf.setFont(undefined, 'bold');
    pdf.text('Additional Metrics:', leftMargin, yPosition);
    yPosition += 5;
    pdf.setFont(undefined, 'normal');

    const additionalMetricsFallback = [
      `Hydration Level: ${healthMetrics.hydration.value}% (${getTrendIndicator(healthMetrics.hydration.trend)} ${getTrendValue(healthMetrics.hydration.trend)})`,
      `Stress Level: ${healthMetrics.stress.value}/100 (${getTrendIndicator(healthMetrics.stress.trend)} ${getTrendValue(healthMetrics.stress.trend)})`,
      `Training Load: ${healthMetrics.trainingLoad.value} AU (${getTrendIndicator(healthMetrics.trainingLoad.trend)} ${getTrendValue(healthMetrics.trainingLoad.trend)})`,
      `Daily Calories: ${healthMetrics.calories.value} kcal (${getTrendIndicator(healthMetrics.calories.trend)} ${getTrendValue(healthMetrics.calories.trend)})`,
    ];
    const additionalMetrics = aiRiskAndSafety?.metricsSnapshot?.length > 0
      ? aiRiskAndSafety.metricsSnapshot
      : additionalMetricsFallback;
    additionalMetrics.forEach(metric => addText(`  • ${metric}`, 9));
    yPosition += 3;

    // Risk Analysis
    addSectionHeader('RISK ANALYSIS & SAFETY CONSIDERATIONS');
    const aiRiskAnalysis = aiRiskAndSafety?.riskAnalysis || [];
    if (aiRiskAnalysis.length > 0) {
      aiRiskAnalysis.forEach(risk => {
        const riskLevel = risk.level || 'UNKNOWN';
        const riskIcon = riskLevel === 'HIGH' ? '⚠' : riskLevel === 'MEDIUM' ? '⚡' : 'ℹ';
        addText(`${riskIcon} ${risk.factor || 'Unknown Risk'} - ${riskLevel}`, 9, true);
      });
    } else if (riskFactors.length > 0) {
      riskFactors.forEach(risk => {
        const riskLevel = risk.level || 'Unknown';
        const riskIcon = riskLevel === 'High' ? '⚠' : riskLevel === 'Medium' ? '⚡' : 'ℹ';
        addText(`${riskIcon} ${risk.factor || 'Unknown Risk'} - ${riskLevel.toUpperCase()}`, 9, true);
      });
    } else {
      addText('No significant risk factors identified.', 9);
    }
    yPosition += 3;

    // Safety Tips
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(10);
    pdf.text('Safety Tips:', leftMargin, yPosition);
    yPosition += 5;
    pdf.setFont(undefined, 'normal');

    if (aiRiskAndSafety?.safetyTips?.length > 0) {
      aiRiskAndSafety.safetyTips.forEach((tip) => {
        addText('  • ' + tip, 8);
      });
    } else {
      riskFactors.forEach(risk => {
        const riskFactor = risk.factor || 'Unknown risk';

        let tip = '';
        if (riskFactor.toLowerCase().includes('heart rate') || riskFactor.toLowerCase().includes('injury')) {
          tip = 'Monitor closely and avoid high-impact activities. Consult medical staff.';
        } else if (riskFactor.toLowerCase().includes('stress') || riskFactor.toLowerCase().includes('fatigue') || riskFactor.toLowerCase().includes('sleep')) {
          tip = 'Reduce training intensity, prioritize rest and recovery.';
        } else if (riskFactor.toLowerCase().includes('training') || riskFactor.toLowerCase().includes('overtraining')) {
          tip = 'Implement recovery protocols and monitor for burnout.';
        } else {
          tip = 'Monitor condition and adjust training accordingly.';
        }
        addText('  • ' + riskFactor + ': ' + tip, 8);
      });

      if (riskFactors.length === 0) {
        addText('  • Continue monitoring all health metrics regularly', 8);
        addText('  • Maintain current training protocols', 8);
      }
    }
    yPosition += 3;

    // Areas Requiring Focus
    addSectionHeader('AREAS REQUIRING FOCUS');
    if (focusAreas.length > 0) {
      focusAreas.forEach((area, idx) => {
        addText(`${idx + 1}. ${area}`, 9);
      });
    } else {
      addText('All metrics are within optimal ranges. Continue current training regimen.', 9);
    }
    yPosition += 3;

    // Performance Trend
    addSectionHeader('PERFORMANCE TREND (LAST 7 DAYS)');
    performanceData.forEach(d => {
      addText(`  ${d.date}: ${d.score}/100`, 9);
    });
    yPosition += 3;

    // Recent Activities
    addSectionHeader('RECENT ACTIVITIES');
    activities.slice(0, 4).forEach(activity => {
      addText(`${activity.type} - ${activity.date}`, 9, true);
      addText(`  Duration: ${activity.duration} min  |  Calories: ${activity.calories || activity.caloriesBurned} kcal`, 8);
      if (activity.notes) {
        addText(`  Notes: ${activity.notes}`, 8);
      }
      yPosition += 2;
    });

    // Recommendations
    addSectionHeader('RECOMMENDATIONS');

    let aiRecommendations = '';
    try {
      aiRecommendations = await getAISuggestions({
        acwr: player.acwr ?? 1.0,
        performanceDrop: player.performanceDrop ?? 0,
        recoveryScore: healthMetrics.recovery.value ?? 100,
        stressLevel: healthMetrics.stress.value ?? 0,
      });
    } catch (err) {
      console.error('Failed to fetch AI recommendations for PDF:', err);
    }

    if (aiRecommendations && aiRecommendations.trim()) {
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      const lines = aiRecommendations
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      lines.forEach(line => {
        if (line.endsWith(':')) {
          // section/subheading in AI text
          pdf.setFont(undefined, 'bold');
          addText(line, 9);
          pdf.setFont(undefined, 'normal');
        } else {
          addText(line, 8);
        }
      });

    } else {
      // fallback legacy recommendations if AI fail
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(10);
      pdf.text('Immediate Actions:', leftMargin, yPosition);
      yPosition += 5;
      pdf.setFont(undefined, 'normal');
      if (riskFactors.filter(r => r.level === 'High').length > 0) {
        addText('  • Address high-risk factors immediately', 8);
        addText('  • Schedule medical evaluation if needed', 8);
        addText('  • Modify training intensity as recommended', 8);
      } else {
        addText('  • Continue current training program', 8);
        addText('  • Maintain regular monitoring schedule', 8);
      }
      yPosition += 2;

      pdf.setFont(undefined, 'bold');
      pdf.text('Short-term Goals (1-2 weeks):', leftMargin, yPosition);
      yPosition += 5;
      pdf.setFont(undefined, 'normal');
      if (focusAreas.length > 0) {
        focusAreas.slice(0, 3).forEach(area => {
          addText(`  • ${area.split(' - ')[0]}`, 8);
        });
      } else {
        addText('  • Maintain current performance levels', 8);
        addText('  • Focus on consistency in training', 8);
      }
      yPosition += 2;

      pdf.setFont(undefined, 'bold');
      pdf.text('Long-term Development:', leftMargin, yPosition);
      yPosition += 5;
      pdf.setFont(undefined, 'normal');
      addText('  • Progressive overload in strength training', 8);
      addText('  • Endurance capacity building', 8);
      addText('  • Skill-specific training enhancement', 8);
      addText('  • Injury prevention protocols', 8);
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Generated by Athletic Performance Dashboard', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    pdf.save(`${player.name.replace(/\s+/g, '_')}_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Helper function to load image as data URL
  const loadImageAsDataURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownload = async () => {
    if (isGeneratingReport) {
      return;
    }
    setIsGeneratingReport(true);
    try {
      await generatePDFReport();
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAddActivity = () => {
    if (!activityForm.type.trim()) {
      return;
    }

    const newActivity = {
      id: `activity-${Date.now()}`,
      type: activityForm.type.trim(),
      date: activityForm.date,
      duration: Number(activityForm.duration) || 0,
      caloriesBurned: Number(activityForm.caloriesBurned) || 0,
      intensity: activityForm.intensity,
      notes: activityForm.notes.trim(),
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 20);
    const updatedPlayer = {
      ...player,
      activities: updatedActivities,
      stats: {
        ...(player.stats || {}),
        activitiesThisWeek: updatedActivities.length,
      },
    };

    onUpdatePlayer?.(updatedPlayer);
    setActivityForm((prev) => ({
      ...prev,
      type: '',
      notes: '',
      duration: 60,
      caloriesBurned: 400,
      intensity: 'medium',
      date: new Date().toISOString().split('T')[0],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <img 
              src={player.avatar} 
              alt={player.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="dark:text-white">{player.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{player.position}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isGeneratingReport}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
                isGeneratingReport
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              title="Download Performance Report"
            >
              <Download className="w-5 h-5" />
              <span>{isGeneratingReport ? 'Generating report...' : 'Download Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Primary Health Metrics */}
          <section>
            <h3 className="mb-4 dark:text-white">Primary Health Metrics</h3>
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
                title="VO2 Max"
                value={healthMetrics?.vo2Max.value}
                unit="ml/kg/min"
                icon={Activity}
                trend={healthMetrics?.vo2Max.trend}
                color="bg-blue-500"
              />
            </div>
          </section>

          {/* Additional Metrics */}
          <section>
            <h3 className="mb-4 dark:text-white">Additional Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Risk Analysis */}
          <section>
            <RiskAnalysisCard risks={riskFactors} />
          </section>

          {/* Performance Chart */}
          <section>
            <PerformanceChart
              data={performanceData}
              type="line"
              title="Performance Score (Last 7 Days)"
              dataKey="score"
              xAxisKey="date"
              color="#3b82f6"
            />
          </section>

          {/* Recent Activities */}
          <section>
            <h3 className="mb-4 dark:text-white">Recent Activities</h3>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Add or update player activity</p>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <input
                  type="text"
                  value={activityForm.type}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="md:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Activity type"
                />
                <input
                  type="date"
                  value={activityForm.date}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  value={activityForm.duration}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, duration: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Duration"
                />
                <select
                  value={activityForm.intensity}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, intensity: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Activity
                </button>
                <input
                  type="number"
                  value={activityForm.caloriesBurned}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, caloriesBurned: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Calories"
                />
                <input
                  type="text"
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="md:col-span-5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Notes (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-sm text-gray-600 dark:text-gray-300">
                  No activities yet. Add one above.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}





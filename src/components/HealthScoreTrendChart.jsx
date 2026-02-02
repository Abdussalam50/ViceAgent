import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

const HealthScoreTrendChart = ({ reports }) => {
    // Process and sort data
    const chartData = useMemo(() => {
        if (!reports || reports.length === 0) return [];

        // Sort by date and take last 15 points
        const sorted = [...reports]
            .filter(r => r.health_score !== null && r.health_score !== undefined)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .slice(-15);

        return sorted.map(r => ({
            score: r.health_score,
            date: new Date(r.created_at),
            timestamp: r.created_at
        }));
    }, [reports]);

    if (chartData.length === 0) {
        return (
            <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[300px]">
                <TrendingUp size={48} className="text-slate-300 mb-4" />
                <p className="text-slate-400 font-semibold">No health score data available yet</p>
                <p className="text-slate-400 text-sm mt-2">Data will appear once scans are completed</p>
            </div>
        );
    }

    // Chart dimensions
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Scales
    const maxScore = 100;
    const minScore = 0;
    const xStep = chartWidth / (chartData.length - 1);

    const getX = (index) => padding.left + index * xStep;
    const getY = (score) => padding.top + chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;

    // Generate path
    const linePath = chartData.map((point, i) => {
        const x = getX(i);
        const y = getY(point.score);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    // Generate area path for gradient fill
    const areaPath = `${linePath} L ${getX(chartData.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

    // Format date for labels
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Calculate average score
    const avgScore = (chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length).toFixed(1);

    return (
        <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-slate-700 font-bold text-lg flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" />
                        Health Score Trend
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Last {chartData.length} scans</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold">Average</p>
                    <p className="text-2xl font-black text-blue-600">{avgScore}%</p>
                </div>
            </div>

            <div className="relative w-full overflow-x-auto">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto"
                    style={{ minHeight: '300px' }}
                >
                    <defs>
                        {/* Gradient for area fill */}
                        <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                        </linearGradient>

                        {/* Gradient for line stroke */}
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(score => (
                        <g key={score}>
                            <line
                                x1={padding.left}
                                y1={getY(score)}
                                x2={width - padding.right}
                                y2={getY(score)}
                                stroke="#e2e8f0"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={padding.left - 10}
                                y={getY(score)}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                className="text-xs fill-slate-400 font-semibold"
                            >
                                {score}
                            </text>
                        </g>
                    ))}

                    {/* Area fill */}
                    <path
                        d={areaPath}
                        fill="url(#healthGradient)"
                    />

                    {/* Line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-lg"
                    />

                    {/* Data points */}
                    {chartData.map((point, i) => (
                        <g key={i}>
                            <circle
                                cx={getX(i)}
                                cy={getY(point.score)}
                                r="5"
                                fill="white"
                                stroke={point.score >= 70 ? '#10b981' : point.score >= 40 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="3"
                                className="cursor-pointer hover:r-7 transition-all"
                            >
                                <title>{`${point.score}% - ${formatDate(point.date)}`}</title>
                            </circle>

                            {/* X-axis labels - show every other label to avoid crowding */}
                            {(i === 0 || i === chartData.length - 1 || i % 3 === 0) && (
                                <text
                                    x={getX(i)}
                                    y={height - 10}
                                    textAnchor="middle"
                                    className="text-[10px] fill-slate-400 font-semibold"
                                >
                                    {formatDate(point.date)}
                                </text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-600 font-semibold">Good (70-100)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-slate-600 font-semibold">Fair (40-70)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-600 font-semibold">Poor (&lt;40)</span>
                </div>
            </div>
        </div>
    );
};

export default HealthScoreTrendChart;

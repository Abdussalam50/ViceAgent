import React, { useMemo } from 'react';
import { Folder, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ProjectNavigation = ({ devices, reports, selectedProject, onSelectProject, onUpdateDevice }) => {
    const { t } = useLanguage();

    // Pre-calculate stats for all devices for efficiency
    const projectStats = useMemo(() => {
        const stats = {};

        // Initialize stats for each device
        devices.forEach(device => {
            stats[device.id] = { healthScore: null, scanCount: 0 };
        });

        // Accumulate data from reports
        reports.forEach(report => {
            if (report.project_id && stats[report.project_id]) {
                const s = stats[report.project_id];
                s.scanCount += 1;
                s.healthScore = (s.healthScore === null)
                    ? report.health_score
                    : (s.healthScore * (s.scanCount - 1) + report.health_score) / s.scanCount;
            } else if (report.project?.device_name) {
                // Fallback for reports without direct project_id but matching device_name
                const device = devices.find(d => d.device_name === report.project.device_name);
                if (device) {
                    const s = stats[device.id];
                    s.scanCount += 1;
                    s.healthScore = (s.healthScore === null)
                        ? report.health_score
                        : (s.healthScore * (s.scanCount - 1) + report.health_score) / s.scanCount;
                }
            }
        });

        return stats;
    }, [devices, reports]);

    const getHealthColor = (score) => {
        if (score === null) return 'bg-gray-100 text-gray-400 border-gray-200';
        if (score >= 70) return 'bg-green-50 text-green-600 border-green-200';
        if (score >= 40) return 'bg-yellow-50 text-yellow-600 border-yellow-200';
        return 'bg-red-50 text-red-600 border-red-200';
    };

    return (
        <div className="glass-card p-6 mb-8 border border-white/40">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Folder size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{t('project_selector')}</h3>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                    {devices.length} {t('active_configs')}
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {/* All Projects Option */}
                <button
                    onClick={() => onSelectProject(null)}
                    className={`flex-shrink-0 w-48 p-5 rounded-2xl border-2 transition-all duration-300 group ${selectedProject === null
                        ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200 -translate-y-1'
                        : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                >
                    <div className="flex flex-col h-full justify-between items-start text-left">
                        <div>
                            <p className={`font-black text-base leading-tight ${selectedProject === null ? 'text-white' : 'text-slate-900'}`}>
                                {t('global_overview')}
                            </p>
                            <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${selectedProject === null ? 'text-slate-400' : 'text-slate-400'}`}>
                                {t('all_connected_projects')}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between w-full">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${selectedProject === null ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {reports.length} {t('total_scans')}
                            </span>
                            {selectedProject === null && <ArrowRight size={14} className="text-blue-400" />}
                        </div>
                    </div>
                </button>

                {/* Individual Projects */}
                {devices.map((device) => {
                    const stats = projectStats[device.id] || { healthScore: null, scanCount: 0 };
                    const isSelected = selectedProject === device.id;

                    return (
                        <button
                            key={device.id}
                            onClick={() => onSelectProject(device.id)}
                            className={`flex-shrink-0 w-56 p-5 rounded-2xl border-2 transition-all duration-300 group ${isSelected
                                ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-100 -translate-y-1'
                                : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
                                }`}
                        >
                            <div className="flex flex-col h-full justify-between items-start text-left">
                                <div className="w-full">
                                    <div className="flex justify-between items-start">
                                        <p className={`font-black text-base truncate leading-tight flex-1 mr-2 ${isSelected ? 'text-white' : 'text-slate-900'}`} title={device.project_name || device.device_name}>
                                            {device.project_name || device.device_name}
                                        </p>
                                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={device.is_active !== false}
                                                    onChange={() => onUpdateDevice(device.id, { is_active: device.is_active === false })}
                                                />
                                                <div className={`w-7 h-4 rounded-full peer peer-focus:outline-none transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all ${isSelected
                                                    ? 'bg-blue-800 border border-blue-400 peer-checked:after:translate-x-3'
                                                    : 'bg-slate-200 peer-checked:bg-blue-600 peer-checked:after:translate-x-3'
                                                    }`}></div>
                                            </label>
                                        </div>
                                    </div>
                                    <p className={`text-[9px] font-bold mt-1 uppercase truncate opacity-70 tracking-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {device.target_path || t('no_path_set')}
                                    </p>
                                </div>
                                <div className="mt-6 w-full space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{t('health')}</span>
                                            <span className={`text-xl font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                                {stats.healthScore !== null ? `${stats.healthScore.toFixed(1)}%` : '---'}
                                            </span>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 ${isSelected
                                            ? 'bg-white/10 border-white/20 text-white'
                                            : getHealthColor(stats.healthScore)
                                            }`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white animate-pulse' :
                                                (stats.healthScore >= 70 ? 'bg-green-500' : stats.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500')
                                                }`}></div>
                                            <span className="text-[10px] font-bold">{stats.scanCount} {t('scans')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectNavigation;

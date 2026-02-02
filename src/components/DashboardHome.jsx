import * as React from 'react';
import { supabase } from '../api/supabase';
import { useLanguage } from '../context/LanguageContext';
import HealthScoreTrendChart from './HealthScoreTrendChart';
import ProjectNavigation from './ProjectNavigation';
import { Clock, Terminal, Globe, Loader2, AlertCircle, Sparkles } from 'lucide-react';

const DashboardHome = ({ devices, reports: globalReports, onUpdateDevice, profile }) => {
    const { t } = useLanguage();
    const [selectedProject, setSelectedProject] = React.useState(null);
    const [projectReports, setProjectReports] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    // Filter reports based on selected project

    React.useEffect(() => {
        if (selectedProject === null) {
            setProjectReports([]);
            return;
        }

        const fetchProjectDetails = async () => {
            setLoading(true);
            try {
                const selectedDevice = devices.find(d => d.id === selectedProject);
                if (!selectedDevice) return;

                const { data, error } = await supabase
                    .from('scan_reports')
                    .select('*, project:agent_configs(device_name, project_name)')
                    .eq('project_id', selectedProject)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setProjectReports(data || []);
            } catch (err) {
                console.error("Error fetching project reports:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [selectedProject, devices]);


    const displayReports = selectedProject === null ? globalReports : projectReports;

    const healthScore = React.useMemo(() => {
        if (displayReports.length === 0) return 0;
        return (displayReports.reduce((acc, curr) => acc + curr.health_score, 0) / displayReports.length).toFixed(1);
    }, [displayReports]);

    const totalIssues = React.useMemo(() => {
        return displayReports.reduce((acc, curr) => acc + (curr.details_json?.lint?.length || 0), 0);
    }, [displayReports]);

    const activeProject = React.useMemo(() => {
        if (selectedProject === null) return null;
        return devices.find(d => d.id === selectedProject);
    }, [selectedProject, devices]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Project Navigation */}
            <ProjectNavigation
                devices={devices}
                reports={globalReports}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                onUpdateDevice={onUpdateDevice}
            />

            {/* Context Section */}
            {selectedProject ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest rounded-full shadow-lg shadow-blue-100">
                                        {t('active_project')}
                                    </span>
                                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                                    {activeProject?.project_name || activeProject?.device_name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Terminal size={16} className="text-blue-500" />
                                        <span className="font-mono text-xs">{activeProject?.target_path}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Globe size={16} className="text-indigo-500" />
                                        <span className="capitalize">{activeProject?.language || t('unknown')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="text-slate-400" />
                                        <span>{t('interval')}: {activeProject?.scan_interval}m</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-3">
                                {activeProject?.public_token && (
                                    <button
                                        onClick={() => {
                                            // CEK STATUS PRO
                                            if (!profile?.is_pro) {
                                                alert("Fitur Shareable Badge hanya tersedia untuk akun Pro. Upgrade sekarang untuk memamerkan kualitas kodemu!");
                                                return;
                                            }

                                            const badgeUrl = `https://sbpqvmloztxsiavkfgwg.supabase.co/functions/v1/get-badge?token=${activeProject.public_token}`;
                                            navigator.clipboard.writeText(badgeUrl);
                                            alert(t('badge_copied_msg'));
                                        }}
                                        className={`px-4 py-2 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border flex items-center gap-2 
                                            ${profile?.is_pro
                                                ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-100"
                                                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"}`}
                                    >
                                        <Globe size={14} />
                                        {t('copy_badge_url')}
                                        {!profile?.is_pro && <Sparkles size={10} className="text-amber-500" />}
                                    </button>
                                )}
                                <div className="flex items-center gap-3 bg-slate-50 p-2 pr-4 rounded-2xl border border-slate-100">
                                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={activeProject?.is_active !== false}
                                            onChange={() => onUpdateDevice(activeProject.id, { is_active: activeProject.is_active === false })}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{t('detected_issues')}</p>
                                        <p className={`text-xs font-black uppercase ${activeProject?.is_active !== false ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {activeProject?.is_active !== false ? t('good') : t('poor')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-slate-100 shadow-sm"
                            >
                                {t('back')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-4 py-2 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex items-center gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-bold text-blue-700">{t('all_connected_projects')}</p>
                </div>
            )}

            {loading ? (
                <div className="glass-card p-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">{t('loading')}</p>
                </div>
            ) : displayReports.length === 0 && selectedProject ? (
                <div className="glass-card p-20 flex flex-col items-center justify-center gap-6 text-center border-dashed border-2 border-slate-200 bg-transparent shadow-none">
                    <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                        <AlertCircle size={48} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-slate-800">{t('no_reports')}</h4>
                    </div>
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 group hover:-translate-y-1 transition-all">
                            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Clock size={14} />
                                {selectedProject ? t('total_scans') : t('connected_projects')}
                            </h3>
                            <p className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums">
                                {selectedProject ? displayReports.length : devices.length}
                            </p>
                        </div>

                        <div className="glass-card p-8 border-l-4 border-l-green-500 group hover:-translate-y-1 transition-all shadow-green-50/30 shadow-2xl">
                            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                {selectedProject ? t('health_score_trend') : t('global_health_avg')}
                            </h3>
                            <p className="text-6xl font-black text-green-600 tracking-tighter tabular-nums">{healthScore}%</p>
                        </div>

                        <div className="glass-card p-8 border-l-4 border-l-red-500 group hover:-translate-y-1 transition-all shadow-red-50/30 shadow-2xl">
                            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                                <AlertCircle size={14} className="text-red-500" />
                                {t('detected_issues')}
                            </h3>
                            <p className="text-6xl font-black text-red-600 tracking-tighter tabular-nums">{totalIssues}</p>
                        </div>
                    </section>

                    {/* Health Score Trend Chart */}
                    <div className="glass-card p-2 overflow-hidden shadow-2xl shadow-slate-100">
                        <HealthScoreTrendChart reports={displayReports} />
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardHome;

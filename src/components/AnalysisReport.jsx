import * as React from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { AlertTriangle, CheckCircle, Code, BarChart3, Clock, Search, Loader2, FileText, ChevronLeft, ChevronRight, FileCode, XCircle, Zap, Terminal, Info } from 'lucide-react';
import { callMyAiApi } from '../api/ai';
import AISuggestModal from './AISuggestModal';
import MetricGuide from './MetricGuide';
import JSReportViewer from './JSReportViewer';
import { useLanguage } from '../context/LanguageContext';

const AnalysisReport = () => {
    const { profile: initialProfile } = useOutletContext();
    const [profile, setProfile] = React.useState(initialProfile);
    const { t } = useLanguage();

    // 1. Core State
    const [devices, setDevices] = React.useState([]);
    const [selectedDevice, setSelectedDevice] = React.useState(null);
    const [reports, setReports] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [loadingReports, setLoadingReports] = React.useState(false);
    const [selectedReport, setSelectedReport] = React.useState(null);
    const [fileAnalysis, setFileAnalysis] = React.useState({ loading: false, result: null, fileName: '' });

    // Pagination State
    const [page, setPage] = React.useState(0);
    const [totalCount, setTotalCount] = React.useState(0);
    const ITEMS_PER_PAGE = 6;

    const totalPages = React.useMemo(() => Math.ceil(totalCount / ITEMS_PER_PAGE), [totalCount]);

    // ========== FUNGSI NORMALISASI DATA ==========

    // Fungsi universal untuk menormalisasi data kompleksitas SEMUA FORMAT
    const normalizeComplexityData = (complexityData) => {
        if (!complexityData || typeof complexityData !== 'object') {
            return {};
        }
        
        const normalized = {};
        
        // Format 1: JavaScript report baru - { "file.tsx": { "functions": [...], "aggregate": {...} } }
        if (!Array.isArray(complexityData)) {
            Object.entries(complexityData).forEach(([filePath, fileData]) => {
                if (fileData && typeof fileData === 'object') {
                    let functionsArray = [];
                    
                    // Format JavaScript baru: fileData.functions
                    if (fileData.functions && Array.isArray(fileData.functions)) {
                        functionsArray = fileData.functions.map((func, index) => ({
                            id: `${filePath}-${index}`,
                            name: func.name || `Function at line ${func.lineno || func.line || 0}`,
                            complexity: func.complexity || 1,
                            rank: func.rank || 'A',
                            type: func.type || 'function',
                            line: func.lineno || func.line || 0,
                            isHighComplexity: func.complexity > 5, // Flag untuk complexity tinggi
                            filePath: filePath
                        }));
                    } 
                    // Format Python: fileData langsung array
                    else if (Array.isArray(fileData)) {
                        functionsArray = fileData.filter(item => 
                            item.type === 'function' || item.type === 'method' || item.type === 'class'
                        ).map((item, index) => ({
                            id: `${filePath}-${index}`,
                            name: item.name || 'anonymous',
                            complexity: item.complexity || 1,
                            rank: item.rank || 'A',
                            type: item.type,
                            line: item.lineno || item.line || 0,
                            isHighComplexity: item.complexity > 5,
                            filePath: filePath
                        }));
                    }
                    
                    if (functionsArray.length > 0) {
                        const fileName = filePath.split(/[\\/]/).pop();
                        normalized[fileName] = {
                            fileName: fileName,
                            fullPath: filePath,
                            functions: functionsArray,
                            totalFunctions: functionsArray.length,
                            averageComplexity: functionsArray.reduce((sum, f) => sum + f.complexity, 0) / functionsArray.length,
                            maxComplexity: Math.max(...functionsArray.map(f => f.complexity)),
                            highComplexityFunctions: functionsArray.filter(f => f.complexity > 5).length
                        };
                    }
                }
            });
            return normalized;
        }
        
        // Format lama dengan raw_data (backward compatibility)
        if (complexityData.raw_data) {
            Object.entries(complexityData.raw_data).forEach(([filePath, items]) => {
                if (Array.isArray(items)) {
                    const functions = items.filter(item => 
                        item.type === 'function' || item.type === 'method'
                    ).map((item, index) => ({
                        id: `${filePath}-${index}`,
                        name: item.name || 'anonymous',
                        complexity: item.complexity || 1,
                        rank: item.rank || 'A',
                        type: item.type,
                        line: item.lineno || 0,
                        isHighComplexity: item.complexity > 5,
                        filePath: filePath
                    }));
                    
                    if (functions.length > 0) {
                        const fileName = filePath.split(/[\\/]/).pop();
                        normalized[fileName] = {
                            fileName: fileName,
                            fullPath: filePath,
                            functions: functions,
                            totalFunctions: functions.length,
                            averageComplexity: functions.reduce((sum, f) => sum + f.complexity, 0) / functions.length,
                            maxComplexity: Math.max(...functions.map(f => f.complexity)),
                            highComplexityFunctions: functions.filter(f => f.complexity > 5).length
                        };
                    }
                }
            });
        }
        
        return normalized;
    };

    // Fungsi untuk menormalisasi data lint Python (menampilkan semua error/warning per file)
    const normalizePythonLintData = (lintData) => {
        if (!lintData || !Array.isArray(lintData)) {
            return [];
        }
        
        // Group errors by file
        const errorsByFile = {};
        
        lintData.forEach((error, index) => {
            if (!error.path) return;
            
            const filePath = error.path;
            if (!errorsByFile[filePath]) {
                errorsByFile[filePath] = {
                    filePath: filePath,
                    fileName: filePath.split(/[\\/]/).pop(),
                    messages: [],
                    errorCount: 0,
                    warningCount: 0,
                    totalIssues: 0,
                    source: null
                };
            }
            
            const isError = error.type === 'error';
            const severity = isError ? 2 : 1;
            const message = {
                id: `${filePath}-${index}`,
                ruleId: error.symbol || error['message-id'] || 'unknown',
                severity: severity,
                message: error.message || 'Unknown error',
                line: error.line || 1,
                column: error.column || 0,
                endLine: error.endLine || error.line || 1,
                endColumn: error.endColumn || error.column || 0,
                nodeType: null,
                type: error.type || (isError ? 'error' : 'warning'),
                module: error.module || 'unknown',
                symbol: error.symbol || 'unknown'
            };
            
            errorsByFile[filePath].messages.push(message);
            errorsByFile[filePath].totalIssues++;
            
            if (isError) {
                errorsByFile[filePath].errorCount++;
            } else {
                errorsByFile[filePath].warningCount++;
            }
        });
        
        // Convert to array format dan sort by file name
        return Object.values(errorsByFile).sort((a, b) => 
            a.fileName.localeCompare(b.fileName)
        );
    };

    // 2. Initial Fetch: Devices
    React.useEffect(() => {
        const fetchDevices = async () => {
            try {
                const { data, error } = await supabase
                    .from('agent_configs')
                    .select('id, device_name, created_at, project_name, is_active')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const { data: reportCounts } = await supabase.from('scan_reports').select('project_id');
                const countsMap = {};
                reportCounts?.forEach(r => {
                    if (r.project_id) countsMap[r.project_id] = (countsMap[r.project_id] || 0) + 1;
                });

                const mapped = data.map(d => ({
                    id: d.id,
                    name: d.project_name,
                    count: countsMap[d.id] || 0,
                    lastScan: d.created_at,
                    isActive: d.is_active !== false
                }));

                setDevices(mapped);

                if (mapped.length === 1) {
                    setSelectedDevice(mapped[0].id);
                }
            } catch (err) {
                console.error("Device Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, []);

    // 3. Main Fetch: Reports
    const fetchReports = React.useCallback(async (deviceId, pageNum) => {
        if (!deviceId) return;
        setLoadingReports(true);

        const from = pageNum * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        try {
            const { data, error, count } = await supabase
                .from('scan_reports')
                .select('*', { count: 'exact' })
                .eq('project_id', deviceId)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            setReports(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            console.error("Report Fetch Failed:", err);
        } finally {
            setLoadingReports(false);
        }
    }, [ITEMS_PER_PAGE]);

    React.useEffect(() => {
        if (selectedDevice) {
            fetchReports(selectedDevice, page);
        }
    }, [selectedDevice, page, fetchReports]);

    // 4. Filtering
    const filteredReports = React.useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return reports.filter(r => {
            const dateStr = new Date(r.created_at).toLocaleString().toLowerCase();
            const healthStr = r.health_score?.toString() || '';
            const detailsStr = JSON.stringify(r.details_json).toLowerCase();
            return dateStr.includes(lowerSearch) || healthStr.includes(lowerSearch) || detailsStr.includes(lowerSearch);
        });
    }, [reports, searchTerm]);
     console.log(filteredReports);
    // 5. Scan Toggle Handler
    const handleToggleScan = async (e, deviceId, currentStatus) => {
        e.stopPropagation();
        const newStatus = !currentStatus;
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, isActive: newStatus } : d));

        try {
            const { error } = await supabase
                .from('agent_configs')
                .update({ is_active: newStatus })
                .eq('id', deviceId);

            if (error) throw error;
        } catch (err) {
            console.error("Failed to update scan status:", err);
            setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, isActive: currentStatus } : d));
        }
    };

    // 6. AI Support
    const handleAIAnalysis = async (fileName, data, type = 'lint') => {
        if (!profile) return;
        const limit = profile.is_pro ? 50 : 10;
        const currentCount = profile.ai_usage_count || 0;
        const lastUse = profile.last_ai_use;
        const today = new Date().toISOString().split('T')[0];

        let finalCount = currentCount;
        if (lastUse !== today) finalCount = 0;

        if (finalCount >= limit) {
            alert(t('daily_ai_limit_reached', { limit }));
            return;
        }

        setFileAnalysis({ loading: true, result: null, fileName });
        
        let combinedContext = '';
        if (type === 'lint') {
            combinedContext = data.messages?.slice(0, 20).map(i => 
                `- Line ${i.line}: [${i.type?.toUpperCase()}] ${i.message} (${i.symbol || i.ruleId})`
            ).join('\n') || 'Tidak ada isu linting';
        } else {
            // type === 'complexity'
            const fileData = data;
            combinedContext = `File: ${fileName}\nTotal Functions: ${fileData.totalFunctions}\nAverage Complexity: ${fileData.averageComplexity.toFixed(2)}\nHigh Complexity Functions (>5): ${fileData.highComplexityFunctions}\n\n`;
            combinedContext += fileData.functions.slice(0, 15).map(f => 
                `- ${f.type === 'class' ? 'Class' : 'Function'} "${f.name}" (Line ${f.line}): Complexity ${f.complexity}, Rank ${f.rank}`
            ).join('\n');
        }

        try {
            const response = await callMyAiApi({
                symbol: type === 'lint' ? "LINT_ISSUES" : "COMPLEXITY_ISSUE",
                message: `Analisis untuk file ${fileName} - ${type === 'lint' ? 'Linting Issues' : 'Complexity Analysis'}`,
                script_context: combinedContext
            });

            const newCount = finalCount + 1;
            const updates = { ai_usage_count: newCount, last_ai_use: today };
            const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', profile.id);

            if (!updateError) setProfile(prev => ({ ...prev, ...updates }));
            setFileAnalysis({ loading: false, result: response.suggestion, fileName });
        } catch (err) {
            setFileAnalysis({ loading: false, result: t('ai_analysis_error'), fileName });
        }
    };

    const handleAskAi = React.useCallback(async (filePath, fileType, message, sourceCode = "") => {
        if (!profile) return;
        const limit = profile.is_pro ? 50 : 10;
        const currentCount = profile.ai_usage_count || 0;
        const lastUse = profile.last_ai_use;
        const today = new Date().toISOString().split('T')[0];

        let finalCount = currentCount;
        if (lastUse !== today) finalCount = 0;

        if (finalCount >= limit) {
            alert(t('daily_ai_limit_reached', { limit }));
            return;
        }

        const fileName = filePath.split(/[\\/]/).pop();
        setFileAnalysis({ loading: true, result: null, fileName });

        try {
            const isComplexity = message.toLowerCase().includes('complexity') || message.toLowerCase().includes('cyclomatic');
            const response = await callMyAiApi({
                symbol: isComplexity ? "COMPLEXITY_ISSUE" : "CODE_ERROR",
                message: message,
                script_context: sourceCode || "Kode tidak tersedia."
            });

            const newCount = finalCount + 1;
            const updates = { ai_usage_count: newCount, last_ai_use: today };
            const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', profile.id);

            if (!updateError) setProfile(prev => ({ ...prev, ...updates }));
            setFileAnalysis({ loading: false, result: response.suggestion || response, fileName });
        } catch (err) {
            setFileAnalysis({ loading: false, result: t('ai_analysis_error'), fileName });
        }
    }, [profile, t]);

    // Komponen untuk menampilkan Python Lint Errors DETAIL
    const PythonLintViewer = ({ lintData }) => {
        const normalizedData = normalizePythonLintData(lintData);
        
        if (normalizedData.length === 0) {
            return (
                <div className="py-20 text-center bg-green-50/30 rounded-[32px] border border-dashed border-green-200">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4 opacity-70" />
                    <p className="text-green-700 font-black uppercase text-sm tracking-widest mb-2">
                        {t('clean_code')}
                    </p>
                    <p className="text-green-600 text-xs font-bold">
                        {t('no_pylint_issues')}
                    </p>
                </div>
            );
        }

        // Hitung total issues
        const totalErrors = normalizedData.reduce((sum, file) => sum + file.errorCount, 0);
        const totalWarnings = normalizedData.reduce((sum, file) => sum + file.warningCount, 0);
        const totalFiles = normalizedData.length;

        return (
            <div className="space-y-6">
                {/* Summary Stats */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 p-5 rounded-3xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Terminal size={20} className="text-blue-600" />
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                Pylint Analysis Summary
                            </h3>
                        </div>
                        <div className="flex gap-3">
                            {totalErrors > 0 && (
                                <div className="bg-red-50 px-4 py-2 rounded-2xl border border-red-100">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Errors</p>
                                    <p className="text-2xl font-black text-red-600">{totalErrors}</p>
                                </div>
                            )}
                            {totalWarnings > 0 && (
                                <div className="bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100">
                                    <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1">Warnings</p>
                                    <p className="text-2xl font-black text-yellow-600">{totalWarnings}</p>
                                </div>
                            )}
                            <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Files</p>
                                <p className="text-2xl font-black text-blue-600">{totalFiles}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* File-by-File Details */}
                <div className="space-y-6">
                    {normalizedData.map((file, idx) => (
                        <div key={file.filePath} className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/40 transition-all hover:border-blue-200">
                            {/* File Header */}
                            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileCode className="text-blue-500 shrink-0" size={18} />
                                    <div className="min-w-0">
                                        <span className="text-sm font-black text-slate-600 truncate font-mono tracking-tight block">
                                            {file.fileName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold truncate block">
                                            {file.filePath}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        {file.errorCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                                                {file.errorCount} Error{file.errorCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {file.warningCount > 0 && (
                                            <span className="bg-yellow-400 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                                                {file.warningCount} Warning{file.warningCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        <span className="bg-slate-100 text-slate-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                                            {file.totalIssues} Total Issue{file.totalIssues !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Ask AI Button */}
                                    <button
                                        onClick={() => handleAIAnalysis(file.fileName, file, 'lint')}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl transition-all shadow-lg shadow-indigo-100 group"
                                    >
                                        <Zap size={14} fill="currentColor" className="group-hover:animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{t('fix_with_ai')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Messages List - Detail semua line */}
                            <div className="p-6 space-y-3 bg-white max-h-[400px] overflow-y-auto">
                                {file.messages.map((msg, mIdx) => (
                                    <div key={msg.id} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="shrink-0 mt-0.5">
                                            {msg.severity === 2 ? (
                                                <XCircle className="text-red-500" size={20} />
                                            ) : (
                                                <AlertTriangle className="text-yellow-500" size={20} />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-700 leading-tight mb-2">{msg.message}</p>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                        {t('line_label')} {msg.line}
                                                    </span>
                                                    {msg.endLine && msg.endLine !== msg.line && (
                                                        <span className="text-[10px] text-blue-400">to {msg.endLine}</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-slate-400 rounded font-mono font-bold">
                                                    {msg.symbol || msg.ruleId}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${msg.severity === 2 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                    {msg.type?.toUpperCase() || (msg.severity === 2 ? 'ERROR' : 'WARNING')}
                                                </span>
                                                {msg.module && msg.module !== 'unknown' && (
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">
                                                        Module: {msg.module}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Komponen untuk menampilkan Complexity Details DETAIL
    const ComplexityViewer = ({ complexityData, language }) => {
        const normalizedData = normalizeComplexityData(complexityData);
        
        if (Object.keys(normalizedData).length === 0) {
            return (
                <div className="py-20 text-center bg-blue-50/30 rounded-[32px] border border-dashed border-blue-200">
                    <Code size={48} className="text-blue-500 mx-auto mb-4 opacity-70" />
                    <p className="text-blue-700 font-black uppercase text-sm tracking-widest mb-2">
                        {t('logic_optimized')}
                    </p>
                    <p className="text-blue-600 text-xs font-bold">
                        Tidak ada data kompleksitas
                    </p>
                </div>
            );
        }

        // Hitung aggregate stats
        const allFunctions = Object.values(normalizedData).flatMap(file => file.functions);
        const totalFunctions = allFunctions.length;
        const highComplexityCount = allFunctions.filter(f => f.complexity > 5).length;
        const averageComplexity = allFunctions.reduce((sum, f) => sum + f.complexity, 0) / totalFunctions;
        const maxComplexity = Math.max(...allFunctions.map(f => f.complexity));

        return (
            <div className="space-y-6">
                {/* Summary Stats */}
                {/* <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 p-5 rounded-3xl border border-slate-100">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={20} className="text-blue-600" />
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                {language === 'python' ? 'Python' : 'JavaScript'} Complexity Analysis
                            </h3>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Functions</p>
                                <p className="text-2xl font-black text-blue-600">{totalFunctions}</p>
                            </div>
                            <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
                                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Avg Complexity</p>
                                <p className="text-2xl font-black text-green-600">{averageComplexity.toFixed(1)}</p>
                            </div>
                            <div className="bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">High Complexity</p>
                                <p className="text-2xl font-black text-orange-600">{highComplexityCount}</p>
                            </div>
                            <div className="bg-red-50 px-4 py-2 rounded-2xl border border-red-100">
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Max Complexity</p>
                                <p className="text-2xl font-black text-red-600">{maxComplexity}</p>
                            </div>
                        </div>
                    </div> 
                </div> */}

                {/* File-by-File Details */}
                <div className="space-y-6">
                    {Object.entries(normalizedData).map(([fileName, fileData]) => (
                        <div key={fileName} className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/40 transition-all hover:border-blue-200">
                            {/* File Header */}
                            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileCode className="text-blue-500 shrink-0" size={18} />
                                    <div className="min-w-0">
                                        <span className="text-sm font-black text-slate-600 truncate font-mono tracking-tight block">
                                            {fileName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold truncate block">
                                            {fileData.fullPath}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        {/* <span className="bg-blue-100 text-blue-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                                            {fileData.totalFunctions} Function{fileData.totalFunctions !== 1 ? 's' : ''}
                                        </span> */}
                                        <span className="bg-green-100 text-green-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                                            Avg: {fileData.averageComplexity.toFixed(1)}
                                        </span>
                                        {fileData.highComplexityFunctions > 0 && (
                                            <span className="bg-red-100 text-red-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                                                {fileData.highComplexityFunctions} High
                                            </span>
                                        )}
                                    </div>

                                    {/* Ask AI Button */}
                                    <button
                                        onClick={() => handleAIAnalysis(fileName, fileData, 'complexity')}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl transition-all shadow-lg shadow-indigo-100 group"
                                    >
                                        <Zap size={14} fill="currentColor" className="group-hover:animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{t('ai_refactor')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Functions List - Detail semua function */}
                            <div className="p-6 space-y-3 bg-white max-h-[400px] overflow-y-auto">
                                {fileData.functions.map((func, fIdx) => (
                                    <div key={func.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${func.isHighComplexity ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-black text-slate-700 truncate">
                                                    {func.type === 'class' ? `class ${func.name}` : 
                                                     func.name.includes('Line ') ? `Function at ${func.name}` : 
                                                     `${func.name}()`}
                                                </p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${func.type === 'class' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {func.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                    Line {func.line}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-slate-400 rounded font-bold">
                                                    Complexity: {func.complexity}
                                                </span>
                                                {func.isHighComplexity && (
                                                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-black">
                                                        HIGH COMPLEXITY
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-md ${func.rank === 'A' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                                                                     func.rank === 'B' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                                                                     func.rank === 'C' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                                                                                     'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {func.rank}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ... (bagian devices dan header tetap sama) ... */}
            <section className="bg-white/80 backdrop-blur-md p-6 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('active_project')}</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                        />
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                    {devices.map(dev => (
                        <div key={dev.id} className="relative shrink-0 min-w-[220px]">
                            <button
                                onClick={() => {
                                    setSelectedDevice(dev.id);
                                    setPage(0);
                                }}
                                className={`w-full p-5 rounded-[28px] border-2 transition-all text-left snap-start group relative ${selectedDevice === dev.id
                                    ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100'
                                    : 'border-slate-50 bg-white hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2.5 rounded-xl transition-colors ${selectedDevice === dev.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${selectedDevice === dev.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {dev.count} {t('nav_reports').toUpperCase()}
                                        </span>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${dev.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                                                {dev.isActive ? t('good') : t('poor')}
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={dev.isActive}
                                                    onChange={(e) => handleToggleScan(e, dev.id, dev.isActive)}
                                                />
                                                <div className={`w-7 h-4 rounded-full peer peer-focus:outline-none transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all ${selectedDevice === dev.id
                                                    ? 'bg-blue-800 border border-blue-400 peer-checked:after:translate-x-3'
                                                    : 'bg-slate-200 peer-checked:bg-blue-600 peer-checked:after:translate-x-3'
                                                    }`}></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <p className={`font-black tracking-tight ${selectedDevice === dev.id ? 'text-blue-700' : 'text-slate-800'}`}>{dev.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-none">{t('last_scan')}: {new Date(dev.lastScan).toLocaleDateString()}</p>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {selectedDevice && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <MetricGuide />
                </div>
            )}

            {loadingReports ? (
                <div className="py-20 text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                    <p className="text-slate-400 font-bold mt-4 text-[10px] uppercase tracking-widest">{t('loading')}</p>
                </div>
            ) : filteredReports.length > 0 ? (
               
                <div className="space-y-10">
                    {filteredReports.map((report) => {
                        // Deteksi jenis report
                        const isPythonReport = report.language == 'python' || 
                            (report.details_json?.lint && 
                             Array.isArray(report.details_json.lint) && 
                             report.details_json.lint[0] && 
                             report.details_json.lint[0].path);
                        
                        const isJSReport = report.language == 'javascript' || 
                            (report.details_json?.lint && 
                             Array.isArray(report.details_json.lint) && 
                             report.details_json.lint[0] && 
                             report.details_json.lint[0].filePath);
                        
                        const language = isPythonReport ? 'python' : 'javascript';

                        return (
                            <div key={report.id} className="bg-white rounded-[48px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-100/30 group/card transition-all hover:shadow-blue-100/50">
                                <div className="p-8 bg-gradient-to-r from-slate-50 to-white/0 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-white rounded-3xl shadow-lg shadow-slate-100 group-hover/card:scale-110 transition-transform">
                                            <Clock size={24} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{t('last_scan')}</h3>
                                            <p className="text-slate-900 font-black text-2xl tracking-tighter">
                                                {new Date(report.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-white px-8 py-5 rounded-[32px] shadow-sm border border-slate-50 text-center min-w-[140px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Health</p>
                                            <p className={`text-4xl font-black tracking-tighter ${report.health_score > 70 ? 'text-green-600' : report.health_score > 40 ? 'text-orange-500' : 'text-red-500'}`}>
                                                {report.health_score}%
                                            </p>
                                        </div>
                                        <div className="bg-white px-8 py-5 rounded-[32px] shadow-sm border border-slate-50 text-center min-w-[140px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('complexity')}</p>
                                            <p className="text-4xl font-black text-blue-600 tracking-tighter">
                                                {report.complexity_score || report.summary?.complexity_score || 'N/A'}
                                            </p>
                                        </div>
                                        {/* <div className="bg-white px-8 py-5 rounded-[32px] shadow-sm border border-slate-50 text-center min-w-[140px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Errors</p>
                                            <p className="text-4xl font-black text-red-500 tracking-tighter">
                                                {report.total_errors || report.summary?.total_errors || 0}
                                            </p>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* LINTING SECTION */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 font-black text-slate-700 uppercase tracking-[0.1em] text-xs">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <AlertTriangle size={16} />
                                            </div>
                                            {t('linting')} ({isPythonReport ? 'Pylint' : 'ESLint'})
                                        </div>

                                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 thin-scrollbar">
                                            {isPythonReport ? (
                                                <PythonLintViewer lintData={report.details_json?.lint} />
                                            ) : isJSReport ? (
                                                report.details_json?.lint && report.details_json.lint.length > 0 ? (
                                                    <JSReportViewer
                                                        lintData={report.details_json.lint}
                                                        onAskAi={handleAskAi}
                                                    />
                                                ) : (
                                                    <div className="py-20 text-center bg-green-50/30 rounded-[32px] border border-dashed border-green-200">
                                                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4 opacity-70" />
                                                        <p className="text-green-700 font-black uppercase text-sm tracking-widest mb-2">
                                                            {t('clean_js_arch')}
                                                        </p>
                                                        <p className="text-green-600 text-xs font-bold">
                                                            {t('no_eslint_issues')}
                                                        </p>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="py-20 text-center bg-green-50/30 rounded-[32px] border border-dashed border-green-200">
                                                    <CheckCircle size={40} className="text-green-500 mx-auto mb-2 opacity-40" />
                                                    <p className="text-green-700 font-black uppercase text-[10px] tracking-widest">
                                                        {t('clean_code')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* COMPLEXITY SECTION */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 font-black text-slate-700 uppercase tracking-[0.1em] text-xs">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <BarChart3 size={16} />
                                            </div>
                                            {t('complexity')} ({isPythonReport ? 'Python' : 'JavaScript'})
                                        </div>

                                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 thin-scrollbar">
                                            <ComplexityViewer 
                                                complexityData={report.details_json?.complexity || {}} 
                                                language={language}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {totalPages > 1 && (
                        <div className="flex flex-col items-center gap-6 py-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-6 py-3 bg-white rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all"
                                >
                                    <ChevronLeft size={16} className="mr-1 inline" /> {t('back')}
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-6 py-3 bg-white rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all"
                                >
                                    {t('next')} <ChevronRight size={16} className="ml-1 inline" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : selectedDevice ? (
                <div className="p-24 text-center bg-white rounded-[56px] border-4 border-dashed border-slate-100">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t('no_reports')}</h3>
                </div>
            ) : (
                <div className="p-24 text-center bg-blue-50/30 rounded-[56px] border-4 border-dashed border-blue-100">
                    <h3 className="text-2xl font-black text-blue-800 tracking-tight underline decoration-blue-200 underline-offset-8">{t('select_arch_hint')}</h3>
                </div>
            )}

            {fileAnalysis.result || fileAnalysis.loading ? (
                <AISuggestModal
                    analysis={fileAnalysis}
                    onClose={() => setFileAnalysis({ loading: false, result: null, fileName: '' })}
                />
            ) : null}

            <style dangerouslySetInnerHTML={{
                __html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .thin-scrollbar::-webkit-scrollbar { width: 6px; }
            .thin-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}} />
        </div>
    );
};

export default AnalysisReport;
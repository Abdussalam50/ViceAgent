import React from 'react';
import { Monitor, FileText, Calendar, ArrowRight } from 'lucide-react';

const DeviceCard = ({ device, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden active:scale-95"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Monitor size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                            {device.name}
                        </h3>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Active Device</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 transition-colors group-hover:bg-white">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <FileText size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Reports</span>
                        </div>
                        <p className="font-black text-slate-800 text-xl">{device.count}</p>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 transition-colors group-hover:bg-white">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Last Scan</span>
                        </div>
                        <p className="text-xs font-black text-slate-800 truncate">
                            {new Date(device.lastScan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span className="text-[10px] font-black uppercase tracking-widest">View Laporan</span>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    );
};

export default DeviceCard;

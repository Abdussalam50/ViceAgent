import React from 'react';
import { Info } from 'lucide-react';

const MetricGuide = () => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Info size={18} />
                </div>
                <h3>Metrik & Standar Kualitas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Health Score</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Persentase kesehatan kode. Dihitung dari rasio baris kode bersih terhadap total issue.
                        <span className="block mt-1 text-slate-400 font-normal">Target: &gt; 80% (Sehat)</span>
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Complexity Rank</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Cyclomatic Complexity per fungsi.
                        <span className="inline-flex gap-2 ml-1">
                            <b className="text-green-600">A/B: Oke</b>
                            <b className="text-orange-500">C: Warning</b>
                            <b className="text-red-600">D/F: Refactor!</b>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MetricGuide;


import React, { useState } from 'react';
import { RespondentGroup } from '../types';

interface Props {
  onClose: () => void;
  onSave: (respondent: RespondentGroup) => void;
}

const RespondentModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [samplingMethod, setSamplingMethod] = useState('');

  const samplingOptions = [
    'Simple Random Sampling',
    'Stratified Random Sampling',
    'Cluster Sampling',
    'Systematic Sampling',
    'Purposive Sampling',
    'Snowball Sampling',
    'Quota Sampling',
    'Accidental/Convenience Sampling'
  ];

  const handleSave = () => {
    if (!name.trim() || !samplingMethod.trim()) return;

    onSave({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      samplingMethod: samplingMethod.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tambah Target Responden</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nama Kelompok Responden</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="Contoh: Mahasiswa Tingkat Akhir"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Metode Sampling</label>
            <div className="relative">
              <select
                value={samplingMethod}
                onChange={(e) => setSamplingMethod(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none text-slate-900 dark:text-white"
              >
                <option value="">Pilih Metode Sampling...</option>
                {samplingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="Lainnya">Lainnya (Input Manual)</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-3.5 text-slate-400 pointer-events-none"></i>
            </div>
          </div>

          {samplingMethod === 'Lainnya' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Input Metode Manual</label>
              <input
                type="text"
                onChange={(e) => setSamplingMethod(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
                placeholder="Sebutkan metode lainnya..."
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex space-x-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !samplingMethod.trim() || samplingMethod === 'Lainnya'}
            className="flex-1 px-4 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespondentModal;

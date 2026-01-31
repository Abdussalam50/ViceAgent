
import React, { useState, useEffect } from 'react';
import { DevPath } from '../types';

interface Props {
  onClose: () => void;
  onSave: (path: DevPath) => void;
}

const DevelopmentPathModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [stage, setStage] = useState<'Analyze' | 'Design' | 'Development' | ''>('');
  const [instrument, setInstrument] = useState('');

  const designInstruments = [
    'Validasi Ahli Materi dan Media',
    'Uji Blackbox',
    'Uji Whitebox'
  ];

  const developmentInstruments = [
    'Respon Pengguna',
    'Uji Fungsionalitas'
  ];

  useEffect(() => {
    if (stage === 'Analyze') {
      setInstrument('Analisis Kebutuhan');
    } else {
      setInstrument('');
    }
  }, [stage]);

  const handleSave = () => {
    if (!stage || !instrument) return;

    onSave({
      id: Math.random().toString(36).substr(2, 9),
      stage: stage as any,
      instrument: instrument
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slideUp border border-slate-100 dark:border-slate-700">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-violet-50/50 dark:bg-violet-900/10">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tambah Jalur Pengembangan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tahap Pengembangan</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all appearance-none text-slate-900 dark:text-white"
            >
              <option value="">Pilih Tahap...</option>
              <option value="Analyze">Analyze</option>
              <option value="Design">Design</option>
              <option value="Development">Development</option>
            </select>
          </div>

          {stage === 'Analyze' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Instrumen Terpilih</label>
              <div className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                Analisis Kebutuhan
              </div>
            </div>
          )}

          {stage === 'Design' && (
            <div className="animate-fadeIn space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pilih Salah Satu Instrumen</label>
              {designInstruments.map((opt) => (
                <label key={opt} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${instrument === opt ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <input
                    type="radio"
                    name="designInstrument"
                    value={opt}
                    checked={instrument === opt}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-500"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {stage === 'Development' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pilih Instrumen Pengembangan</label>
              <div className="relative">
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all appearance-none text-slate-900 dark:text-white"
                >
                  <option value="">Pilih Instrumen...</option>
                  {developmentInstruments.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-3.5 text-slate-400 pointer-events-none"></i>
              </div>
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
            disabled={!stage || !instrument}
            className="flex-1 px-4 py-3 bg-violet-600 dark:bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors shadow-lg shadow-violet-100 dark:shadow-none disabled:opacity-50"
          >
            Simpan Jalur
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentPathModal;

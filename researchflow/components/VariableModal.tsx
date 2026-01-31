
import React, { useState } from 'react';
import { ResearchVariable, VariableIndicator } from '../types';

interface Props {
  onClose: () => void;
  onSave: (variable: ResearchVariable) => void;
  title?: string;
}

const VariableModal: React.FC<Props> = ({ onClose, onSave, title = "Tambah Variabel Baru" }) => {
  const [variableName, setVariableName] = useState('');
  const [indicators, setIndicators] = useState<string[]>(['']);

  const addIndicatorField = () => {
    setIndicators(prev => [...prev, '']);
  };

  const updateIndicator = (index: number, value: string) => {
    const newIndicators = [...indicators];
    newIndicators[index] = value;
    setIndicators(newIndicators);
  };

  const removeIndicator = (index: number) => {
    if (indicators.length > 1) {
      setIndicators(indicators.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    if (!variableName.trim()) return;

    const validIndicators: VariableIndicator[] = indicators
      .filter(t => t.trim())
      .map(t => ({
        id: Math.random().toString(36).substr(2, 9),
        text: t.trim()
      }));

    if (validIndicators.length === 0) return;

    onSave({
      id: Math.random().toString(36).substr(2, 9),
      name: variableName,
      indicators: validIndicators
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-700">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/10">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {title.includes('Produk') ? 'Nama Produk/Komponen' : 'Nama Variabel'}
            </label>
            <input
              type="text"
              autoFocus
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400"
              placeholder={title.includes('Produk') ? "Contoh: Modul Pembelajaran Digital" : "Contoh: Kualitas Pelayanan (X1)"}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {title.includes('Produk') ? 'Fitur / Spesifikasi' : 'Butir Indikator'}
              </label>
              <button
                onClick={addIndicatorField}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
              >
                <i className="fas fa-plus-circle mr-1"></i>
                Tambah Baris
              </button>
            </div>

            <div className="space-y-3">
              {indicators.map((ind, idx) => (
                <div key={idx} className="flex space-x-2 group">
                  <div className="w-8 h-10 flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold text-sm bg-slate-50 dark:bg-slate-900 rounded-lg">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={ind}
                    onChange={(e) => updateIndicator(idx, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white"
                    placeholder={`Butir ke-${idx + 1}...`}
                  />
                  {indicators.length > 1 && (
                    <button
                      onClick={() => removeIndicator(idx)}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-2"
                    >
                      <i className="fas fa-minus-circle"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
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
            disabled={!variableName.trim()}
            className="flex-1 px-4 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariableModal;

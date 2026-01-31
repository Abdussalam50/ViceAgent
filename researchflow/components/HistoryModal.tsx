
import React from 'react';
import { HistoryItem } from '../types';

interface Props {
  history: HistoryItem[];
  onClose: () => void;
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryModal: React.FC<Props> = ({ history, onClose, onSelectItem, onClearHistory }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slideUp border border-slate-100 dark:border-slate-700">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Riwayat Penelitian</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar instrumen yang telah dihasilkan</p>
          </div>
          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                Hapus Semua
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
              <i className="fas fa-history text-5xl mb-4 opacity-20"></i>
              <p className="text-sm">Belum ada riwayat aktivitas.</p>

            </div>
          ) : (
            history.slice().reverse().map((item) => (
              <div
                key={item.id}
                className="group border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer relative"
                onClick={() => onSelectItem(item)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${item.type === 'experiment' ? 'bg-indigo-500' : 'bg-violet-500'}`}></span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1 pr-10">{item.title}</h4>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{formatDate(item.timestamp)}</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                  "{truncate(item.prompt.replace(/\s+/g, ' '), 120)}"
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                    {item.type}
                  </span>
                  <div className="text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center group-hover:translate-x-1 transition-transform">
                    Lihat Hasil <i className="fas fa-arrow-right ml-1.5 text-[10px]"></i>
                  </div>
                            {/* TODO: Susunannya dalam bentuk list yang tiap listnya berisi judul angket/penelitian, 
              tanggal bikin, link google form dan button detail */}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Data riwayat disimpan secara lokal di peramban Anda.</p>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;

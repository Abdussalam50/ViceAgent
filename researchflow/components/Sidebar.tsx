
import React from 'react';

interface Props {
  onHistoryClick: () => void;
  onPreviewClick: () => void;
  historyCount: number;
  onClose: () => void;
}

const Sidebar: React.FC<Props> = ({ onHistoryClick, onPreviewClick, historyCount, onClose }) => {
  const menuItems = [
    { icon: 'fa-history', label: 'Activity Logs', count: historyCount, action: onHistoryClick },
    { icon: 'fa-eye', label: 'Result Preview', count: null, action: onPreviewClick },
    { icon: 'fa-bookmark', label: 'Saved Drafts', count: 3, action: () => { } },
    { icon: 'fa-cog', label: 'User Settings', count: null, action: () => { } },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 h-full flex flex-col border-r border-slate-800 shadow-2xl lg:shadow-none">
      <div className="p-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <i className="fas fa-terminal text-white"></i>
            </div>
            <span className="bg-gradient-to-r font-bold from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Gen<span className="text-orange-500 uppercase"><i className="fas fa-search"></i></span> AI</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>

        <nav className="space-y-1">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Navigation</p>
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-indigo-600/10 hover:text-white transition-all group relative overflow-hidden active:scale-95"
            >
              <div className="flex items-center gap-4 relative z-10">
                <i className={`fas ${item.icon} text-slate-500 group-hover:text-indigo-400 transition-colors w-5 text-center`}></i>
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              {item.count !== null && (
                <span className="relative z-10 text-[10px] bg-slate-800 px-2.5 py-1 rounded-lg text-slate-400 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 border border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Workspace Load</p>
            <span className="text-[10px] font-bold text-slate-500">42%</span>
          </div>
          <div className="h-2 w-full bg-slate-700/50 rounded-full mb-4 overflow-hidden">
            <div className="h-full w-[42%] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)]"></div>
          </div>
          <button className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            Upgrade Space
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

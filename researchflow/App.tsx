
import React, { useState, useEffect } from 'react';
import { TabType, HistoryItem } from './types';
import Sidebar from './components/Sidebar';
// import Navbar from './components/Navbar';
import ResearchContainer from './components/ResearchContainer';
import HistoryModal from './components/HistoryModal';
import ResultContainer from './components/OutputContainer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('experiment');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('research_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('research_history', JSON.stringify(newHistory));
  };

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    const updatedHistory = [...history, newItem];
    saveHistory(updatedHistory);
  };

  const clearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh riwayat?")) {
      saveHistory([]);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveTab(item.type);
    setSelectedHistoryItem(item);
    setIsHistoryOpen(false);
    setIsSidebarOpen(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          onHistoryClick={() => { setIsHistoryOpen(true); setIsSidebarOpen(false); }}
          onPreviewClick={() => { setActiveTab('preview'); setIsSidebarOpen(false); }}
          historyCount={history.length}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onMenuClick={() => setIsSidebarOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Simple Tab Bar */}
            <div className="flex space-x-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit mb-8">
              <button
                onClick={() => { setActiveTab('experiment'); setSelectedHistoryItem(null); }}
                className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'experiment'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                Experiment
              </button>
              <button
                onClick={() => { setActiveTab('rnd'); setSelectedHistoryItem(null); }}
                className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'rnd'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                R&D
              </button>
            </div>

            {activeTab === 'preview' ? (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Component Preview</h2>
                <ResultContainer
                  item={{
                    id: 'preview-id',
                    title: 'Sample Research Project',
                    reference: 'Reference: 2024, Reliability: 0.85',
                    result: 'This is a sample generated output to demonstrate how the ResultContainer component looks within the application layout.',
                    formUrl:'formUrl',
                    type: 'experiment'
                  }}
                />
              </div>
            ) : (
              <ResearchContaine
                key={activeTab}
                type={activeTab}
                onSaveHistory={addToHistory}
                selectedHistoryItem={selectedHistoryItem}
              />
            )}
          </div>
        </main>
      </div>

      {isHistoryOpen && (
        <HistoryModal
          history={history}
          onClose={() => setIsHistoryOpen(false)}
          onSelectItem={handleSelectHistoryItem}
          onClearHistory={clearHistory}
        />
      )}
    </div>
  );
};

export default App;

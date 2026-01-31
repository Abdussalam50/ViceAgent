
import React, { useState, useEffect } from 'react';
import { TabType, ResearchMethod, ResearchData, ResearchVariable, RespondentGroup, DevPath, HistoryItem } from '../types';
import VariableModal from './VariableModal';
import RespondentModal from './RespondentModal';
import DevelopmentPathModal from './DevelopmentPathModal';
import ResultContainer from './OutputContainer';


interface Props {
  type: TabType;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  selectedHistoryItem?: HistoryItem | null;
}

const ResearchContainer: React.FC<Props> = ({ type, onSaveHistory, selectedHistoryItem }) => {
  const [formData, setFormData] = useState<ResearchData>({
    title: '',
    method: ResearchMethod.QUANTITATIVE,
    refYearLimit: '2020',
    cronbachAlpha: '0.7',
    targetRespondents: [],
    variables: [],
    devModel: '',
    devPaths: []
  });

  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [isRespondentModalOpen, setIsRespondentModalOpen] = useState(false);
  const [isDevPathModalOpen, setIsDevPathModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  useEffect(() => {
    if (selectedHistoryItem) {
      setGeneratedResult(selectedHistoryItem.result);
      setFormData(prev => ({ ...prev, title: selectedHistoryItem.title }));
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedHistoryItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addRespondentGroup = (group: RespondentGroup) => {
    setFormData(prev => ({
      ...prev,
      targetRespondents: [...prev.targetRespondents, group]
    }));
  };

  const removeRespondentGroup = (id: string) => {
    setFormData(prev => ({
      ...prev,
      targetRespondents: prev.targetRespondents.filter(r => r.id !== id)
    }));
  };

  const addVariable = (variable: ResearchVariable) => {
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, variable]
    }));
  };

  const removeVariable = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v.id !== id)
    }));
  };

  const addDevPath = (path: DevPath) => {
    setFormData(prev => ({
      ...prev,
      devPaths: [...(prev.devPaths || []), path]
    }));
  };

  const removeDevPath = (id: string) => {
    setFormData(prev => ({
      ...prev,
      devPaths: (prev.devPaths || []).filter(p => p.id !== id)
    }));
  };

  const handleGenerate = async () => {
    if (!formData.title) {
      alert("Harap isi judul penelitian.");
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    // TODO: Connect to Python Backend here
    // Replace the logic below with a fetch() call to your backend
    // Example:
    // const response = await fetch('http://localhost:5000/api/generate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     ...formData,
    //     type // 'experiment' or 'rnd'
    //   })
    // });
    // const data = await response.json();
    // const resultText = data.result;

    try {
      // Simulating network latency
      await new Promise(resolve => setTimeout(resolve, 2000));

      const resultText = `
[SIMUALTION MODE]

This is a placeholder result. The direct connection to Google Gemini has been removed as requested.

To enable real AI generation, please connect this frontend to your Python backend.
Data available to send:
- Title: ${formData.title}
- Method: ${formData.method}
- Type: ${type}
- Variables: ${formData.variables.length}
- Target Respondents: ${formData.targetRespondents.length}

(Check various code comments in ResearchContainer.tsx for integration instructions)
      `;

      setGeneratedResult(resultText);

      onSaveHistory({
        title: formData.title,
        prompt: "Backend Simulation",
        result: resultText,
        type: type
      });
    } catch (error) {
      console.error("Generation error:", error);
      alert("Terjadi kesalahan.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Section (Left) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <i className={`fas ${type === 'experiment' ? 'fa-flask' : 'fa-microscope'} mr-3 text-indigo-500`}></i>
            {type === 'experiment' ? 'Experiment Setup' : 'R&D Setup'}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Angket / Penelitian</label>
              <textarea
                name="title"
                rows={2}
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Masukkan judul penelitian..."
              />
            </div>

            {type === 'rnd' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Model Pengembangan</label>
                <input
                  type="text"
                  name="devModel"
                  value={formData.devModel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                  placeholder="Contoh: ADDIE, 4D, Borg & Gall..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenis Penelitian</label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value={ResearchMethod.QUANTITATIVE}>Kuantitatif</option>
                  <option value={ResearchMethod.QUALITATIVE}>Kualitatif</option>
                  <option value={ResearchMethod.MIXED_METHOD}>Mixed Method</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Batas Tahun Referensi</label>
                <input
                  type="number"
                  name="refYearLimit"
                  value={formData.refYearLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Alpha Cronbach Minimal</label>
              <input
                type="number"
                step="0.01"
                name="cronbachAlpha"
                value={formData.cronbachAlpha}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {type === 'rnd' && (
                <button
                  onClick={() => setIsDevPathModalOpen(true)}
                  className="flex items-center justify-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all bg-slate-50 dark:bg-slate-800/50 text-sm font-medium"
                >
                  <i className="fas fa-route mr-2"></i> Jalur Dev
                </button>
              )}
              <button
                onClick={() => setIsRespondentModalOpen(true)}
                className="flex items-center justify-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all bg-slate-50 dark:bg-slate-800/50 text-sm font-medium"
              >
                <i className="fas fa-user-plus mr-2"></i> Target Responden
              </button>
              <button
                onClick={() => setIsVariableModalOpen(true)}
                className="flex items-center justify-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all bg-slate-50 dark:bg-slate-800/50 text-sm font-medium"
              >
                <i className="fas fa-layer-group mr-2"></i> {type === 'rnd' ? 'Add Produk' : 'Add Variabel'}
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.title}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-3 ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                }`}
            >
              {isGenerating ? (
                <><i className="fas fa-circle-notch animate-spin"></i> Processing...</>
              ) : (
                <><i className="fas fa-magic"></i> Generate Instrumen AI</>
              )}
            </button>
          </div>
        </div>

        {/* Results / List Section (Right) */}
        <div className="space-y-6">
          {type === 'rnd' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <i className="fas fa-route mr-2 text-violet-500"></i> Jalur Pengembangan
              </h3>
              {formData.devPaths?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada tahap ditambahkan.</p>
              ) : (
                <div className="space-y-2">
                  {formData.devPaths?.map((path) => (
                    <div key={path.id} className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-xl">
                      <div className="text-sm">
                        <span className="font-bold text-violet-800">{path.stage}</span>: <span className="text-violet-600">{path.instrument}</span>
                      </div>
                      <button onClick={() => removeDevPath(path.id)} className="text-violet-300 hover:text-red-500 transition-colors"><i className="fas fa-times-circle"></i></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <i className="fas fa-users mr-2 text-emerald-500"></i> Target Responden
            </h3>
            {formData.targetRespondents.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada target ditambahkan.</p>
            ) : (
              <div className="space-y-2">
                {formData.targetRespondents.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl">
                    <div className="text-sm">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400">{item.name}</span> <span className="text-[10px] bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-emerald-500 dark:text-emerald-400 font-bold ml-2 uppercase">{item.samplingMethod}</span>
                    </div>
                    <button onClick={() => removeRespondentGroup(item.id)} className="text-emerald-300 hover:text-red-500 transition-colors"><i className="fas fa-times-circle"></i></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <i className="fas fa-layer-group mr-2 text-indigo-500"></i> {type === 'experiment' ? 'Struktur Variabel' : 'Struktur Produk'}
            </h3>
            {formData.variables.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada data ditambahkan.</p>
            ) : (
              <div className="space-y-4">
                {formData.variables.map((v) => (
                  <div key={v.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                    <button onClick={() => removeVariable(v.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><i className="fas fa-trash"></i></button>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-2">{v.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {v.indicators.map((ind) => (
                        <span key={ind.id} className="text-[10px] px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-md shadow-sm">{ind.text}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="result-section">
        {generatedResult && (
          <ResultContainer
            item={{
              id: Math.random().toString(36).substr(2, 9),
              title: formData.title,
              reference: `Reference Year Limit: ${formData.refYearLimit}, Cronbach Alpha: ${formData.cronbachAlpha}`,
              result: generatedResult,
              formUrl: 'formUrl',
              type: type
            }}
          />
        )}
      </div>

      {isVariableModalOpen && <VariableModal title={type === 'rnd' ? 'Tambah Produk / Komponen' : 'Tambah Variabel Baru'} onClose={() => setIsVariableModalOpen(false)} onSave={addVariable} />}
      {isRespondentModalOpen && <RespondentModal onClose={() => setIsRespondentModalOpen(false)} onSave={addRespondentGroup} />}
      {isDevPathModalOpen && <DevelopmentPathModal onClose={() => setIsDevPathModalOpen(false)} onSave={addDevPath} />}
    </div>
  );
};

export default ResearchContainer;

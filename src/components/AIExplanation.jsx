import React, { useState } from 'react';
import { Sparkles, Loader2, MessageSquareCode, Copy, Check, Terminal } from 'lucide-react';
import { callMyAiApi } from '../api/ai';

const AIExplanation = ({ errorSymbol, errorMessage, context }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const askAI = async () => {
    setLoading(true);
    try {
      const response = await callMyAiApi({
        symbol: errorSymbol,
        message: errorMessage,
        script_context: context 
      });

      if(response && response.suggestion){
        setSuggestion(response.suggestion);
      } else {
        throw new Error("Format respon tidak sesuai");
      }
    } catch (err) {
      console.error("AI Error:", err);
      setSuggestion("Maaf, AI gagal menganalisis kode ini. Periksa koneksi atau API Key Anda.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4">
      {/* Tombol Analyze dengan Gaya Modern */}
      {!suggestion && !loading && (
        <button 
          onClick={askAI}
          className="group relative flex items-center gap-2 text-[10px] bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-all duration-300 font-bold uppercase tracking-widest shadow-lg shadow-indigo-200"
        >
          <Sparkles size={12} className="group-hover:animate-pulse" /> 
          <span>Analyze with AI</span>
          <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      )}

      {/* Loading State yang Lebih Halus */}
      {loading && (
        <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-indigo-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              AI Thinking Process...
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 animate-progress-buffer w-1/2 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Hasil Analisis dengan Glassmorphism & Typography Rapi */}
      {suggestion && (
        <div className="relative bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 rounded-2xl shadow-xl shadow-indigo-100/50 overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
          
          {/* Header Panel */}
          <div className="flex justify-between items-center px-4 py-3 bg-white/80 backdrop-blur-md border-b border-indigo-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <Terminal size={12} />
              </div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                AI Debug Assistant
              </span>
            </div>
            <button 
              onClick={copyToClipboard}
              className="p-2 hover:bg-indigo-100 rounded-xl transition-colors text-indigo-500"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
          
          {/* Content Area dengan whitespace-pre-wrap */}
          <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
             <div className="prose prose-sm prose-indigo">
                <p className="text-[11px] text-slate-600 leading-[1.8] font-medium whitespace-pre-wrap selection:bg-indigo-100">
                  {suggestion}
                </p>
             </div>
          </div>
          
          {/* Footer Panel */}
          <div className="px-4 py-2 bg-slate-50/50 border-t border-indigo-50 flex justify-between items-center">
            <p className="text-[8px] text-slate-400 font-medium italic">
              Powered by Gemini 1.5 Flash
            </p>
            <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-green-400"></div>
                <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIExplanation;
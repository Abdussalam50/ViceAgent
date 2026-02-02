import React from 'react';
import { FileCode, AlertTriangle, XCircle, Zap, Terminal, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const JSReportViewer = ({ lintData, onAskAi }) => {
  const { t } = useLanguage();
  if (!lintData || !Array.isArray(lintData)) return null;

  // Hitung total file dengan error/warning
  const filesWithIssues = lintData.filter(file =>
    (file.errorCount > 0 || file.warningCount > 0)
  );
  const slicingText = (text, length) => {
    if (text.length > length) {
      return text.slice(0, length) + '...'
    }
    return text
  }
  // Jika tidak ada file dengan issues
  if (filesWithIssues.length === 0) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
        {/* <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase italic tracking-wider">
          <div className="p-2 bg-green-500 rounded-lg shadow-lg shadow-green-100">
            <Terminal className="text-white" size={20} />
          </div>
          JavaScript/TypeScript Analysis
        </h3> */}

        <div className="py-20 text-center bg-green-50/30 rounded-[32px] border border-dashed border-green-200">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4 opacity-70" />
          <p className="text-green-700 font-black uppercase text-sm tracking-widest mb-2">
            {t('clean_js_arch')}
          </p>
          <p className="text-green-600 text-xs font-bold">
            {t('no_eslint_issues', { count: lintData.length })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      {/* <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase italic tracking-wider">
        <div className="p-2 bg-yellow-400 rounded-lg shadow-lg shadow-yellow-100">
            <Terminal className="text-white" size={20} />
        </div>
        JavaScript/TypeScript Analysis
      </h3> */}

      <div className="grid gap-6">
        {filesWithIssues.map((file, idx) => {

          // Siapkan semua messages untuk satu file
          const allMessages = file.messages || [];
          const combinedMessages = allMessages
            .map(msg => `- ${t('line_label')} ${msg.line}: ${msg.message} [${msg.ruleId || 'error'}]`)
            .join('\n');

          return (
            <div key={idx} className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/40 transition-all hover:border-blue-200">

              {/* File Header dengan Ask AI Button */}
              <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileCode className="text-blue-500 shrink-0" size={18} />
                  <span className="text-sm font-black text-slate-600 truncate font-mono tracking-tight">
                    {slicingText(file.filePath.split('\\').pop(), 13)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {file.errorCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                        {file.errorCount} Error
                      </span>
                    )}
                    {file.warningCount > 0 && (
                      <span className="bg-yellow-400 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                        {file.warningCount} Warning
                      </span>
                    )}
                  </div>

                  {/* ✅ ASK AI BUTTON PER FILE */}
                  <button
                    onClick={() => {
                      // Kita kumpulkan semua pesan error di file ini menjadi satu string
                      const combinedMessages = file.messages
                        .map(m => `${t('line_label')} ${m.line}: ${m.message}`)
                        .join('\n');

                      onAskAi(
                        file.filePath,
                        "JavaScript",
                        combinedMessages, // Kirim semua pesan, bukan 'msg' yang undefined
                        file.source
                      );
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl transition-all shadow-lg shadow-indigo-100 group"
                  >
                    <Zap size={14} fill="currentColor" className="group-hover:animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{t('fix_with_ai')}</span>
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="p-6 space-y-4 bg-white">
                {allMessages.map((msg, mIdx) => (
                  <div key={mIdx} className="flex gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="shrink-0">
                      {msg.severity === 2 ? (
                        <XCircle className="text-red-500" size={20} />
                      ) : (
                        <AlertTriangle className="text-yellow-500" size={20} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 leading-tight mb-1">{msg.message}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t('line_label')} {msg.line}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-slate-400 rounded font-mono font-bold">
                          {msg.ruleId || 'syntax-error'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JSReportViewer;
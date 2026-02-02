import * as React from 'react';
import { X, Sparkles, Loader2, Bot, Check, Code, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useLanguage } from '../context/LanguageContext';

const AISuggestModal = ({ analysis, onClose }) => {
    const { t } = useLanguage();
    if (!analysis) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                            <Bot size={24} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-lg">{t('ai_insights_title')}</h3>
                            <p className="text-[10px] font-mono text-slate-400 truncate max-w-[200px] sm:max-w-[400px]">
                                {analysis.fileName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto thin-scrollbar flex-1 bg-white">
                    {analysis.loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="relative">
                                <Loader2 className="animate-spin text-indigo-600" size={48} />
                                <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={20} />
                            </div>
                            <p className="text-sm font-bold text-slate-600 animate-pulse uppercase tracking-widest">{t('ai_analyzing')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                                <Sparkles size={20} className="text-indigo-600 shrink-0 mt-1" />
                                <p className="text-[11px] text-indigo-700 leading-relaxed font-bold uppercase tracking-tight">
                                    {t('ai_disclaimer')}
                                </p>
                            </div>

                            {/* MARKDOWN CONTENT */}
                            <div className="prose prose-slate prose-sm max-w-none 
                                prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-slate-800
                                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:my-3
                                prose-strong:text-indigo-600 prose-strong:font-bold
                                prose-ul:my-3 prose-li:my-1
                                prose-blockquote:border-l-4 prose-blockquote:border-indigo-300 prose-blockquote:bg-indigo-50/30 prose-blockquote:py-2 prose-blockquote:px-4
                                prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-code:font-bold">

                                <ReactMarkdown
                                    components={{
                                        // 🚨 INLINE CODE - Kata dalam kalimat yang berupa kode
                                        code({ node, inline, className, children, ...props }) {
                                            if (inline) {
                                                return (
                                                    <code className="inline-code px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-mono font-bold text-xs border border-indigo-100">
                                                        {children}
                                                    </code>
                                                );
                                            }

                                            // 🚨 BLOCK CODE - Potongan kode panjang (```)
                                            const match = /language-(\w+)/.exec(className || '');
                                            const language = match ? match[1] : 'javascript';

                                            return (
                                                <div className="my-6 group relative">
                                                    <div className="absolute -top-3 left-4 flex items-center gap-2 bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-t-lg font-mono uppercase tracking-wider">
                                                        <Terminal size={10} />
                                                        {language}
                                                    </div>
                                                    <SyntaxHighlighter
                                                        language={language}
                                                        style={atomDark}
                                                        customStyle={{
                                                            margin: 0,
                                                            padding: '1.5rem',
                                                            borderRadius: '0.75rem',
                                                            borderTopLeftRadius: 0,
                                                            fontSize: '0.75rem',
                                                            lineHeight: '1.4',
                                                            backgroundColor: '#0f172a',
                                                        }}
                                                        showLineNumbers={true}
                                                        lineNumberStyle={{
                                                            color: '#475569',
                                                            minWidth: '3em',
                                                            marginRight: '1em',
                                                        }}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        },

                                        // 🚨 LISTS - Poin-poin perbaikan
                                        ul({ node, children, ...props }) {
                                            return (
                                                <ul className="space-y-2 my-4" {...props}>
                                                    {children}
                                                </ul>
                                            );
                                        },

                                        li({ node, children, ...props }) {
                                            return (
                                                <li className="flex items-start gap-2 pl-1" {...props}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                                    <span className="text-slate-700 leading-relaxed">{children}</span>
                                                </li>
                                            );
                                        },

                                        // 🚨 HEADINGS - Judul section
                                        h1({ node, children, ...props }) {
                                            return (
                                                <h1 className="text-lg mt-6 mb-3 text-indigo-700" {...props}>
                                                    {children}
                                                </h1>
                                            );
                                        },

                                        h2({ node, children, ...props }) {
                                            return (
                                                <h2 className="text-base mt-5 mb-2 text-slate-800" {...props}>
                                                    {children}
                                                </h2>
                                            );
                                        },

                                        h3({ node, children, ...props }) {
                                            return (
                                                <h3 className="text-sm mt-4 mb-2 text-slate-800" {...props}>
                                                    {children}
                                                </h3>
                                            );
                                        },

                                        // 🚨 BLOCKQUOTE - Kutipan atau catatan penting
                                        blockquote({ node, children, ...props }) {
                                            return (
                                                <div className="my-4 p-4 bg-blue-50/50 border-l-4 border-blue-400 rounded-r-lg">
                                                    <div className="flex items-start gap-2">
                                                        <Sparkles size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                                        <div className="text-blue-700 text-sm italic">{children}</div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }}
                                >
                                    {analysis.result}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                        {t('done')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AISuggestModal;
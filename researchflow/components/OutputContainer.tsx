import React, { useState, useEffect } from 'react';
import { OutputItem } from '../types';

const ResultContainer = ({ item }: { item: OutputItem }) => {
  // Assuming OutputItem has an optional 'formUrl' for Google Form preview
  // If not, you can add it to the type: formUrl?: string;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 max-w-full md:max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-3">
        <i className={`fas ${item.type === 'experiment' ? 'fa-flask' : 'fa-microscope'} text-indigo-500 text-xl sm:text-2xl animate-pulse`}></i>
        {item.type === 'experiment' ? 'Your Experiment Questionaire' : 'Your RnD Questionaire'}
      </h2>
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 transition-colors">

        {/* Container for preview Google Form */}
        {item.formUrl && (
          <div className="preview-container mb-4 sm:mb-6 border border-indigo-300 dark:border-indigo-600 rounded-lg overflow-hidden shadow-md">
            <h3 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 bg-indigo-100 dark:bg-indigo-900 p-2 sm:p-3">Preview Google Form</h3>
            <div className="relative overflow-hidden" style={{ paddingBottom: '75%' }}> {/* Aspect ratio 4:3 for better responsiveness */}
              <iframe
                src={item.formUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                className="absolute top-0 left-0 w-full h-full min-h-[300px] sm:min-h-[400px]"
              >
                Loading…
              </iframe>
            </div>
          </div>
        )}

        {/* Reference Section (Now below form) */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">References</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-white text-base sm:text-lg pl-2">
            {item.reference.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
              <li key={idx} className="leading-relaxed">{line.replace(/^- /, '')}</li>
            ))}
          </ul>
        </div>

        {/* Variable/Product Info Section */}
        {item.variables && item.variables.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              {item.type === 'rnd' ? 'Product Specifications' : 'Variables'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.variables.map((v, idx) => (
                <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 shadow-sm">
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Analysis Result</h3>
          <p className="text-slate-800 dark:text-white text-base sm:text-lg leading-relaxed">{item.result}</p>
        </div>
      </div>
      <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm sm:text-base"
        >
          <i className="fas fa-download"></i>
          Download PDF
        </button>

        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm sm:text-base"
        >
          <i className="fas fa-file"></i>
          Google Form
        </button>
      </div>
    </div>
  );
};

export default ResultContainer;
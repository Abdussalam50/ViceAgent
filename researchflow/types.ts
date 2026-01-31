
export enum ResearchMethod {
  QUANTITATIVE = 'Kuantitatif',
  QUALITATIVE = 'Kualitatif',
  MIXED_METHOD = 'Mixed Method'
}

export interface VariableIndicator {
  id: string;
  text: string;
}

export interface ResearchVariable {
  id: string;
  name: string;
  indicators: VariableIndicator[];
}

export interface RespondentGroup {
  id: string;
  name: string;
  samplingMethod: string;
}

export interface DevPath {
  id: string;
  stage: 'Analyze' | 'Design' | 'Development';
  instrument: string;
}

export interface ResearchData {
  title: string;
  method: ResearchMethod;
  refYearLimit: string;
  cronbachAlpha: string;
  targetRespondents: RespondentGroup[];
  variables: ResearchVariable[];
  // R&D specific
  devModel?: string;
  devPaths?: DevPath[];
}

export interface HistoryItem {
  id: string;
  title: string;
  prompt: string;
  result: string;
  timestamp: number;
  type: TabType;
}

export type TabType = 'experiment' | 'rnd' | 'preview';

export interface OutputItem {
  id: string,
  title: string,
  reference: string,
  result: string,
  formUrl: string,
  type: TabType,
  variables?: string[]
}
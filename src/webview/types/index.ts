export type Callback = (...args: any[]) => void;

export type CommitStyle = 'author' | 'angular';

export interface ScopeOption {
  label: string;
  description?: string;
}

export interface InitState {
  commitStyle?: CommitStyle;
  scopeList?: ScopeOption[];
  strConvertFunc?: string;
}

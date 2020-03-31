export interface CommitType {
  readonly label: string;
  readonly value: string;
  readonly description: string;
}

export const enum ScopeMenuType {
  NONE,
  CREATE,
}

export interface ScopeName {
  readonly label: string;
  readonly asMenu?: ScopeMenuType;
}

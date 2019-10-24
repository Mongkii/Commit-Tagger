export interface CommitType {
  readonly label: string;
  readonly description: string;
  readonly value: string;
}

export const enum ScopeMenuType {
  NONE,
  CREATE
}

export interface ScopeName {
  readonly label: string;
  readonly asMenu?: ScopeMenuType;
}

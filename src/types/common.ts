export const enum CommitTypeOptionRole {
  /** 自动生成的 commit type */
  GENERATED,
}

export interface CommitTypeOption {
  label: string;
  value?: string;
  description: string;
  role?: CommitTypeOptionRole;
}

export interface GeneratedCommitMsg {
  type: string;
  scope?: string;
  message?: string;
}

/** 如果 scope 在菜单具有特殊功能，用它标记特殊功能类型 */
export const enum ScopeOptionRole {
  /** 无 scope */
  NONE,
  /** 新建 */
  CREATE,
}

export interface ScopeOption {
  label: string;
  description?: string;
  role?: ScopeOptionRole;
}

export const enum CommitStyle {
  /** 插件默认的风格 */
  AUTHOR = 'author',
  /** Angular 原生风格 */
  ANGULAR = 'angular',
}

export interface CommitStyleConfig {
  formatter: (commitType: string, scopeName: string | undefined) => string;
  regReplace?: RegExp;
}

export interface WebviewCommitStyleConfig {
  formatter: string;
}

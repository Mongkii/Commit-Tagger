import {
  CommitTypeOption,
  ScopeOption,
  ScopeOptionRole,
  CommitStyle,
  CommitStyleConfig,
  WebviewCommitStyleConfig,
} from './types';

export const extensionCommand = {
  MAIN: 'extension.commitTagger',
  SETTINGS: 'extension.commitTaggerSettings',
};

export const ScopeOptionNone: ScopeOption = {
  label: '» 无',
  role: ScopeOptionRole.NONE,
};

export const ScopeOptionCreate: ScopeOption = {
  label: '» 创建新范围',
  role: ScopeOptionRole.CREATE,
};

export const commitTypes: CommitTypeOption[] = [
  {
    label: 'feat',
    description: '新功能',
  },
  {
    label: 'fix',
    description: '修复问题',
  },
  {
    label: 'refactor',
    description: '重构，除 feat 与 fix 外的代码变动',
  },
  {
    label: 'perf',
    description: '优化运行性能',
  },
  {
    label: 'style',
    description: '调整代码风格',
  },
  {
    label: 'chore',
    description: '修改构建流程或相关工具',
  },
  {
    label: 'test',
    description: '调整测试用例',
  },
  {
    label: 'docs',
    description: '修改说明文档',
  },
];

export const defaultCommitStyles: Record<CommitStyle, CommitStyleConfig> = {
  [CommitStyle.AUTHOR]: {
    formatter: (commitType, scopeName) => {
      const finalScopeNameText = scopeName ? `[${scopeName}] ` : '';
      return `${commitType}: ${finalScopeNameText}`;
    },
    regReplace: /^[a-z]+: (\[.+?\])? ?/,
  },
  [CommitStyle.ANGULAR]: {
    formatter: (commitType, scopeName) => {
      const finalScopeNameText = scopeName ? `(${scopeName})` : '';
      return `${commitType}${finalScopeNameText}: `;
    },
    regReplace: /^[a-z]+(\(.+?\))?: ?/,
  },
};

export const defaultWebviewCommitStyles = (() => {
  const result: Record<string, WebviewCommitStyleConfig> = {};
  Object.entries(defaultCommitStyles).forEach(([style, config]) => {
    result[style] = {
      formatter: String(config.formatter),
    };
  });
  return result;
})();

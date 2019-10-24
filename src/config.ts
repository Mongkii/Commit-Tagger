import { CommitType } from './api/tag';

export const workspaceStateKey = {
  SCOPE_NAMES: 'scopeNames'
};

export const commitTypes: CommitType[] = [
  {
    label: 'feat',
    value: 'feat:',
    description: '新功能'
  },
  {
    label: 'fix',
    value: 'fix:',
    description: '修复问题'
  },
  {
    label: 'refactor',
    value: 'refactor:',
    description: '重构，除 feat 与 fix 外的代码变动'
  },
  {
    label: 'perf',
    value: 'perf:',
    description: '优化运行性能'
  },
  {
    label: 'style',
    value: 'style:',
    description: '调整代码风格'
  },
  {
    label: 'chore',
    value: 'chore:',
    description: '修改构建流程或相关工具'
  },
  {
    label: 'test',
    value: 'test:',
    description: '调整测试用例'
  },
  {
    label: 'docs',
    value: 'docs:',
    description: '修改说明文档'
  }
];

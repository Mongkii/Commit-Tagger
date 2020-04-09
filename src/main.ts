import { ExtensionContext, commands, window } from 'vscode';
import {
  CommitTypeOption,
  GeneratedCommitMsg,
  CommitTypeOptionRole,
  ScopeOption,
  ScopeOptionRole,
} from './types';
import { defaultCommitStyles, ScopeOptionNone, ScopeOptionCreate, commitTypes } from './constants';
import { Repository } from './types/git';
import { getStorage, getCommonQuickPick, getGitAPI } from './utils';

export const getMainCommand = (context: ExtensionContext) => {
  const git = getGitAPI();
  const storage = getStorage(context);

  const getCommitTag = (commitType: string, scopeName: string | undefined): string => {
    const commitStyle = storage.commitStyle.get();
    const { formatter } = defaultCommitStyles[commitStyle];
    return formatter(commitType, scopeName);
  };

  /** 将原始 commitTypes 和根据分支名称自动生成的 commitType 混合，生成新列表 */
  const getMixedCommitTypes = (commitTypes: CommitTypeOption[], curRepository: Repository) => {
    const convertFuncStr = storage.convertFunc.get();
    const commitStyle = storage.commitStyle.get();
    const curBranchName = curRepository.state.HEAD?.name;

    let generatedCommitMsg: GeneratedCommitMsg | string | null = null;
    try {
      const convertFunc = eval(convertFuncStr);
      generatedCommitMsg = convertFunc(curBranchName);
    } catch {}

    if (!generatedCommitMsg) {
      return commitTypes;
    }
    const generatedCommitType: CommitTypeOption = {
      label: '',
      description: `基于设置，根据分支名 ${curBranchName} 自动生成`,
      role: CommitTypeOptionRole.GENERATED,
    };
    if (typeof generatedCommitMsg === 'string') {
      generatedCommitType.label = generatedCommitMsg;
    } else {
      const { type, scope, message } = generatedCommitMsg;
      const commitTag = getCommitTag(type, scope);
      const finalMessage = message || curRepository.inputBox.value;
      generatedCommitType.label = `${commitTag}${finalMessage}`;
    }
    return [generatedCommitType, ...commitTypes];
  };

  const openCommitTypeOptionPicker = (commitTypes: CommitTypeOption[]): Promise<CommitTypeOption> =>
    new Promise((resolve) => {
      const picker = getCommonQuickPick<CommitTypeOption>(context);
      picker.items = commitTypes;
      picker.placeholder = '请选择 commit 类型';

      picker.onDidChangeSelection((selection) => {
        resolve(selection[0]);
        picker.dispose();
      });

      picker.show();
    });

  const openScopeNamePicker = (commitType: string): Promise<string> =>
    new Promise((resolve) => {
      const picker = getCommonQuickPick<ScopeOption>(context);
      const scopeNames = storage.scopeOptions.get();
      const scopePickerItems: ScopeOption[] = [ScopeOptionNone, ...scopeNames, ScopeOptionCreate];
      picker.items = scopePickerItems;
      picker.placeholder = `${commitType}: 请选择本次提交影响范围（如：项目的哪一模块）`;

      picker.onDidChangeSelection((selection) => {
        const scopeOption = selection[0];
        switch (scopeOption.role) {
          case ScopeOptionRole.NONE:
            resolve('');
            break;
          case ScopeOptionRole.CREATE:
            resolve(
              (async () => {
                const input = await window.showInputBox({
                  placeHolder: '请输入新范围的名称',
                });
                const newScopeName = input && input.trim();
                if (!newScopeName) {
                  return '';
                }
                const newScopeOption: ScopeOption = {
                  label: newScopeName,
                };
                storage.scopeOptions.add(newScopeOption);
                return newScopeName;
              })()
            );
            break;
          default:
            resolve(scopeOption.label);
        }
        picker.dispose();
      });

      picker.show();
    });

  const addTagInCommitMessage = (
    repository: Repository,
    commitTag: string,
    clearPrev?: boolean
  ) => {
    // 界面切换至 Git 页
    commands.executeCommand('workbench.view.scm');
    if (clearPrev) {
      repository.inputBox.value = commitTag;
      return;
    }
    const commitStyle = storage.commitStyle.get();
    // 如果已有与本插件格式相同的 tag， 就清除
    const { regReplace } = defaultCommitStyles[commitStyle];
    const cleanCommitMessage = repository.inputBox.value.replace(regReplace || '', '');
    repository.inputBox.value = `${commitTag}${cleanCommitMessage}`;
  };

  return async () => {
    if (!git) {
      window.showErrorMessage('没有找到 Git');
      return;
    }
    // 考虑到使用场景，暂不处理有多个 repository 的情况
    const curRepository = git.repositories[0];
    if (!curRepository) {
      window.showErrorMessage('没有找到 Repository');
      return;
    }

    const mixedCommitTypes = getMixedCommitTypes(commitTypes, curRepository);
    const commitTypeOption = await openCommitTypeOptionPicker(mixedCommitTypes);
    if (!commitTypeOption) {
      return;
    }
    if (commitTypeOption.role === CommitTypeOptionRole.GENERATED) {
      addTagInCommitMessage(curRepository, commitTypeOption.label, true);
      return;
    }

    const commitType = commitTypeOption.value || commitTypeOption.label;
    const scopeName = await openScopeNamePicker(commitType);
    const fullCommitTag = getCommitTag(commitType, scopeName);

    addTagInCommitMessage(curRepository, fullCommitTag);
  };
};

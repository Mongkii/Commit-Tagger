import { ExtensionContext, commands, window } from 'vscode';
import {
  CommitTypeOption,
  GeneratedCommitMsg,
  CommitTypeOptionRole,
  ScopeOption,
  ScopeOptionRole,
} from '../types/common';
import { defaultCommitStyles, ScopeOptionNone, ScopeOptionCreate, commitTypes } from '../constants';
import { Repository } from '../types/git';
import { getStorage, getCommonQuickPick, getGitAPI, getCurRepository } from '../utils';
import getPinyinFromStr from '../utils/pinyin_convert';
import { runBranchConverter } from '../utils/branch-converter';

export const getPanelCommand = (context: ExtensionContext) => {
  const storage = getStorage(context);

  const getCommitTag = (commitType: string, scopeName: string | undefined): string => {
    const commitStyle = storage.commitStyle.get();
    const { formatter } = defaultCommitStyles[commitStyle];
    return formatter(commitType, scopeName);
  };

  const cleanCommitMessage = (message: string): string => {
    const { regReplace } = defaultCommitStyles[storage.commitStyle.get()];
    return regReplace ? message.replace(regReplace, '') : message;
  };

  /** 将原始 commitTypes 和根据分支名称自动生成的 commitType 混合，生成新列表 */
  const getMixedCommitTypes = (commitTypes: CommitTypeOption[], curRepository: Repository) => {
    const convertFuncStr = storage.convertFunc.get();
    const curBranchName = curRepository.state.HEAD?.name ?? '';

    let generatedCommitMsg: GeneratedCommitMsg | string | null = null;
    try {
      generatedCommitMsg = runBranchConverter(convertFuncStr, curBranchName);
    } catch (error) {
      window.showErrorMessage(`commit 信息生成失败：${error instanceof Error ? error.message : String(error)}`);
    }

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
      const finalMessage = message ?? cleanCommitMessage(curRepository.inputBox.value);
      generatedCommitType.label = `${commitTag}${finalMessage}`;
    }
    return [generatedCommitType, ...commitTypes];
  };

  const openCommitTypeOptionPicker = (commitTypes: CommitTypeOption[]): Promise<CommitTypeOption | undefined> =>
    new Promise((resolve) => {
      const picker = getCommonQuickPick<CommitTypeOption>(context);
      let selectedOption: CommitTypeOption | undefined;
      picker.items = commitTypes;
      picker.placeholder = '请选择 commit 类型';

      picker.onDidChangeSelection((selection) => {
        selectedOption = selection[0];
        picker.dispose();
      });

      picker.onDidHide(() => {
        resolve(selectedOption);
        picker.dispose();
      });

      picker.show();
    });

  const openScopeNamePicker = (commitType: string): Promise<string | undefined> =>
    new Promise((resolve) => {
      const picker = getCommonQuickPick<ScopeOption>(context);
      let selectedOption: ScopeOption | undefined;
      let scopeNames = storage.scopeOptions.get();

      // v2.1.0 版本支持音序功能。自此版本开始，需自动给没有音序的 scope 添加音序
      if (scopeNames.some((option) => option.description === undefined)) {
        const newScopeNames = scopeNames.map((option) => ({
          ...option,
          description: option.description ?? getPinyinFromStr(option.label),
        }));
        storage.scopeOptions.update(newScopeNames);
        scopeNames = newScopeNames;
      }

      const scopePickerItems: ScopeOption[] = [ScopeOptionNone, ...scopeNames, ScopeOptionCreate];
      picker.items = scopePickerItems;
      picker.placeholder = `${commitType}: 请选择本次提交影响范围（如：项目的哪一模块）`;
      picker.matchOnDescription = true;

      picker.onDidChangeSelection((selection) => {
        selectedOption = selection[0];
        picker.dispose();
      });

      picker.onDidHide(async () => {
        if (!selectedOption) {
          resolve(undefined);
          picker.dispose();
          return;
        }
        const scopeOption = selectedOption;
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
                  return undefined;
                }
                const newScopeOption: ScopeOption = {
                  label: newScopeName,
                  description: getPinyinFromStr(newScopeName),
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

  const focusScmInput = async () => {
    await commands.executeCommand('workbench.scm.action.focusNextInput');
  };

  const addTagInCommitMessage = async (
    repository: Repository,
    commitTag: string,
    clearPrev?: boolean
  ) => {
    if (clearPrev) {
      repository.inputBox.value = commitTag;
      await focusScmInput();
      return;
    }
    // 如果已有与本插件格式相同的 tag， 就清除
    repository.inputBox.value = `${commitTag}${cleanCommitMessage(repository.inputBox.value)}`;
    // Quick Pick 关闭并写入完成后，再把光标交还给 Git 提交信息输入框
    await focusScmInput();
  };

  return async () => {
    const git = getGitAPI();
    if (!git) {
      window.showErrorMessage('没有找到 Git');
      return;
    }
    // 考虑到使用场景，暂不处理有多个 repository 的情况
    const curRepository = getCurRepository(git);
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
      await addTagInCommitMessage(curRepository, commitTypeOption.label, true);
      return;
    }

    const commitType = commitTypeOption.value || commitTypeOption.label;
    const scopeName = await openScopeNamePicker(commitType);
    if (scopeName === undefined) {
      return;
    }
    const fullCommitTag = getCommitTag(commitType, scopeName);

    await addTagInCommitMessage(curRepository, fullCommitTag);
  };
};

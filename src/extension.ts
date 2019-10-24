import { window, commands, extensions, Uri, ExtensionContext } from 'vscode';
import { GitExtension, Repository, API } from './api/git';
import { CommitType, ScopeMenuType, ScopeName } from './api/tag';
import { workspaceStateKey, commitTypes } from './config';
import { getButtonDelete, openDeletePicker } from './pickerDeleteScope';

const { SCOPE_NAMES } = workspaceStateKey;

interface InputUri {
  readonly _rootUri: Uri;
}

const ScopeMenuNone: ScopeName = {
  label: '» 无',
  asMenu: ScopeMenuType.NONE
};
const ScopeMenuCreate: ScopeName = {
  label: '» 创建新范围',
  asMenu: ScopeMenuType.CREATE
};

function getGitAPI(): API | void {
  const vscodeGit = extensions.getExtension<GitExtension>('vscode.git');
  const gitExtension = vscodeGit && vscodeGit.exports;
  return gitExtension && gitExtension.getAPI(1);
}

function getCombinedCommitTag(
  commitType: CommitType,
  scopeName: ScopeName | string
): string {
  const commitTypeText = commitType.value;
  const scopeNameText =
    typeof scopeName === 'string' ? scopeName : scopeName.label;
  const finalScopeNameText = scopeNameText ? ` [${scopeNameText}]` : '';
  return `${commitTypeText}${finalScopeNameText}`;
}

function addTagInCommitMessage(
  repository: Repository,
  commitTag: string
): void {
  // 如果已有与本插件格式相同的 tag， 就清除
  const cleanCommitMessage = repository.inputBox.value.replace(
    /^[a-z]+?: (?:\[.+?\] )?/,
    ''
  );
  repository.inputBox.value = `${commitTag} ${cleanCommitMessage}`;
}

function setTagForRepository(
  uri: InputUri | void,
  repositories: Repository[],
  commitTag: string
): void {
  // 界面切换至 Git 页
  commands.executeCommand('workbench.view.scm');
  if (uri) {
    const selectedRepository = repositories.find(
      repository => repository.rootUri.path === uri._rootUri.path
    );
    if (selectedRepository) {
      addTagInCommitMessage(selectedRepository, commitTag);
    }
  } else {
    for (let repo of repositories) {
      addTagInCommitMessage(repo, commitTag);
    }
  }
}

function openScopeNamePicker(
  selectedCommitType: CommitType | void,
  context: ExtensionContext
): Thenable<[CommitType, ScopeName]> {
  return new Promise((resolve, reject) => {
    if (!selectedCommitType) {
      reject();
      return;
    }
    const picker = window.createQuickPick();
    const buttonDelete = getButtonDelete(context);
    function setAndShowScopeNamePicker(): void {
      const scopeNames: ScopeName[] = context.workspaceState.get(
        SCOPE_NAMES,
        []
      );
      const scopePickerItems: ScopeName[] = [
        ScopeMenuNone,
        ...scopeNames,
        ScopeMenuCreate
      ];
      picker.items = scopePickerItems;
      picker.placeholder = '请选择本次提交影响范围（如：项目的哪一模块）';
      picker.buttons = scopeNames.length > 0 ? [buttonDelete] : [];
      picker.show();
    }

    picker.onDidChangeSelection(selection => {
      resolve([selectedCommitType, selection[0]]);
    });
    picker.onDidTriggerButton(button => {
      if (button === buttonDelete) {
        openDeletePicker(setAndShowScopeNamePicker, context);
      }
    });
    setAndShowScopeNamePicker();
  });
}

async function getFullCommitTags(
  selectedCommitType: CommitType,
  selectedScopeName: ScopeName,
  context: ExtensionContext
): Promise<string> {
  const { workspaceState } = context;
  const scopeNames: ScopeName[] = workspaceState.get(SCOPE_NAMES, []);
  if (!selectedCommitType || !selectedScopeName) {
    throw 'No Scope Selected';
  }
  let scopeName: ScopeName | string;
  if (selectedScopeName.asMenu === ScopeMenuType.CREATE) {
    const input = await window.showInputBox({
      placeHolder: '请输入新范围的名称'
    });
    const newScopeNameLabel = input && input.trim();
    if (!newScopeNameLabel) {
      scopeName = '';
    } else {
      const newScopeName: ScopeName = {
        label: newScopeNameLabel
      };
      workspaceState.update(SCOPE_NAMES, [...scopeNames, newScopeName]);
      scopeName = newScopeNameLabel;
    }
  } else {
    scopeName =
      selectedScopeName.asMenu === ScopeMenuType.NONE ? '' : selectedScopeName;
  }
  return getCombinedCommitTag(selectedCommitType, scopeName);
}

export function activate(context: ExtensionContext) {
  let disposable = commands.registerCommand(
    'extension.commitTagger',
    (uri?: InputUri) => {
      const git = getGitAPI();
      console.log(git);
      if (!git) {
        window.showErrorMessage('没有找到 Git');
        return;
      }
      window
        .showQuickPick(commitTypes, { placeHolder: '请选择 commit 类型' })
        .then((selectedCommitType: CommitType | void) =>
          openScopeNamePicker(selectedCommitType, context)
        )
        .then(([selectedCommitType, selectedScopeName]) =>
          getFullCommitTags(selectedCommitType, selectedScopeName, context)
        )
        .then((commitTag: string) => {
          setTagForRepository(uri, git.repositories, commitTag);
        });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

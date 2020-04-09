import {
  Uri,
  ExtensionContext,
  QuickInputButton,
  extensions,
  QuickPickItem,
  window,
  commands,
} from 'vscode';
import { ScopeOption, CommitStyle } from './types';
import { API, GitExtension } from './types/git';
import { extensionCommand } from './constants';

export const getGitAPI = (): API | undefined => {
  const vscodeGit = extensions.getExtension<GitExtension>('vscode.git');
  const gitExtension = vscodeGit && vscodeGit.exports;
  return gitExtension?.getAPI(1);
};

export const getFileSrc = (relativePath: string, context: ExtensionContext) =>
  Uri.file(context.asAbsolutePath(relativePath)).with({ scheme: 'vscode-resource' }).toString();

export const getBtnSettings = (context: ExtensionContext): QuickInputButton => {
  const button: QuickInputButton = {
    iconPath: {
      dark: Uri.file(context.asAbsolutePath('resources/dark/settings.svg')),
      light: Uri.file(context.asAbsolutePath('resources/light/settings.svg')),
    },
    tooltip: '打开 Commit Tagger 设置',
  };
  return button;
};

export const getCommonQuickPick = <T extends QuickPickItem>(context: ExtensionContext) => {
  const picker = window.createQuickPick<T>();
  const btnSettings = getBtnSettings(context);
  picker.buttons = [btnSettings];
  picker.onDidTriggerButton((button) => {
    if (button === btnSettings) {
      commands.executeCommand(extensionCommand.SETTINGS);
    }
  });
  return picker;
};

const SCOPE_NAMES = 'scopeNames';
const COMMIT_STYLE = 'commitStyle';
const CONVERT_FUNC = 'convertFunc';
export const getStorage = (context: ExtensionContext) => ({
  scopeOptions: {
    get: (): ScopeOption[] => context.workspaceState.get(SCOPE_NAMES, []),
    update: (newScopeNames: ScopeOption[]) => {
      context.workspaceState.update(SCOPE_NAMES, newScopeNames);
    },
    add(newScopeOption: ScopeOption) {
      const scopeOptions = this.get();
      if (scopeOptions.some((option) => option.label === newScopeOption.label)) {
        return scopeOptions;
      }
      const newScopeOptions = [...scopeOptions, newScopeOption];
      this.update(newScopeOptions);
      return newScopeOptions;
    },
  },
  commitStyle: {
    get: (): CommitStyle => context.globalState.get(COMMIT_STYLE, CommitStyle.AUTHOR),
    update: (newCommitStyle: CommitStyle) => {
      context.globalState.update(COMMIT_STYLE, newCommitStyle);
    },
  },
  convertFunc: {
    get: (): string => context.workspaceState.get(CONVERT_FUNC, ''),
    update: (newConvertFunc: string) => {
      context.workspaceState.update(CONVERT_FUNC, newConvertFunc);
    },
  },
});

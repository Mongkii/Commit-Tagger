import { window, QuickInputButton, Uri, ExtensionContext } from 'vscode';
import { ScopeName } from './api/tag';
import { workspaceStateKey } from './config';

const { SCOPE_NAMES } = workspaceStateKey;

export function getButtonDelete(context: ExtensionContext): QuickInputButton {
  const button: QuickInputButton = {
    iconPath: {
      dark: Uri.file(context.asAbsolutePath('resources/dark/delete.svg')),
      light: Uri.file(context.asAbsolutePath('resources/light/delete.svg'))
    },
    tooltip: '删除已保存的范围名'
  };
  return button;
}

export function openDeletePicker(
  showPrevPicker: () => void,
  context: ExtensionContext
): void {
  let toDeleteScope: ScopeName[] = [];
  const picker = window.createQuickPick();
  const scopeNames: ScopeName[] = context.workspaceState.get(SCOPE_NAMES, []);
  picker.items = scopeNames;
  picker.placeholder = '请选择要删除的范围名';
  picker.canSelectMany = true;
  picker.onDidAccept(() => {
    const toDeleteScopeSet = new Set(toDeleteScope.map(scope => scope.label));
    const newScopeNames = scopeNames.filter(
      item => !toDeleteScopeSet.has(item.label)
    );
    context.workspaceState.update(SCOPE_NAMES, newScopeNames);
    picker.hide();
  });
  picker.onDidChangeSelection(selection => {
    toDeleteScope = selection;
  });
  picker.onDidHide(() => {
    picker.dispose();
    showPrevPicker();
  });
  picker.show();
}

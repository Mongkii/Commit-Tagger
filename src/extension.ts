import { commands, ExtensionContext } from 'vscode';
import { extensionCommand } from './constants';
import { getMainCommand } from './main';
import { getSettingsCommand } from './settings';

export const activate = (context: ExtensionContext) => {
  const cmdMain = commands.registerCommand(extensionCommand.MAIN, getMainCommand(context));

  const cmdSettings = commands.registerCommand(
    extensionCommand.SETTINGS,
    getSettingsCommand(context)
  );

  context.subscriptions.push(cmdMain, cmdSettings);
};

export const deactivate = () => undefined;

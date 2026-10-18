import { commands, ExtensionContext } from 'vscode';
import { ExtensionCommand } from './constants';
import { getPanelCommand } from './commands/panel';
import { getSettingsCommand } from './commands/settings';

export const activate = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(ExtensionCommand.PANEL, getPanelCommand(context)),
    commands.registerCommand(ExtensionCommand.SETTINGS, getSettingsCommand(context))
  );
};

export const deactivate = () => undefined;

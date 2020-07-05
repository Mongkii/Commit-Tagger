import { ExtensionContext, window, ViewColumn } from 'vscode';
import { getGitAPI, getFileSrc, getStorage, getCurRepository } from './utils';
import { defaultWebviewCommitStyles } from './constants';

export const getSettingsCommand = (context: ExtensionContext) => () => {
  const git = getGitAPI();
  const curRepository = git ? getCurRepository(git) : null;
  const curBranchName = curRepository?.state.HEAD?.name || '';

  const storage = getStorage(context);

  const panel = window.createWebviewPanel(
    'commitTaggerSettings', // viewType
    'Commit Tagger 设置', // 视图标题
    ViewColumn.One, // 显示在编辑器的哪个部位
    {
      enableScripts: true, // 启用JS，默认禁用
      retainContextWhenHidden: false, // webview被隐藏时保持状态，避免被重置
    }
  );

  const sendToWebview = (type: string, payload: any) => {
    panel.webview.postMessage({ type, payload });
  };
  const sendWebviewCallback = (callbackId: string | undefined, args?: any[]) => {
    if (!callbackId) {
      return;
    }
    sendToWebview('callback', { callbackId, args });
  };
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.type) {
      case 'getInitState':
        sendToWebview('init', {
          state: {
            commitStyle: storage.commitStyle.get(),
            scopeList: storage.scopeOptions.get(),
            strConvertFunc: storage.convertFunc.get(),
          },
          constants: {
            curBranchName,
            commitStyles: defaultWebviewCommitStyles,
          },
        });
        return;
      case 'updateCommitStyle':
        storage.commitStyle.update(message.payload);
        sendWebviewCallback(message.callbackId);
        return;
      case 'updateScopeList':
        storage.scopeOptions.update(message.payload);
        sendWebviewCallback(message.callbackId);
        return;
      case 'addToScopeList': {
        const newScopeList = storage.scopeOptions.add(message.payload);
        sendWebviewCallback(message.callbackId, [newScopeList]);
        return;
      }
      case 'updateConvertFunc': {
        storage.convertFunc.update(message.payload);
        sendWebviewCallback(message.callbackId);
        return;
      }
      case 'console':
        console.log(message.payload);
        return;
      default:
        return;
    }
  });

  const srcStyle = getFileSrc('/webview/style.css', context);
  const srcNeverland = getFileSrc('/webview/neverland.js', context);
  const srcApp = getFileSrc('/webview/index.js', context);
  panel.webview.html = `<html><head>
  <link href=${srcStyle} rel="stylesheet" />
  </head><body>
  <script src="${srcNeverland}"></script>
  <script src="${srcApp}"></script>
  </body></html>`;
};

import { Callback } from './types';

export const sendToVSCode = (type: string, payload?: any, callback?: Callback): void => {
  let callbackId;
  if (callback) {
    callbackId = `${type}${Date.now()}`;
    window.callback[callbackId] = callback;
  }
  window.vscode.postMessage({
    type,
    payload,
    callbackId,
  });
};

export const log = (message: string): void => sendToVSCode('console', message);

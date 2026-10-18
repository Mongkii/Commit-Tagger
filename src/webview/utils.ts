import { Callback } from './types';

const callbackMap = new Map<string, Callback>();
let callbackCounter = 0;

export const resolveCallback = (callbackId: string, args: any[]): void => {
  const callback = callbackMap.get(callbackId);
  if (callback) {
    callback(...args);
    callbackMap.delete(callbackId);
  }
};

export const sendToVSCode = (type: string, payload?: any, callback?: Callback): void => {
  let callbackId: string | undefined;
  if (callback) {
    callbackId = `${type}_${++callbackCounter}`;
    callbackMap.set(callbackId, callback);
  }
  window.vscode.postMessage({ type, payload, callbackId });
};

export const log = (message: string): void => sendToVSCode('console', message);

declare module '*.module.css' {
  const classNames: { [key: string]: string };
  export default classNames;
}

type Callback = (...args: any[]) => void;

interface PostArgs {
  type: string;
  payload: any;
  callbackId?: string;
}
interface VSCodeApi {
  postMessage: (args: PostArgs) => void;
}
declare const acquireVsCodeApi: () => VSCodeApi;

declare interface Window {
  vscode: VSCodeApi;
  callback: { [id: string]: Callback };
}

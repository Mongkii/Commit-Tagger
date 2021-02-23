import React, { useState, useMemo } from 'react';

import { useConstants } from '../../contexts';
import { sendToVSCode } from '../../utils';
import c from './style.module.css';

const helpTextCommitInfoType = `interface CommitInfo {
  type: string; // 提交类型
  scope?: string; // 影响范围。不填则视为：无影响范围
  message?: string; // 提交信息主体。不填则使用提交信息输入框中的内容
}`;
const helpTextFuncSample = `(curBranchName) => {
  if (curBranchName.startsWith('fix')) {
    return { type: 'fix', scope: '全局', message: '修复问题' };
  }
  return 'Not a fix';
};`;

const Help = (): JSX.Element => (
  <div className={c.help}>
    函数的类型定义为：
    <pre>{`(curBranchName: string) => null | string | CommitInfo;`}</pre>
    <ul>
      <li>输入参数为当前分支的名称。</li>
      <li>输出为 null，则不自动生成提交信息；</li>
      <li>输出为 string，则使用它替换当前提交信息。</li>
      <li>若输出为 CommitInfo，则根据其内容，结合你选择的 commit 风格，生成提交信息。</li>
    </ul>
    CommitInfo 是一个对象，其类型定义为：
    <pre>{helpTextCommitInfoType}</pre>
    <br />
    以下是一个简单的示例，在该示例中，如果分支名以 "fix" 开头，则自动生成提交信息："fix: [全局]
    修复问题"；否则生成提交信息："Not a fix"
    <pre>{helpTextFuncSample}</pre>
  </div>
);

interface Props {
  initStrConvertFunc?: string;
}
const BranchConverter = ({ initStrConvertFunc = '' }: Props): JSX.Element => {
  const { curBranchName } = useConstants();
  const [savedConvertFunc, setSavedConvertFunc] = useState(initStrConvertFunc);
  const [inputConvertFunc, setInputConvertFunc] = useState(initStrConvertFunc);
  const [testBranch, setTestBranch] = useState(curBranchName);
  const [showHelp, setShowHelp] = useState(false);

  const testResult = useMemo(() => {
    if (!savedConvertFunc) {
      return '未填写生成函数';
    }
    try {
      const convertFunc = eval(savedConvertFunc);
      const newTestResult = convertFunc(testBranch);
      return JSON.stringify(newTestResult);
    } catch (e) {
      return `函数错误：${e.name}`;
    }
  }, [testBranch, savedConvertFunc]);

  const isStrFuncChanged = inputConvertFunc !== savedConvertFunc;

  const handleClickHelp = () => {
    setShowHelp(!showHelp);
  };

  // 虽然这里最佳类型定义是 FormEventHandler，但只有 ChangeEventHandler 不会报错。下同
  const handleFuncInput: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setInputConvertFunc(event.target.value);
  };

  const handleBranchInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setTestBranch(event.target.value);
  };

  const saveFunc = () => {
    const newFuncStr = inputConvertFunc.trim();
    setInputConvertFunc(newFuncStr);
    sendToVSCode('updateConvertFunc', newFuncStr, () => {
      setSavedConvertFunc(newFuncStr);
    });
  };

  return (
    <div>
      <h2>提交信息生成函数</h2>
      <p className="desc">
        读取分支名，基于函数规则，自动生成提交信息。
        <a onClick={handleClickHelp}>{showHelp ? '收起' : '如何编写函数?'}</a>
      </p>
      {showHelp ? <Help /> : null}
      <p className="desc">
        函数保存后，可在下方测试运行结果。当前状态：{isStrFuncChanged ? '未保存' : '已保存'}
      </p>
      <div className={c.editorArea}>
        <textarea
          className={c.funcInput}
          placeholder="生成函数"
          value={inputConvertFunc}
          onInput={handleFuncInput}
        />
        <button className={c.btnSave} onClick={saveFunc}>
          保存
        </button>
      </div>
      <h3>测试</h3>
      <p>
        分支名称：
        <input
          className={c.branchInput}
          placeholder="测试分支名称"
          value={testBranch}
          onInput={handleBranchInput}
        />
      </p>
      <p>生成结果：{testResult}</p>
    </div>
  );
};

export default React.memo(BranchConverter);

import React, { useState } from 'react';

import { sendToVSCode } from '../../utils';
import { ScopeOption } from '../../types';
import c from './style.module.css';

interface Props {
  initScopeList?: ScopeOption[];
}
const ScopeList = ({ initScopeList = [] }: Props): JSX.Element => {
  const [scopeList, setScopeList] = useState(initScopeList);
  const [inputScopes, setInputScopes] = useState(() => initScopeList.map((scope) => scope.label).join('\n'));
  const [isSaving, setIsSaving] = useState(false);
  const savedScopes = scopeList.map((scope) => scope.label).join('\n');
  const isChanged = inputScopes !== savedScopes;

  const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (event) => {
    setInputScopes(event.currentTarget.value);
  };

  const saveScopes = () => {
    const labels = [...new Set(inputScopes.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
    const existingScopes = new Map(scopeList.map((scope) => [scope.label, scope]));
    const newScopeList = labels.map((label) => existingScopes.get(label) ?? { label });

    setIsSaving(true);
    sendToVSCode('updateScopeList', newScopeList, () => {
      setScopeList(newScopeList);
      setInputScopes(labels.join('\n'));
      setIsSaving(false);
    });
  };

  return (
    <div>
      <h2>Scope 列表</h2>
      <p className="desc" id="scope-list-help">
        你创建的影响范围（scope）列表。每个工作区（workspace）的列表是各自独立的
        <br />
        每行填写一个 scope，保存时会自动去除首尾空格、空行和重复项，并按列表顺序排列。
      </p>
      <textarea
        className={c.scopeEditor}
        aria-label="Scope 列表"
        aria-describedby="scope-list-help"
        placeholder={'例如：\n全局\n登录\n设置'}
        value={inputScopes}
        onInput={handleInput}
        disabled={isSaving}
        spellCheck={false}
        rows={8}
      />
      <div className={c.actions}>
        <button type="button" onClick={saveScopes} disabled={!isChanged || isSaving}>
          保存
        </button>
        <span role="status">{isSaving ? '保存中…' : isChanged ? '未保存' : '已保存'}</span>
      </div>
    </div>
  );
};

export default React.memo(ScopeList);

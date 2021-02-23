import React, { useState } from 'react';

import { sendToVSCode } from '../../utils';
import { ScopeOption } from '../../types';
import c from './style.module.css';

interface Props {
  initScopeList?: ScopeOption[];
}
const ScopeList = ({ initScopeList = [] }: Props): JSX.Element => {
  const [scopeList, setScopeList] = useState(initScopeList);

  const listItems = (() => {
    if (scopeList.length < 1) {
      return <p>Scope 列表为空</p>;
    }

    const getDeleteHandler = (scopeName: string) => () => {
      const newScopeList = scopeList.filter((oneScope) => oneScope.label !== scopeName);
      sendToVSCode('updateScopeList', newScopeList, () => {
        setScopeList(newScopeList);
      });
    };

    return (
      <ul className={c.scopeList}>
        {scopeList.map((scope) => {
          const scopeName = scope.label;
          return (
            <li key={scopeName} className={c.listItem}>
              <span className={c.itemName} title={scopeName}>
                {scopeName}
              </span>
              <a className={c.btnDel} onClick={getDeleteHandler(scopeName)}>
                删除
              </a>
            </li>
          );
        })}
      </ul>
    );
  })();

  const [inputScopeName, setInputScopeName] = useState('');

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setInputScopeName(event.target.value);
  };

  const handleAdd = () => {
    const newScopeName = inputScopeName.trim();
    setInputScopeName('');
    if (!newScopeName) {
      return;
    }
    const newScopeOption = { label: newScopeName };
    sendToVSCode('addToScopeList', newScopeOption, (newScopeList) => {
      setScopeList(newScopeList);
    });
  };

  return (
    <div>
      <h2>Scope 列表</h2>
      <p className="desc">
        你创建的影响范围（scope）列表。每个工作区（workspace）的列表是各自独立的
      </p>
      {listItems}
      <input
        className={c.nameInput}
        placeholder="新 scope 名称"
        value={inputScopeName}
        onInput={handleInput}
      />
      <button onClick={handleAdd}>添加</button>
    </div>
  );
};

export default React.memo(ScopeList);

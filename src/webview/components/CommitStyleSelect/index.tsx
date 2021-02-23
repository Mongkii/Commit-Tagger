import React, { useState, useMemo } from 'react';

import { useConstants } from '../../contexts';
import { sendToVSCode } from '../../utils';
import { CommitStyle } from '../../types';
import c from './style.module.css';

const theads = ['类型', '影响范围', '信息主体'];
const tdatas = ['feat', '全局', '加入 commit 风格切换功能'];

interface Props {
  initCommitStyle?: CommitStyle;
}
const CommitStyleSelect = ({ initCommitStyle = 'author' }: Props): JSX.Element => {
  const { commitStyles } = useConstants();
  const [commitStyle, setCommitStyle] = useState(initCommitStyle);

  const styleResult = useMemo(() => {
    try {
      const func = eval(commitStyles[commitStyle].formatter);
      const [type, scope, message] = tdatas;
      return `${func(type, scope)}${message}`;
    } catch (e) {}
  }, [commitStyle]);

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const newCommitStyle = (event.target && event.target.value) || 'author';
    sendToVSCode('updateCommitStyle', newCommitStyle, () => {
      setCommitStyle(newCommitStyle as CommitStyle);
    });
  };

  return (
    <div>
      <h2>Commit 风格</h2>
      <p className="desc">设定 commit 信息的格式</p>
      <select value={commitStyle} onChange={handleChange}>
        <option value="author">插件默认</option>
        <option value="angular">Angular 标准</option>
      </select>
      <h3>示例</h3>
      <table className={c.commitTable}>
        <thead>
          <tr>
            {theads.map((head) => (
              <th key={head}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {tdatas.map((data) => (
              <td key={data}>{data}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <p>
        <span className={c.tag}>生成结果</span>
        {styleResult}
      </p>
    </div>
  );
};

export default React.memo(CommitStyleSelect);

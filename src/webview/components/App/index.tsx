import React, { useState, useEffect } from 'react';

import CommitStyleSelect from '../CommitStyleSelect';
import ScopeList from '../ScopeList';
import BranchConverter from '../BranchConverter';

import { ConstantsContext, defaultConstants } from '../../contexts';
import { sendToVSCode } from '../../utils';
import { InitState } from '../../types';
import c from './style.module.css';

const App = (): JSX.Element => {
  const [initState, setInitState] = useState<InitState | null>(null);
  const [constants, setConstants] = useState(defaultConstants);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'init': {
          const { state, constants } = message.payload;
          setConstants(constants);
          setInitState(state);
          return;
        }
        case 'callback': {
          const { callbackId, args = [] } = message.payload;
          const callback = window.callback[callbackId];
          if (callback) {
            callback(...args);
            delete window.callback[callbackId];
          }
          return;
        }
        default:
          return;
      }
    });

    sendToVSCode('getInitState');
  }, []);

  if (!initState) {
    return <div>载入中</div>;
  }
  return (
    <ConstantsContext.Provider value={constants}>
      <div className={c.wrapper}>
        <h1>Commit Tagger 设置</h1>
        <CommitStyleSelect initCommitStyle={initState.commitStyle} />
        <ScopeList initScopeList={initState.scopeList} />
        <BranchConverter initStrConvertFunc={initState.strConvertFunc} />
      </div>
    </ConstantsContext.Provider>
  );
};

export default App;

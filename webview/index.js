/* ----------------
 * Utils
 * ---------------- */
// eslint-disable-next-line no-undef
window.vscode = acquireVsCodeApi();

window.callback = {};

const sendToVSCode = (type, payload, callback) => {
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

const log = (message) => sendToVSCode('console', message);

const {
  neverland: $,
  html,
  render,
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
} = window.neverland;

const ConstantsContext = createContext({});
const useConstants = () => useContext(ConstantsContext);

const theads = ['类型', '影响范围', '信息主体'];
const tdatas = ['feat', '全局', '加入 commit 风格切换功能'];

/* ----------------
 * commit 风格选择
 * ---------------- */
const CommitStyleSelect = $((initCommitStyle = 'author') => {
  const { commitStyles } = useConstants();
  const [commitStyle, setCommitStyle] = useState(initCommitStyle);

  const styleResult = useMemo(() => {
    try {
      const func = eval(commitStyles[commitStyle].formatter);
      const [type, scope, message] = tdatas;
      return `${func(type, scope)}${message}`;
    } catch (e) {}
  }, [commitStyle]);

  const handleChange = (event) => {
    const newCommitStyle = (event.target && event.target.value) || 'author';
    sendToVSCode('updateCommitStyle', newCommitStyle, () => {
      setCommitStyle(newCommitStyle);
    });
  };

  return html`<div>
    <h2>Commit 风格</h2>
    <p class="desc">设定 commit 信息的格式</p>
    <select value=${commitStyle} onchange=${handleChange}>
      <option value="author">插件默认</option>
      <option value="angular">Angular 标准</option>
    </select>
    <h3>示例</h3>
    <table class="commit-table">
      <thead>
        <tr>
          ${theads.map((text) => html`<th>${text}</th>`)}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${tdatas.map((text) => html`<td>${text}</td>`)}
        </tr>
      </tbody>
    </table>
    <p><span class="tag">生成结果</span>${styleResult}</p>
  </div>`;
});

/* ----------------
 * scope 列表
 * ---------------- */
const ScopeList = $((initScopeList = []) => {
  const [scopeList, setScopeList] = useState(initScopeList);
  const [inputScopeName, setInputScopeName] = useState('');
  const hasScope = scopeList.length > 0;

  const content = (() => {
    if (!hasScope) {
      return html`<p>Scope 列表为空</p>`;
    }

    const getDeleteHandler = (scopeName) => () => {
      const newScopeList = scopeList.filter((oneScope) => oneScope.label !== scopeName);
      sendToVSCode('updateScopeList', newScopeList, () => {
        setScopeList(newScopeList);
      });
    };

    const handleInput = (event) => {
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

    return html`<ul class="scope_list">
        ${scopeList.map((scope) => {
          const scopeName = scope.label;
          return html`<li class="scope_item">
            <span class="scope_name" title=${scopeName}>${scopeName}</span>
            <a class="scope_delete" onclick=${getDeleteHandler(scopeName)}>删除</a>
          </li>`;
        })}
      </ul>
      <input
        class="input_scope_name"
        placeholder="新 scope 名称"
        value=${inputScopeName}
        oninput=${handleInput}
      />
      <button onclick=${handleAdd}>
        添加
      </button>`;
  })();

  return html`<div>
    <h2>Scope 列表</h2>
    <p class="desc">你创建的影响范围（scope）列表。每个工作区（workspace）的列表是各自独立的</p>
    ${content}
  </div>`;
});

/* ----------------
 * 函数转换
 * ---------------- */
const BranchConverter = $((initStrConvertFunc) => {
  const { curBranchName } = useConstants();
  const [savedConvertFunc, setSavedConvertFunc] = useState(initStrConvertFunc);
  const [inputConvertFunc, setInputConvertFunc] = useState(initStrConvertFunc);
  const [testCase, setTestCase] = useState(curBranchName);
  const [showHelp, setShowHelp] = useState(false);

  const testResult = useMemo(() => {
    if (!savedConvertFunc) {
      return '未填写生成函数';
    }
    try {
      const convertFunc = eval(savedConvertFunc);
      const newTestResult = convertFunc(testCase);
      return JSON.stringify(newTestResult);
    } catch (e) {
      return `函数错误：${e.name}`;
    }
  }, [testCase, savedConvertFunc]);

  const isStrFuncChanged = inputConvertFunc !== savedConvertFunc;

  const handleClickHelp = () => {
    setShowHelp(!showHelp);
  };

  const handleInputFunc = (event) => {
    setInputConvertFunc(event.target.value);
  };

  const handleInputTestCase = (event) => {
    setTestCase(event.target.value);
  };

  const handleSave = () => {
    const newFuncStr = inputConvertFunc.trim();
    setInputConvertFunc(newFuncStr);
    sendToVSCode('updateConvertFunc', newFuncStr, () => {
      setSavedConvertFunc(newFuncStr);
    });
  };

  const getHelp = () => html`<div class="help_func">
    函数的类型定义为：
    <pre>(curBranchName: string) => null | string | CommitInfo;</pre>
    <ul>
      <li>输入参数为当前分支的名称。</li>
      <li>输出为 null，则不自动生成提交信息；</li>
      <li>输出为 string，则使用它替换当前提交信息。</li>
      <li>若输出为 CommitInfo，则根据其内容，结合你选择的 commit 风格，生成提交信息。</li>
    </ul>
    CommitInfo 是一个对象，其类型定义为：
    <pre>
interface CommitInfo {
  type: string; // 提交类型
  scope?: string; // 影响范围。不填则视为：无影响范围
  message?: string; // 提交信息主体。不填则使用提交信息输入框中的内容
}</pre
    >
    <br />
    以下是一个简单的示例，在该示例中，如果分支名以 "fix" 开头，则自动生成提交信息："fix: [全局]
    修复问题"；否则生成提交信息："Not a fix"
    <pre>
(curBranchName) => {
  if (curBranchName.startsWith('fix')) {
    return { type: 'fix', scope: '全局', message: '修复问题' };
  }
  return 'Not a fix';
};
</pre
    >
  </div>`;

  return html`<div>
    <h2>提交信息生成函数</h2>
    <p class="desc">
      读取分支名，基于函数规则，自动生成提交信息。
      <a onclick=${handleClickHelp}>${showHelp ? '收起' : '如何编写函数?'}</a>
    </p>
    ${showHelp ? getHelp() : null}
    <p class="desc">
      函数保存后，可在下方测试运行结果。当前状态：${isStrFuncChanged ? '未保存' : '已保存'}
    </p>
    <div class="edit_area_func">
      <textarea
        class="input_func"
        placeholder="生成函数"
        value=${inputConvertFunc}
        oninput=${handleInputFunc}
      />
      <button class="save_func" onclick=${handleSave}>
        保存
      </button>
    </div>
    <h3>测试</h3>
    <p>
      分支名称：<input
        class="input_branch"
        placeholder="测试分支名称"
        value=${testCase}
        oninput=${handleInputTestCase}
      />
    </p>
    <p>生成结果：${testResult}</p>
  </div>`;
});

/* ----------------
 * 主入口
 * ---------------- */
const App = $(() => {
  const [initState, setInitState] = useState(null);
  const [constants, setConstants] = useState({});

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

  return html`
    ${ConstantsContext.provide(constants)}
    ${initState
      ? html`<div id="app">
          <h1>Commit Tagger 设置</h1>
          ${CommitStyleSelect(initState.commitStyle)} ${ScopeList(initState.scopeList)}
          ${BranchConverter(initState.strConvertFunc)}
        </div>`
      : html`<div>载入中</div>`}
  `;
});

render(document.body, App());

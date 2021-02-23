import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import './index.css';

window.vscode = acquireVsCodeApi();
window.callback = {};

const MOUNT_NODE = document.getElementById('app');
ReactDOM.render(<App />, MOUNT_NODE);

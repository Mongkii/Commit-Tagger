import { createRoot } from 'react-dom/client';

import App from './components/App';
import './index.css';

window.vscode = acquireVsCodeApi();
window.callback = {};

const MOUNT_NODE = document.getElementById('app');
const root = createRoot(MOUNT_NODE!);
root.render(<App />);

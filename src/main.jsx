import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/settings.css';
import './styles/auth.css';
import './styles/departmentWorkspaces.css';
import './styles/meetings.css';
import './styles/reports.css';
import './styles/search.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

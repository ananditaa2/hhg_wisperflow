import React from 'react';
import ReactDOM from 'react-dom/client';
import { HeroPlayground } from './components/HeroPlayground';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HeroPlayground />
  </React.StrictMode>
);
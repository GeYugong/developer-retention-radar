import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() { return <main><h1>开发者留存雷达</h1><p>统一签到，实时洞察每一步转化。</p></main>; }
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

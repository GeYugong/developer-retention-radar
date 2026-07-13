import { lazy, Suspense } from 'react';
import { CheckinPage } from './CheckinPage';
import { ThemeToggle } from './ThemeToggle';
import './styles.css';

const AdminApp=lazy(()=>import('./AdminApp').then(module=>({default:module.AdminApp})));
export default function App(){ const match=location.pathname.match(/^\/checkin\/([^/]+)/); if(match)return <CheckinPage stageId={match[1]}/>; if(location.pathname.startsWith('/admin'))return <Suspense fallback={<div className="admin-loading">正在载入管理后台…</div>}><AdminApp/></Suspense>; return <main className="public-shell"><div className="standalone-theme"><ThemeToggle compact/></div><div className="state-card"><i>↗</i><h1>开发者留存雷达</h1><p>请扫描活动二维码进入对应任务节点。</p><a className="button-link" href="/admin">进入管理后台</a></div></main>; }

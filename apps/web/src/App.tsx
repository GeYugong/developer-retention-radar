import { CheckinPage } from './CheckinPage';
import { AdminApp } from './AdminApp';
import './styles.css';

export default function App(){ const match=location.pathname.match(/^\/checkin\/([^/]+)/); if(match)return <CheckinPage stageId={match[1]}/>; if(location.pathname.startsWith('/admin'))return <AdminApp/>; return <main className="public-shell"><div className="state-card"><i>↗</i><h1>开发者留存雷达</h1><p>请扫描活动二维码进入对应任务节点。</p><a className="button-link" href="/admin">进入管理后台</a></div></main>; }

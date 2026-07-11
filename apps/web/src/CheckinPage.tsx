import { FormEvent, useEffect, useState } from 'react';
import { request } from './api';
import type { Stage } from './types';

export function CheckinPage({ stageId }: { stageId:string }) {
  const [stage,setStage]=useState<Stage>(); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [done,setDone]=useState<{duplicate:boolean;name:string}>();
  useEffect(()=>{request<Stage>(`/api/public/stages/${stageId}`).then(setStage).catch(e=>setError(e.message));},[stageId]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const data=new FormData(e.currentTarget);try{const r=await request<any>(`/api/public/stages/${stageId}/checkin`,{method:'POST',body:JSON.stringify({name:data.get('name'),studentId:data.get('studentId'),phone:data.get('phone'),school:data.get('school')})});setDone({duplicate:r.duplicate,name:r.participant.name});}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  if(error&&!stage)return <Shell><State icon="!" title="无法打开签到入口" text={error}/></Shell>;
  if(!stage)return <Shell><State icon="…" title="正在加载" text="正在确认活动信息"/></Shell>;
  if(done)return <Shell><State icon="✓" title={done.duplicate?'你已完成过本阶段':'签到成功'} text={`${done.name}，${done.duplicate?'无需重复操作。':'你的进度已同步到留存雷达。'}`}/></Shell>;
  return <Shell><div className="checkin-card"><span className="eyebrow">{stage.campaign_name}</span><h1>{stage.name}</h1><p>{stage.description||'填写身份信息，完成本阶段签到。'}</p>{stage.status!=='active'&&<div className="alert">活动当前未开放，暂时不能签到。</div>}<form onSubmit={submit}><label>姓名<input name="name" required minLength={2} placeholder="请输入真实姓名"/></label><label>学号<input name="studentId" required minLength={3} placeholder="用于匹配报名信息"/></label><label>手机号<input name="phone" required inputMode="numeric" pattern="1?\d{6,14}" placeholder="用于确认身份"/></label><label>学校（选填）<input name="school" placeholder="所在学校"/></label>{error&&<div className="alert error">{error}</div>}<button disabled={busy||stage.status!=='active'}>{busy?'正在提交…':stage.kind==='registration'?'确认报名':'完成签到'}</button></form><small>信息仅用于本次训练营进度统计</small></div></Shell>;
}
function Shell({children}:{children:React.ReactNode}){return <main className="public-shell"><header><b>开发者留存雷达</b><span>统一签到 · 实时进度</span></header>{children}</main>}
function State({icon,title,text}:{icon:string;title:string;text:string}){return <div className="state-card"><i>{icon}</i><h1>{title}</h1><p>{text}</p></div>}

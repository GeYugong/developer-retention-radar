import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import { requireAdmin, signToken } from './auth.js';
import { config } from './config.js';
import { query } from './db.js';
import { buildFunnel, normalizeIdentity, percentage } from './domain.js';

export const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.PUBLIC_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api/public', rateLimit({ windowMs: 60_000, limit: 60 }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const asyncRoute = (fn: express.RequestHandler): express.RequestHandler => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const campaignSchema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().max(500).default(''), status: z.enum(['draft','active','closed']).default('draft') });
const stageSchema = z.object({ name: z.string().trim().min(2).max(50), description: z.string().max(300).default(''), kind: z.enum(['registration','checkin','submission']).default('checkin'), position: z.number().int().positive() });
const participantSchema = z.object({ name: z.string().trim().min(2).max(40), studentId: z.string().trim().min(3).max(40), phone: z.string().trim().regex(/^1?\d{6,14}$/), school: z.string().trim().max(80).default('') });

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const body = z.object({ username: z.string(), password: z.string() }).parse(req.body);
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  const validPassword = storedHash ? await bcrypt.compare(body.password, storedHash) : body.password === config.ADMIN_PASSWORD;
  if (body.username !== config.ADMIN_USERNAME || !validPassword) return void res.status(401).json({ error: '用户名或密码错误' });
  res.cookie('radar_token', signToken(body.username), { httpOnly: true, sameSite: 'lax', secure: config.NODE_ENV === 'production', maxAge: 8 * 3600_000 }).json({ username: body.username });
}));
app.post('/api/auth/logout', (_req, res) => res.clearCookie('radar_token').status(204).end());
app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ username: (req as any).admin }));

app.get('/api/campaigns', requireAdmin, asyncRoute(async (_req, res) => {
  const result = await query('SELECT * FROM campaigns ORDER BY created_at DESC'); res.json(result.rows);
}));
app.post('/api/campaigns', requireAdmin, asyncRoute(async (req, res) => {
  const b = campaignSchema.parse(req.body);
  const result = await query('INSERT INTO campaigns(name,description,status) VALUES($1,$2,$3) RETURNING *',[b.name,b.description,b.status]);
  res.status(201).json(result.rows[0]);
}));
app.patch('/api/campaigns/:id', requireAdmin, asyncRoute(async (req, res) => {
  const b = campaignSchema.partial().parse(req.body);
  const current = await query<any>('SELECT * FROM campaigns WHERE id=$1',[req.params.id]);
  if (!current.rowCount) return void res.status(404).json({ error:'活动不存在' });
  const v = {...current.rows[0],...b};
  const result = await query('UPDATE campaigns SET name=$2,description=$3,status=$4,updated_at=now() WHERE id=$1 RETURNING *',[req.params.id,v.name,v.description,v.status]); res.json(result.rows[0]);
}));
app.delete('/api/campaigns/:id', requireAdmin, asyncRoute(async (req,res)=>{ await query('DELETE FROM campaigns WHERE id=$1',[req.params.id]); res.status(204).end(); }));

app.get('/api/campaigns/:id/stages', requireAdmin, asyncRoute(async (req,res)=>{ const r=await query('SELECT * FROM stages WHERE campaign_id=$1 AND deleted_at IS NULL ORDER BY position',[req.params.id]); res.json(r.rows); }));
app.post('/api/campaigns/:id/stages', requireAdmin, asyncRoute(async (req,res)=>{ const b=stageSchema.parse(req.body); const r=await query('INSERT INTO stages(campaign_id,name,description,kind,position) VALUES($1,$2,$3,$4,$5) RETURNING *',[req.params.id,b.name,b.description,b.kind,b.position]); res.status(201).json(r.rows[0]); }));
app.patch('/api/stages/:id', requireAdmin, asyncRoute(async (req,res)=>{ const b=stageSchema.partial().parse(req.body); const cur=await query<any>('SELECT * FROM stages WHERE id=$1 AND deleted_at IS NULL',[req.params.id]); if(!cur.rowCount)return void res.status(404).json({error:'阶段不存在'}); const v={...cur.rows[0],...b}; const r=await query('UPDATE stages SET name=$2,description=$3,kind=$4,position=$5 WHERE id=$1 RETURNING *',[req.params.id,v.name,v.description,v.kind,v.position]); res.json(r.rows[0]); }));
app.delete('/api/stages/:id', requireAdmin, asyncRoute(async (req,res)=>{ await query('UPDATE stages SET deleted_at=now() WHERE id=$1',[req.params.id]); res.status(204).end(); }));

app.get('/api/public/stages/:id', asyncRoute(async (req,res)=>{ const r=await query<any>('SELECT s.*,c.name campaign_name,c.status FROM stages s JOIN campaigns c ON c.id=s.campaign_id WHERE s.id=$1 AND s.deleted_at IS NULL',[req.params.id]); if(!r.rowCount)return void res.status(404).json({error:'签到入口不存在'}); res.json(r.rows[0]); }));
app.post('/api/public/stages/:id/checkin', asyncRoute(async (req,res)=>{
  const b=participantSchema.parse(req.body); const stage=await query<any>('SELECT s.*,c.status FROM stages s JOIN campaigns c ON c.id=s.campaign_id WHERE s.id=$1 AND s.deleted_at IS NULL',[req.params.id]);
  if(!stage.rowCount)return void res.status(404).json({error:'签到入口不存在'}); if(stage.rows[0].status!=='active')return void res.status(409).json({error:'活动当前未开放'});
  const s=stage.rows[0]; let participant;
  if(s.kind==='registration') { const r=await query<any>(`INSERT INTO participants(campaign_id,name,student_id,phone,school) VALUES($1,$2,$3,$4,$5) ON CONFLICT(campaign_id,student_id) DO UPDATE SET name=EXCLUDED.name,phone=EXCLUDED.phone,school=EXCLUDED.school RETURNING *`,[s.campaign_id,b.name,normalizeIdentity(b.studentId),normalizeIdentity(b.phone),b.school]); participant=r.rows[0]; }
  else { const r=await query<any>('SELECT * FROM participants WHERE campaign_id=$1 AND (student_id=$2 OR phone=$3)',[s.campaign_id,normalizeIdentity(b.studentId),normalizeIdentity(b.phone)]); if(!r.rowCount)return void res.status(404).json({error:'未找到报名信息，请先完成报名'}); participant=r.rows[0]; }
  const result=await query<any>('INSERT INTO checkins(stage_id,participant_id,source,device) VALUES($1,$2,$3,$4) ON CONFLICT(stage_id,participant_id) DO NOTHING RETURNING id,created_at',[s.id,participant.id,'web',String(req.headers['user-agent']??'').slice(0,200)]);
  res.json({success:true,duplicate:result.rowCount===0,participant:{name:participant.name},checkedAt:result.rows[0]?.created_at});
}));

app.get('/api/campaigns/:id/analytics', requireAdmin, asyncRoute(async (req,res)=>{
  const r=await query<any>(`SELECT s.id,s.name,s.position,count(DISTINCT c.participant_id)::int count FROM stages s LEFT JOIN checkins c ON c.stage_id=s.id WHERE s.campaign_id=$1 AND s.deleted_at IS NULL GROUP BY s.id ORDER BY s.position`,[req.params.id]);
  const funnel=buildFunnel(r.rows); res.json({funnel,overallRate:funnel.length?percentage(funnel.at(-1)!.count,funnel[0].count):0});
}));
app.get('/api/campaigns/:id/participants', requireAdmin, asyncRoute(async (req,res)=>{
  const params:any[]=[req.params.id]; let filter=''; if(req.query.stageId){params.push(req.query.stageId);filter=` AND EXISTS(SELECT 1 FROM checkins x WHERE x.participant_id=p.id AND x.stage_id=$${params.length})`;}
  const r=await query<any>(`SELECT p.*,coalesce(json_agg(json_build_object('stageId',s.id,'stageName',s.name,'checkedAt',c.created_at)) FILTER(WHERE c.id IS NOT NULL),'[]') checkins FROM participants p LEFT JOIN checkins c ON c.participant_id=p.id LEFT JOIN stages s ON s.id=c.stage_id WHERE p.campaign_id=$1${filter} GROUP BY p.id ORDER BY p.created_at DESC`,params); res.json(r.rows);
}));
app.get('/api/campaigns/:id/export.csv', requireAdmin, asyncRoute(async (req,res)=>{ const r=await query<any>('SELECT name,student_id,phone,school,created_at FROM participants WHERE campaign_id=$1 ORDER BY created_at',[req.params.id]); const esc=(v:unknown)=>`"${String(v??'').replaceAll('"','""')}"`; const csv='\uFEFF姓名,学号,手机号,学校,报名时间\n'+r.rows.map(x=>[x.name,x.student_id,x.phone,x.school,x.created_at.toISOString()].map(esc).join(',')).join('\n'); res.type('text/csv').attachment('participants.csv').send(csv); }));

app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{ if(err instanceof z.ZodError)return void res.status(400).json({error:'提交信息不完整或格式不正确',details:err.issues}); if(err?.code==='23505')return void res.status(409).json({error:'数据与现有记录冲突'}); console.error(err); res.status(500).json({error:'服务器暂时无法处理请求'}); });

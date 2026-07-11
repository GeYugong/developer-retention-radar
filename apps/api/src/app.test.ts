import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const queryMock = vi.fn();
vi.mock('./db.js', () => ({ query: queryMock }));
const { app } = await import('./app.js');

describe('API', () => {
  beforeEach(() => queryMock.mockReset());
  it('reports health', async () => { const r=await request(app).get('/api/health'); expect(r.status).toBe(200); expect(r.body.status).toBe('ok'); });
  it('authenticates the configured administrator', async () => { const r=await request(app).post('/api/auth/login').send({username:'admin',password:'Radar@2026'}); expect(r.status).toBe(200); expect(r.headers['set-cookie'][0]).toContain('radar_token'); });
  it('rejects bad credentials', async () => { const r=await request(app).post('/api/auth/login').send({username:'admin',password:'wrong-pass'}); expect(r.status).toBe(401); });
  it('requires authentication for campaign data', async () => { const r=await request(app).get('/api/campaigns'); expect(r.status).toBe(401); });
  it('returns public stage information', async () => { queryMock.mockResolvedValue({rowCount:1,rows:[{id:'stage-1',name:'报名',status:'active'}]}); const r=await request(app).get('/api/public/stages/stage-1'); expect(r.status).toBe(200); expect(r.body.name).toBe('报名'); });
  it('rejects malformed check-in data before writing', async () => { queryMock.mockResolvedValue({rowCount:1,rows:[{id:'stage-1',status:'active'}]}); const r=await request(app).post('/api/public/stages/stage-1/checkin').send({name:'A'}); expect(r.status).toBe(400); });
});

import { describe, expect, it } from 'vitest';
import { buildFunnel, normalizeIdentity, percentage } from './domain.js';

describe('retention calculations', () => {
  it('calculates the required 100 → 80 → 50 funnel', () => {
    const result = buildFunnel([
      { id:'3',name:'首个任务',position:3,count:50 },
      { id:'1',name:'报名',position:1,count:100 },
      { id:'2',name:'账号开通',position:2,count:80 }
    ]);
    expect(result.map(x=>x.count)).toEqual([100,80,50]);
    expect(result.map(x=>x.conversionRate)).toEqual([100,80,62.5]);
    expect(percentage(50,100)).toBe(50);
  });
  it('handles empty stages and normalizes identifiers', () => {
    expect(percentage(3,0)).toBe(0);
    expect(normalizeIdentity(' 2026 A 01 ')).toBe('2026a01');
  });
});

import { describe, expect, it } from 'vitest';
import { generateDemoParticipants, universities985 } from './demoData.js';

describe('realistic demo data',()=>{
  it('is deterministic and covers every 985 university',()=>{
    const first=generateDemoParticipants();
    const second=generateDemoParticipants();
    expect(first).toEqual(second);
    expect(first).toHaveLength(100);
    expect(new Set(first.map(x=>x.school)).size).toBe(universities985.length);
    expect(first.every(x=>universities985.includes(x.school as typeof universities985[number]))).toBe(true);
  });

  it('keeps the required 100 to 80 to 50 to 35 funnel',()=>{
    const participants=generateDemoParticipants();
    expect([1,2,3,4].map(stage=>participants.filter(x=>x.completed>=stage).length)).toEqual([100,80,50,35]);
    expect(new Set(participants.map(x=>x.studentId)).size).toBe(100);
    expect(new Set(participants.map(x=>x.phone)).size).toBe(100);
  });
});

import { pool } from './db.js';
import { generateDemoParticipants } from './demoData.js';

export async function resetDemoData(){
  const client=await pool.connect();
  try{await client.query('BEGIN');await client.query('TRUNCATE checkins,participants,stages,campaigns CASCADE');
    const campaign=(await client.query(`INSERT INTO campaigns(name,description,status) VALUES('2026 华为云开发者实战营','用于演示统一签到与实时留存漏斗','active') RETURNING id`)).rows[0];
    const definitions=[['活动报名','填写身份信息加入训练营','registration'],['账号开通','确认华为云账号已开通','checkin'],['完成首个任务','完成第一个云端实战任务','checkin'],['最终提交','提交最终项目作品','submission']];const stages=[];
    for(let i=0;i<definitions.length;i++)stages.push((await client.query('INSERT INTO stages(campaign_id,name,description,kind,position) VALUES($1,$2,$3,$4,$5) RETURNING id',[campaign.id,...definitions[i],i+1])).rows[0]);
    for(const person of generateDemoParticipants()){const p=(await client.query("INSERT INTO participants(campaign_id,name,student_id,phone,school,created_at) VALUES($1,$2,$3,$4,$5,now()-($6::text||' hours')::interval) RETURNING id",[campaign.id,person.name,person.studentId,person.phone,person.school,person.signupHoursAgo])).rows[0];for(let j=0;j<person.completed;j++)await client.query("INSERT INTO checkins(stage_id,participant_id,source,device,created_at) VALUES($1,$2,$3,$4,now()-($5::text||' hours')::interval)",[stages[j].id,p.id,'demo','seed-985',person.checkinHoursAgo[j]]);}
    await client.query('COMMIT');return {campaignId:campaign.id,counts:[100,80,50,35]};
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}
if(process.argv[1]?.endsWith('seed.js'))resetDemoData().then(r=>{console.log(r);return pool.end()});

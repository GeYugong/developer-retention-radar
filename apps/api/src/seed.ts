import { pool } from './db.js';

export async function resetDemoData(){
  const client=await pool.connect();
  try{await client.query('BEGIN');await client.query('TRUNCATE checkins,participants,stages,campaigns CASCADE');
    const campaign=(await client.query(`INSERT INTO campaigns(name,description,status) VALUES('2026 华为云开发者实战营','用于演示统一签到与实时留存漏斗','active') RETURNING id`)).rows[0];
    const definitions=[['活动报名','填写身份信息加入训练营','registration'],['账号开通','确认华为云账号已开通','checkin'],['完成首个任务','完成第一个云端实战任务','checkin'],['最终提交','提交最终项目作品','submission']];const stages=[];
    for(let i=0;i<definitions.length;i++)stages.push((await client.query('INSERT INTO stages(campaign_id,name,description,kind,position) VALUES($1,$2,$3,$4,$5) RETURNING id',[campaign.id,...definitions[i],i+1])).rows[0]);
    for(let i=1;i<=100;i++){const p=(await client.query('INSERT INTO participants(campaign_id,name,student_id,phone,school) VALUES($1,$2,$3,$4,$5) RETURNING id',[campaign.id,`学员${String(i).padStart(3,'0')}`,`2026${String(i).padStart(4,'0')}`,`138${String(i).padStart(8,'0')}`,'示范大学'])).rows[0];const completed=i<=35?4:i<=50?3:i<=80?2:1;for(let j=0;j<completed;j++)await client.query('INSERT INTO checkins(stage_id,participant_id,source,device,created_at) VALUES($1,$2,$3,$4,now()-($5::text||\' hours\')::interval)',[stages[j].id,p.id,'demo','seed',100-i]);}
    await client.query('COMMIT');return {campaignId:campaign.id,counts:[100,80,50,35]};
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}
if(process.argv[1]?.endsWith('seed.js'))resetDemoData().then(r=>{console.log(r);return pool.end()});

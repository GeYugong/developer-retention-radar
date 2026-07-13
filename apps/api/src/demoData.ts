export const universities985 = [
  '北京大学','清华大学','中国人民大学','北京航空航天大学','北京理工大学','中国农业大学','北京师范大学','中央民族大学',
  '南开大学','天津大学','东北大学','吉林大学','哈尔滨工业大学','复旦大学','同济大学','上海交通大学','华东师范大学',
  '南京大学','东南大学','浙江大学','中国科学技术大学','厦门大学','山东大学','中国海洋大学','武汉大学','华中科技大学','湖南大学',
  '中南大学','国防科技大学','中山大学','华南理工大学','四川大学','电子科技大学','重庆大学','西安交通大学','西北工业大学',
  '西北农林科技大学','兰州大学'
] as const;

type DemoParticipant = {
  name:string;
  studentId:string;
  phone:string;
  school:string;
  completed:number;
  signupHoursAgo:number;
  checkinHoursAgo:number[];
};

function seededRandom(seed:number){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffle<T>(values:T[],random:()=>number){for(let i=values.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}return values}

export function generateDemoParticipants(seed=20260713):DemoParticipant[]{
  const random=seededRandom(seed);
  const surnames=['王','李','张','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧'];
  const given=['子轩','雨桐','浩然','思远','嘉怡','宇航','欣妍','博文','若曦','明哲','梓涵','俊杰','诗琪','天佑','睿哲','佳宁','昊宇','语晨','文昊','一诺'];
  const schools=[...universities985,...Array.from({length:100-universities985.length},()=>universities985[Math.floor(random()*universities985.length)])];
  shuffle(schools,random);
  const completion=[...Array(35).fill(4),...Array(15).fill(3),...Array(30).fill(2),...Array(20).fill(1)];
  shuffle(completion,random);
  const phoneOrder=shuffle(Array.from({length:100},(_,i)=>i),random);
  return Array.from({length:100},(_,i)=>{
    const signupHoursAgo=Math.floor(72+random()*648);
    const completed=completion[i];
    const checkinHoursAgo=Array.from({length:completed},(_,stage)=>Math.max(1,signupHoursAgo-stage*Math.floor(8+random()*48)));
    return {
      name:`${surnames[Math.floor(random()*surnames.length)]}${given[Math.floor(random()*given.length)]}`,
      studentId:`${2022+i%4}${String(31000000+i*137+Math.floor(random()*97)).padStart(8,'0')}`,
      phone:`${['135','136','137','138','139','150','156','158','188'][i%9]}${String(10000000+phoneOrder[i]*7919).slice(-8)}`,
      school:schools[i],
      completed,
      signupHoursAgo,
      checkinHoursAgo
    };
  });
}

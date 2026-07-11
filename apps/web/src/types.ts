export type Campaign = { id:string; name:string; description:string; status:'draft'|'active'|'closed'; created_at:string };
export type Stage = { id:string; campaign_id:string; campaign_name?:string; name:string; description:string; kind:'registration'|'checkin'|'submission'; position:number; status?:string };
export type FunnelItem = Stage & { count:number; conversionRate:number };
export type Participant = { id:string; name:string; student_id:string; phone:string; school:string; created_at:string; checkins:Array<{stageId:string;stageName:string;checkedAt:string}> };

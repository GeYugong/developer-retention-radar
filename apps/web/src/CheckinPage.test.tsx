import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckinPage } from './CheckinPage';

afterEach(()=>vi.restoreAllMocks());
describe('participant check-in',()=>{
  it('renders stage and reports successful check-in',async()=>{
    const fetchMock=vi.spyOn(globalThis,'fetch');
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({id:'s1',name:'活动报名',campaign_name:'数据库实战营',description:'填写报名信息',kind:'registration',status:'active'}),{status:200,headers:{'Content-Type':'application/json'}}));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({success:true,duplicate:false,participant:{name:'张三'}}),{status:200,headers:{'Content-Type':'application/json'}}));
    render(<CheckinPage stageId="s1"/>); expect(await screen.findByText('活动报名')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('请输入真实姓名'),{target:{value:'张三'}});fireEvent.change(screen.getByPlaceholderText('用于匹配报名信息'),{target:{value:'2026001'}});fireEvent.change(screen.getByPlaceholderText('用于确认身份'),{target:{value:'13800138000'}});fireEvent.click(screen.getByRole('button',{name:'确认报名'}));
    expect(await screen.findByText('签到成功')).toBeInTheDocument(); await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));
  });
  it('shows a closed activity state',async()=>{vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({id:'s1',name:'最终提交',campaign_name:'实战营',kind:'submission',status:'closed'}),{status:200,headers:{'Content-Type':'application/json'}}));render(<CheckinPage stageId="s1"/>);expect(await screen.findByText('活动当前未开放，暂时不能签到。')).toBeInTheDocument();expect(screen.getByRole('button',{name:'完成签到'})).toBeDisabled();});
});

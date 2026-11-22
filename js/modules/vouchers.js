// modules/vouchers
import { ask, render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { S } from '../core/state.js';
import { $, ap, bd, dt, nmc, norm, now, toast } from '../core/utils.js';
import { L, bal } from './points.js';
import { sendSms } from './sms.js';
import { errText } from '../services/api.js';
import { svc } from '../services/index.js';

export function award(v,cid){const c=S.cs.find(x=>x.id==cid);v.st='AWARDED';v.c=cid;if(v.type=='POINTS'){L(S,cid,'VOUCHER',v.val,'Voucher '+v.code);v.st='REDEEMED'}sendSms(S,c,'voucher',{code:v.code,val:v.type=='POINTS'?v.val+' pts':'KES '+v.val,bal:bal(S,cid)});S.audit.push({at:now(),a:'AWARD '+v.code+' '+c.phone})}

export async function mkV(){const v=+$('#vv').value,t=$('#vt').value;if(!v)return toast('Enter a value');try{await svc.createVoucher({type:t,value:v});toast('Voucher created')}catch(e){toast(errText(e))}render()}

export async function bulkV(){try{await svc.bulkVouchers({type:'DISCOUNT',value:20,count:5});toast('5 vouchers added')}catch(e){toast(errText(e))}render()}

export function asgV(id){ask('Customer phone',async v=>{const p=norm(v||'');if(!p)return toast('Enter a valid phone');try{await svc.assignVoucher({id,phone:p});toast('Voucher assigned')}catch(e){toast(errText(e))}render()},1)}

export function voS(id,st){const go=async()=>{try{await svc.setVoucherStatus({id,status:st})}catch(e){toast(errText(e))}render()};st=='VOID'?ask('Void this voucher?',go):go()}

export function vact(v){return(v.st=='AVAILABLE'?`<button class="s" data-on-click="modules_vouchers_1" ${ap([v.id],'click')}>Assign</button> `:'')+(v.st=='AWARDED'?`<button data-on-click="modules_vouchers_2" ${ap([v.id],'click')}>Mark redeemed</button> `:'')+(v.st=='AVAILABLE'||v.st=='AWARDED'?`<button class="d" data-on-click="modules_vouchers_3" ${ap([v.id],'click')}>Void</button>`:'')}

export function vouchUI2(){const V=S.vo.slice().reverse();return`<h2>Vouchers</h2><div class="split rv"><div class="card"><h3>Create voucher</h3><select id="vt"><option>DISCOUNT</option><option>AIRTIME</option><option>POINTS</option></select><input id="vv" inputmode="numeric" placeholder="Value"><button class="big" data-on-click="modules_vouchers_4">Create voucher</button><button class="s big" style="margin-top:8px" data-on-click="modules_vouchers_5">Bulk add 5 demo vouchers</button></div><div><table class="tb"><thead><tr><th>Code<th>Type<th>Value<th>Status<th>Customer<th>Created<th>Actions</tr></thead>${V.map(v=>`<tr><td><b>${v.code}</b><td>${v.type}<td>${v.val}<td>${bd(v.st)}<td>${v.c?nmc(v.c):'-'}<td>${dt(v.at)}<td>${vact(v)}`).join('')}</table><div class="mv">${V.map(v=>`<div class="card"><div class="li"><b>${v.code}</b>${bd(v.st)}</div><span class="mu">${v.type} ${v.val} · ${v.c?nmc(v.c):'unassigned'}</span><div class="row" style="margin-top:8px">${vact(v)}</div></div>`).join('')}</div></div></div>`}

registerActions({
modules_vouchers_1(p,event){event.stopPropagation();asgV(p[0])},
modules_vouchers_2(p,event){voS(p[0],'REDEEMED')},
modules_vouchers_3(p,event){voS(p[0],'VOID')},
modules_vouchers_4(p,event){mkV()},
modules_vouchers_5(p,event){bulkV()}
});

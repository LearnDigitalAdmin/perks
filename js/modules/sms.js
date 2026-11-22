// modules/sms
import { render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { TPL } from '../core/constants.js';
import { S, view } from '../core/state.js';
import { $, ap, bd, dt, esc, fx, money, now, toast } from '../core/utils.js';
import { errText } from '../services/api.js';
import { svc } from '../services/index.js';
import { isLive } from '../services/runtime.js';
import { DEMO_PLACEHOLDERS, LIVE_PLACEHOLDERS, OPT_OUT, fillTemplate } from '../services/templates.js';

export function sendSms(S,c,type,vars,at){let b=(S.tpl&&S.tpl[type]||TPL[type]).replace(/{(\w+)}/g,(m,k)=>vars[k]);let camp=null;
 if(c.mkt){const td=now().slice(0,10);camp=S.camps.find(k=>k.id==S.act&&k.on&&(!k.end||k.end>=td)&&(!k.start||k.start<=td));if(camp)b+=' '+camp.ad+' '+(camp.url||'https://perks.samuhia.co.ke')+' Opt out: perks.samuhia.co.ke'}
 const fail=!at&&Math.random()<0.0;S.sms.push({id:'m'+S.sms.length,phone:c.phone,type,camp:camp&&camp.name,msg:b,st:fail?'FAILED':'SENT',cost:S.cfg.sms,at:at||now()})}

export function tp(){const t=$('#tb').value,cp=S.camps.find(k=>k.id==S.act);$('#tpv').innerHTML='<p>'+esc(fillTemplate(t))+'</p>'+(cp?'<p class="mu">+ '+cp.ad+' '+esc(cp.url||'https://perks.samuhia.co.ke')+' '+OPT_OUT+'</p>':'<p class="mu">No active campaign: messages go out without an advert.</p>')}
export const placeholderChips=()=>isLive()?LIVE_PLACEHOLDERS.map(x=>'{{'+x+'}}'):DEMO_PLACEHOLDERS.map(x=>'{'+x+'}');

export async function retry(id){try{await svc.retrySms(id);toast('Retry sent')}catch(e){toast(errText(e))}render()}

export function sms3(){const f=view.sf||'all',M=S.sms.filter(m=>(f=='all'||(f=='FAILED'?m.st=='FAILED':m.type==f))&&m.phone.includes(fx(view.sq))).slice().reverse().slice(0,40),o=S.sms.find(m=>m.id==view.sm);
return`<h2>SMS Centre</h2><p class="mu">Simulated only. ${S.sms.length} messages · ${money(S.sms.length*S.cfg.sms)} est.</p><div class="bar"><input placeholder="Search phone" value="${view.sq||''}" data-on-change="modules_sms_6"><select data-on-change="modules_sms_7">${[['all','All'],['sale','Receipts'],['ref','Referral'],['redeem','Redemption'],['voucher','Voucher'],['welcome','Welcome'],['FAILED','Failed']].map(o=>`<option value="${o[0]}"${o[0]==f?' selected':''}>${o[1]}</option>`).join('')}</select></div>${o?`<div class="card"><h3>${o.id} · ${o.phone}</h3><p>${o.msg}</p><p class="mu">${o.type} · campaign: ${o.camp||'none (no marketing consent)'} · ${bd(o.st)} · KES ${o.cost.toFixed(2)} · ${dt(o.at)}</p><div class="row">${o.st=='FAILED'?`<button data-on-click="modules_sms_1" ${ap([o.id],'click')}>Retry</button>`:''}<button class="s" data-on-click="modules_sms_2">Close</button></div></div>`:''}<table class="tb"><thead><tr><th>Recipient<th>Type<th>Campaign<th>Message<th>Status<th>Cost<th>Time<th></tr></thead>${M.map(m=>`<tr class="cr" data-on-click="modules_sms_4" ${ap([m.id],'click')} role="button" tabindex="0"><td>${m.phone}<td>${m.type}<td>${m.camp||'-'}<td>${m.msg.slice(0,55)}…<td>${bd(m.st)+(m.delivery&&m.delivery!=='UNKNOWN'?' '+bd(m.delivery):'')}<td>${m.cost.toFixed(2)}<td>${dt(m.at)}<td>${m.st=='FAILED'?`<button data-on-click="modules_sms_3" ${ap([m.id],'click')}>Retry</button>`:''}`).join('')}</table><div class="mv">${M.map(m=>`<div class="card"><div class="li"><b>${m.phone}</b>${bd(m.st)+(m.delivery&&m.delivery!=='UNKNOWN'?' '+bd(m.delivery):'')}</div><p style="margin:0;font-size:14px">${m.msg}</p><span class="mu">${m.type} · ${m.camp?'campaign: '+m.camp:'no promo (no consent)'} · KES ${m.cost.toFixed(2)}</span>${m.st=='FAILED'?`<button style="margin-top:8px" data-on-click="modules_sms_5" ${ap([m.id],'click')}>Retry</button>`:''}</div>`).join('')}</div>`}

export function tplUI2(){const k=view.tk||'sale',b=S.tpl[k],at=S.tplAt||{};return`<h2>SMS Templates</h2><div class="split"><div class="card"><select data-on-change="modules_sms_10">${Object.keys(S.tpl).map(x=>`<option${x==k?' selected':''}>${x}</option>`).join('')}</select><textarea id="tb" rows="6" data-on-input="modules_sms_11">${b}</textarea><p class="mu" id="cc"></p><div>${placeholderChips().map(p=>`<span class="pill" style="cursor:pointer;margin-right:4px" data-on-click="modules_sms_8" ${ap([p],'click')} role="button" tabindex="0">${p}</span>`).join('')}</div><p class="mu">Last updated ${at[k]?dt(at[k]):'seed'}. Campaign adverts attach automatically, only with marketing consent.</p><button class="big" data-on-click="modules_sms_12" ${ap([k,k],'click')}>Save template</button></div><div><div class="card"><h3>Live preview with campaign</h3><div id="tpv"></div></div><div class="card"><h3>All templates</h3>${Object.keys(S.tpl).map(x=>`<div class="li" style="cursor:pointer" data-on-click="modules_sms_9" ${ap([x],'click')} role="button" tabindex="0"><span>${x}</span><span class="mu">${S.tpl[x].length} chars</span></div>`).join('')}</div></div></div>`}

export function ins(p){const t=$('#tb');t.value+=p;tp();cc()}

export function cc(){const n=$('#tb').value.length;$('#cc').textContent=n+' chars · '+Math.ceil(n/160)+' SMS segment(s)'}

registerActions({
modules_sms_1(p,event){retry(p[0])},
modules_sms_2(p,event){view.sm=null;render()},
modules_sms_3(p,event){event.stopPropagation();retry(p[0])},
modules_sms_4(p,event){view.sm=p[0];render()},
modules_sms_5(p,event){retry(p[0])},
modules_sms_6(p,event){view.sq=this.value;render()},
modules_sms_7(p,event){view.sf=this.value;render()},
modules_sms_8(p,event){ins(p[0])},
modules_sms_9(p,event){view.tk=p[0];render()},
modules_sms_10(p,event){view.tk=this.value;render()},
modules_sms_11(p,event){tp();cc()},
async modules_sms_12(p,event){try{await svc.saveTemplate({id:p[0],body:$('#tb').value});toast('Template saved')}catch(e){toast(errText(e))}render()}
});

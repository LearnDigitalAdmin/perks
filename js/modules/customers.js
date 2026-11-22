// modules/customers
import { ask, render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { S, view } from '../core/state.js';
import { ap, bd, fx, money, nmc, norm, toast } from '../core/utils.js';
import { bal } from './points.js';
import { errText } from '../services/api.js';
import { svc } from '../services/index.js';

export function custList2(){const q=view.q||'',C=S.cs.filter(c=>c.phone.includes(fx(q))),sp=c=>c.spend??S.tx.filter(t=>t.c==c.id&&t.status=='COMPLETED').reduce((a,t)=>a+t.elig,0),n=c=>c.txCount??S.tx.filter(t=>t.c==c.id).length,sel=view.c?S.cs.find(x=>x.id==view.c):null;
return`<h2>Customers</h2><div class="bar"><input placeholder="Search phone" value="${q}" data-on-change="modules_customers_4"><button data-on-click="modules_customers_5">+ Add customer</button></div><div class="split${sel?' sel':''}"><div><table class="tb"><thead><tr><th>Phone<th>Points<th>Value<th>Lifetime spend<th>Sales<th>Code<th>Registered<th>Marketing</tr></thead>${C.map(c=>`<tr class="cr" data-on-click="modules_customers_1" ${ap([c.id],'click')} role="button" tabindex="0"><td><b>${c.phone}</b><td>${bal(S,c.id)}<td>${money(bal(S,c.id)/5)}<td>${money(sp(c))}<td>${n(c)}<td>${c.code}<td>${new Date(c.created).toLocaleDateString('en-KE')}<td>${c.mkt?'Yes':'No'}`).join('')}</table><div class="mv">${C.map(c=>`<div class="card" data-on-click="modules_customers_2" ${ap([c.id],'click')} role="button" tabindex="0"><div class="li"><b>${c.phone}</b><b>${bal(S,c.id)} pts</b></div><span class="mu">${money(bal(S,c.id)/5)} · spend ${money(sp(c))} · ${n(c)} sales · ${c.code} · marketing ${c.mkt?'yes':'no'}</span></div>`).join('')}</div></div><div>${sel?`<button class="s mv" data-on-click="modules_customers_3">← Back</button>`+prof2(sel):'<p class="mu">Select a customer to see their profile.</p>'}</div></div>`}

export function addCust(){ask('Customer phone',v=>addC2(v),1)}

export async function addC2(v){const p=norm(v||'');if(!p)return toast('Invalid phone');try{const id=await svc.addCustomer(p);view.c=id;toast('Customer ready')}catch(e){toast(errText(e))}render()}

export async function c_t(id){const c=S.cs.find(y=>y.id==id);if(!c)return;try{await svc.setConsent({customer:c,value:!c.mkt})}catch(e){toast(errText(e))}render()}

export function prof2(c){const L2=(t,rows)=>`<div class="card"><h3>${t}</h3>${rows.join('')||'<span class="mu">None</span>'}</div>`;return`<div class="pts"><b>${bal(S,c.id)} pts</b>${money(bal(S,c.id)/5)} · ${c.phone} · code ${c.code}</div><div class="card" style="margin-top:12px"><div class="li"><span>Marketing consent</span><button class="s" data-on-click="modules_customers_6" ${ap([c.id],'click')}>${c.mkt?'Opted in':'Opted out'}</button></div></div>${L2('Transactions',S.tx.filter(t=>t.c==c.id).slice(-6).reverse().map(t=>`<div class="li"><span>${t.id} ${t.items.map(i=>i.name).join(', ')}</span><span>${money(t.total)} ${bd(t.status)}</span></div>`))}${L2('Points ledger',S.led.filter(l=>l.c==c.id).slice(-8).reverse().map(l=>`<div class="li"><span>${l.desc}<br><span class="mu">${l.type}</span></span><span>${l.pts>0?'+':''}${l.pts} → ${l.after}</span></div>`))}${L2('Vouchers and referrals',[...S.vo.filter(v=>v.c==c.id).map(v=>`<div class="li"><span>${v.code}</span>${bd(v.st)}</div>`),...S.refs.filter(r=>r.from==c.id||r.to==c.id).map(r=>`<div class="li"><span>${nmc(r.from)} → ${nmc(r.to)}</span>${bd(r.st)}</div>`)])}${L2('SMS history',S.sms.filter(m=>m.phone==c.phone).slice(-5).reverse().map(m=>`<div class="li"><span>${m.msg.slice(0,80)}…</span>${bd(m.st)}</div>`))}`}

registerActions({
async modules_customers_1(p,event){view.c=p[0];render();try{await svc.openCustomer(p[0]);render()}catch(e){toast(errText(e))}},
async modules_customers_2(p,event){view.c=p[0];render();try{await svc.openCustomer(p[0]);render()}catch(e){toast(errText(e))}},
modules_customers_3(p,event){view.c=null;render()},
modules_customers_4(p,event){view.q=this.value;render()},
modules_customers_5(p,event){addCust()},
modules_customers_6(p,event){c_t(p[0])}
});

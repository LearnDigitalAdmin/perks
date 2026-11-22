// modules/transactions
import { ask, go, render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { CAT } from '../core/constants.js';
import { D, S, done, lock, newDraft, setD, setDone, setLock, view } from '../core/state.js';
import { $, ap, bd, dt, fx, money, norm, now, toast } from '../core/utils.js';
import { L, bal, calc } from './points.js';
import { sendSms } from './sms.js';
import { errText, newKey } from '../services/api.js';
import { svc } from '../services/index.js';

export function post(S,phone,items,nonElig,at,quiet){
 let c=S.cs.find(x=>x.phone==phone),isNew=!c;if(!c){c={id:'c'+(S.cs.length+1),phone,code:Math.random().toString(36).slice(2,8).toUpperCase(),mkt:false,by:null,created:at||now()};S.cs.push(c);if(S.tpl)sendSms(S,c,'welcome',{code:c.code},at)}
 const it=calc(S,items),elig=it.reduce((a,i)=>a+i.price,0),pts=it.reduce((a,i)=>a+i.pts,0),total=elig+nonElig;
 const t={id:'T'+String(1000+S.tx.length),c:c.id,phone,items:it,total,elig,pts,status:'COMPLETED',at:at||now()};S.tx.push(t);
 L(S,c.id,'EARN',pts,'Sale '+t.id,at);if(!quiet||true)sendSms(S,c,'sale',{amount:total,pts,bal:bal(S,c.id),val:bal(S,c.id)*20/100},at);
 const r=S.refs.find(r=>r.to==c.id&&r.st=='PENDING');
 if(r&&elig>S.cfg.refMin){r.st='REWARDED';r.amt=elig;r.txId=t.id;const f=S.cs.find(x=>x.id==r.from);
  L(S,f.id,'REFERRAL',S.cfg.ref,'Referral reward',at);L(S,c.id,'REFERRAL',S.cfg.inv,'Welcome referral reward',at);
  sendSms(S,f,'ref',{pts:S.cfg.ref,bal:bal(S,f.id)},at);sendSms(S,c,'ref',{pts:S.cfg.inv,bal:bal(S,c.id)},at);t.refRewarded=true}
 return{t,c,isNew}}

export function saleUI(){if(done)return doneUI();
 return`<h2>New Sale</h2><div class="card"><label>Customer phone</label><input id="ph" inputmode="tel" placeholder="07XX XXX XXX" value="${D.phone}" data-on-input="modules_transactions_4"><div id="lk"></div></div>
<div class="card"><h3>Items</h3><div id="its">${D.items.map((it,i)=>`<div class="row"><select data-on-change="modules_transactions_1" ${ap([i],'change')}>${['SERVICE','PRODUCT'].map(t=>`<optgroup label="${t=='SERVICE'?'Services':'Products'}">${CAT[t].map(n=>`<option${n==it.name?' selected':''}>${n}</option>`).join('')}</optgroup>`).join('')}</select><input class="n" style="width:110px" inputmode="numeric" placeholder="KES" value="${it.price}" data-on-input="modules_transactions_2" ${ap([i],'input')}><button class="n d" data-on-click="modules_transactions_3" ${ap([i],'click')}>✕</button></div>`).join('')}</div>
<button class="s" style="width:100%" data-on-click="modules_transactions_5">+ Add item</button>
<label style="display:block;margin-top:10px">Non-eligible charges (e.g. government fees, earn 0 points)</label><input inputmode="numeric" value="${D.ne}" data-on-input="modules_transactions_6"></div>
<div class="card"><label>Referral code (optional)</label><input value="${D.ref}" data-on-input="modules_transactions_7" style="text-transform:uppercase"><div id="rf" class="mu"></div></div>
<div class="card" id="rv"></div><button class="big" id="rec" data-on-click="modules_transactions_8">RECORD SALE</button>`}

export function parse(){const ph=norm(D.phone),items=D.items.filter(i=>+i.price>0).map(i=>({name:i.name,price:Math.round(+i.price)})),ne=Math.max(0,Math.round(+D.ne||0));return{ph,items,ne}}

export function upd(soft){D.key=newKey();const{ph,items,ne}=parse(),c=ph&&S.cs.find(x=>x.phone==ph);
 $('#lk').innerHTML=!D.phone?'':!ph?'<span class="err">Enter a valid Kenyan number</span>':c?`<div class="ok">Returning customer · ${bal(S,c.id)} pts (${money(bal(S,c.id)/5)})</div>`:'<div class="ok warn">New customer</div>';
 const rc=D.ref&&S.cs.find(x=>x.code==D.ref);$('#rf').innerHTML=!D.ref?'':rc?`Valid: invited by ${rc.phone}${c&&c.id==rc.id?' <span class=err>(self-referral not allowed)</span>':''}`:'<span class=err>Code not found</span>';
 const it=calc(S,items),pts=it.reduce((a,i)=>a+i.pts,0),elig=it.reduce((a,i)=>a+i.price,0),b=c?bal(S,c.id):0,camp=S.camps.find(k=>k.id==S.act);
 $('#rv').innerHTML=`<h3>Review</h3>${it.map(i=>`<div class="li"><span>${i.name} <span class="mu">${i.type.toLowerCase()} @${i.rate}/100</span></span><span>${money(i.price)} · +${i.pts}</span></div>`).join('')}<div class="li"><b>Total</b><b>${money(elig+ne)}</b></div><div class="li"><span>Eligible</span><span>${money(elig)}</span></div><div class="li"><span>Points earned</span><b>${pts}</b></div><div class="li"><span>Balance after</span><b>${b+pts} pts</b></div><p class="mu">SMS advert: ${c&&!c.mkt?'none (no marketing consent)':camp?camp.name:'none'}</p>`}

export function record(){if(lock)return;const q=parse();if(!q.ph||!q.items.length)return toast('Enter a valid phone and at least one priced item');ask('Record sale of '+money(q.items.reduce((a,i)=>a+i.price,0)+q.ne)+' for '+q.ph+'?',rec2)}

export async function rec2(){
  if(lock)return;
  const{ph,items,ne}=parse();
  if(!ph)return toast('Enter a valid phone number');
  if(!items.length)return toast('Add at least one item with a price');
  setLock(true);
  const b=$('#rec');if(b){b.disabled=true;b.textContent='Recording…'}
  try{const r=await svc.recordSale({phone:ph,items,ne,ref:D.ref,key:D.key});setDone(r);setD(newDraft())}
  catch(e){toast(errText(e))}
  finally{setLock(false);render()}
}

export function doneUI(){const d=done;return`<div class="card"><h2 style="color:var(--ac)">✓ Sale recorded successfully</h2><div class="li"><span>Customer</span><span>${d.c.phone}</span></div><div class="li"><span>Total</span><span>${money(d.t.total)}</span></div><div class="li"><span>Points earned</span><b>${d.t.pts}</b></div><div class="li"><span>New balance</span><b>${d.bal} pts</b></div>${d.t.refRewarded?'<div class="ok">Referral rewarded: inviter +50, invitee +30</div>':''}<div class="li"><span>SMS</span><span class="pill">SENT (simulated)</span></div><button class="big" data-on-click="modules_transactions_9">New Sale</button><button class="s big" style="margin-top:8px" data-on-click="modules_transactions_10">View Customer</button></div>`}

export function rev(id){
  const t=S.tx.find(x=>x.id==id);if(!t)return;
  return ask('Reason for reversal',async r=>{if(!r||r.trim().length<3)return toast('Give a reason (3 or more characters)');try{await svc.reverseSale({id,reason:r.trim()});toast('Sale reversed')}catch(e){toast(errText(e))}render()},1)
}

export function txUI2(){const f=view,T=S.tx.filter(t=>t.phone.includes(fx(f.tq))&&(!f.ts||t.status==f.ts)&&(!f.tc||t.items.some(i=>i.type==f.tc))&&(!f.tm||t.total>=+f.tm)&&(!f.td||t.at.slice(0,10)>=f.td)).slice().reverse(),sm=t=>{const m=S.sms.find(x=>x.phone==t.phone&&x.type=='sale'&&Math.abs(new Date(x.at)-new Date(t.at))<6e4);return m?m.st:'-'},rc=S.tx.find(t=>t.id==f.rt),op=(id,l,v)=>`<option value="${id}"${id==v?' selected':''}>${l}</option>`;
return`<h2>Transactions</h2><div class="bar"><input placeholder="Phone" value="${f.tq||''}" data-on-change="modules_transactions_15"><select data-on-change="modules_transactions_16">${op('','Any status',f.ts)}${op('COMPLETED','Completed',f.ts)}${op('REVERSED','Reversed',f.ts)}</select><select data-on-change="modules_transactions_17">${op('','Any category',f.tc)}${op('SERVICE','Services',f.tc)}${op('PRODUCT','Products',f.tc)}</select><input inputmode="numeric" placeholder="Min KES" value="${f.tm||''}" data-on-change="modules_transactions_18"><input type="date" value="${f.td||''}" data-on-change="modules_transactions_19"></div>${rc?`<div class="card"><h3>Receipt ${rc.id} · ${rc.phone} · ${dt(rc.at)}</h3>${rc.items.map(i=>`<div class="li"><span>${i.name} (${i.type})</span><span>${money(i.price)} · ${i.pts} pts @${i.rate}</span></div>`).join('')}<div class="li"><span>Total / eligible</span><b>${money(rc.total)} / ${money(rc.elig)}</b></div>${rc.reason?'<p>Reversed: '+rc.reason+'</p>':''}<div class="row">${rc.status=='COMPLETED'?`<button class="d" data-on-click="modules_transactions_11" ${ap([rc.id],'click')}>Reverse sale</button>`:''}<button class="s" data-on-click="modules_transactions_12">Close</button></div></div>`:''}<table class="tb"><thead><tr><th>ID<th>Phone<th>Items<th>Total<th>Eligible<th>Points<th>Date<th>SMS<th>Status<th>Operator</tr></thead>${T.map(t=>`<tr class="cr" data-on-click="modules_transactions_13" ${ap([t.id],'click')} role="button" tabindex="0"><td><b>${t.id}</b><td>${t.phone}<td>${t.items.map(i=>i.name).join(', ')}<td>${money(t.total)}<td>${money(t.elig)}<td>+${t.pts}<td>${dt(t.at)}<td>${sm(t)}<td>${bd(t.status)}<td>admin`).join('')}</table><div class="mv">${T.map(t=>`<div class="card" data-on-click="modules_transactions_14" ${ap([t.id],'click')} role="button" tabindex="0"><div class="li"><span><b>${t.id}</b> · ${t.phone}<br><span class="mu">${dt(t.at)}</span></span><span>${money(t.total)}<br>${bd(t.status)} +${t.pts}</span></div></div>`).join('')}</div>`}

registerActions({
modules_transactions_1(p,event){D.items[p[0]].name=this.value;upd()},
modules_transactions_2(p,event){D.items[p[0]].price=this.value;upd(1)},
modules_transactions_3(p,event){D.key=newKey();D.items.splice(p[0],1);if(!D.items.length)D.items=[{name:'Printing',price:''}];render()},
modules_transactions_4(p,event){D.phone=this.value;upd()},
modules_transactions_5(p,event){D.key=newKey();D.items.push({name:'Printing',price:''});render()},
modules_transactions_6(p,event){D.ne=this.value;upd(1)},
modules_transactions_7(p,event){D.ref=this.value.toUpperCase();upd(1)},
modules_transactions_8(p,event){record()},
modules_transactions_9(p,event){go('sale')},
modules_transactions_10(p,event){view.c=done.c.id;go('cust')},
modules_transactions_11(p,event){rev(p[0])},
modules_transactions_12(p,event){view.rt=null;render()},
modules_transactions_13(p,event){view.rt=p[0];render()},
modules_transactions_14(p,event){view.rt=p[0];render();scrollTo(0,0)},
modules_transactions_15(p,event){view.tq=this.value;render()},
modules_transactions_16(p,event){view.ts=this.value;render()},
modules_transactions_17(p,event){view.tc=this.value;render()},
modules_transactions_18(p,event){view.tm=this.value;render()},
modules_transactions_19(p,event){view.td=this.value;render()}
});

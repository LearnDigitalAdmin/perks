// modules/transactions
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{post,saleUI,parse,upd,record,rec2,doneUI,txUI,rev,txUI2});

function post(S,phone,items,nonElig,at,quiet){
 let c=S.cs.find(x=>x.phone==phone),isNew=!c;if(!c){c={id:'c'+(S.cs.length+1),phone,code:Math.random().toString(36).slice(2,8).toUpperCase(),mkt:false,by:null,created:at||now()};S.cs.push(c);if(S.tpl)sendSms(S,c,'welcome',{code:c.code},at)}
 const it=calc(S,items),elig=it.reduce((a,i)=>a+i.price,0),pts=it.reduce((a,i)=>a+i.pts,0),total=elig+nonElig;
 const t={id:'T'+String(1000+S.tx.length),c:c.id,phone,items:it,total,elig,pts,status:'COMPLETED',at:at||now()};S.tx.push(t);
 L(S,c.id,'EARN',pts,'Sale '+t.id,at);if(!quiet||true)sendSms(S,c,'sale',{amount:total,pts,bal:bal(S,c.id),val:bal(S,c.id)*20/100},at);
 const r=S.refs.find(r=>r.to==c.id&&r.st=='PENDING');
 if(r&&elig>S.cfg.refMin){r.st='REWARDED';r.amt=elig;r.txId=t.id;const f=S.cs.find(x=>x.id==r.from);
  L(S,f.id,'REFERRAL',S.cfg.ref,'Referral reward',at);L(S,c.id,'REFERRAL',S.cfg.inv,'Welcome referral reward',at);
  sendSms(S,f,'ref',{pts:S.cfg.ref,bal:bal(S,f.id)},at);sendSms(S,c,'ref',{pts:S.cfg.inv,bal:bal(S,c.id)},at);t.refRewarded=true}
 return{t,c,isNew}}

function saleUI(){if(done)return doneUI();
 return`<h2>New Sale</h2><div class="card"><label>Customer phone</label><input id="ph" inputmode="tel" placeholder="07XX XXX XXX" value="${D.phone}" oninput="D.phone=this.value;upd()"><div id="lk"></div></div>
<div class="card"><h3>Items</h3><div id="its">${D.items.map((it,i)=>`<div class="row"><select onchange="D.items[${i}].name=this.value;upd()">${['SERVICE','PRODUCT'].map(t=>`<optgroup label="${t=='SERVICE'?'Services':'Products'}">${CAT[t].map(n=>`<option${n==it.name?' selected':''}>${n}</option>`).join('')}</optgroup>`).join('')}</select><input class="n" style="width:110px" inputmode="numeric" placeholder="KES" value="${it.price}" oninput="D.items[${i}].price=this.value;upd(1)"><button class="n d" onclick="D.items.splice(${i},1);if(!D.items.length)D.items=[{name:'Printing',price:''}];render()">✕</button></div>`).join('')}</div>
<button class="s" style="width:100%" onclick="D.items.push({name:'Printing',price:''});render()">+ Add item</button>
<label style="display:block;margin-top:10px">Non-eligible charges (e.g. government fees, earn 0 points)</label><input inputmode="numeric" value="${D.ne}" oninput="D.ne=this.value;upd(1)"></div>
<div class="card"><label>Referral code (optional)</label><input value="${D.ref}" oninput="D.ref=this.value.toUpperCase();upd(1)" style="text-transform:uppercase"><div id="rf" class="mu"></div></div>
<div class="card" id="rv"></div><button class="big" id="rec" onclick="record()">RECORD SALE</button>`}

function parse(){const ph=norm(D.phone),items=D.items.filter(i=>+i.price>0).map(i=>({name:i.name,price:Math.round(+i.price)})),ne=Math.max(0,Math.round(+D.ne||0));return{ph,items,ne}}

function upd(soft){const{ph,items,ne}=parse(),c=ph&&S.cs.find(x=>x.phone==ph);
 $('#lk').innerHTML=!D.phone?'':!ph?'<span class="err">Enter a valid Kenyan number</span>':c?`<div class="ok">Returning customer · ${bal(S,c.id)} pts (${money(bal(S,c.id)/5)})</div>`:'<div class="ok warn">New customer</div>';
 const rc=D.ref&&S.cs.find(x=>x.code==D.ref);$('#rf').innerHTML=!D.ref?'':rc?`Valid: invited by ${rc.phone}${c&&c.id==rc.id?' <span class=err>(self-referral not allowed)</span>':''}`:'<span class=err>Code not found</span>';
 const it=calc(S,items),pts=it.reduce((a,i)=>a+i.pts,0),elig=it.reduce((a,i)=>a+i.price,0),b=c?bal(S,c.id):0,camp=S.camps.find(k=>k.id==S.act);
 $('#rv').innerHTML=`<h3>Review</h3>${it.map(i=>`<div class="li"><span>${i.name} <span class="mu">${i.type.toLowerCase()} @${i.rate}/100</span></span><span>${money(i.price)} · +${i.pts}</span></div>`).join('')}<div class="li"><b>Total</b><b>${money(elig+ne)}</b></div><div class="li"><span>Eligible</span><span>${money(elig)}</span></div><div class="li"><span>Points earned</span><b>${pts}</b></div><div class="li"><span>Balance after</span><b>${b+pts} pts</b></div><p class="mu">SMS advert: ${c&&!c.mkt?'none (no marketing consent)':camp?camp.name:'none'}</p>`}

function record(){if(lock)return;const q=parse();if(!q.ph||!q.items.length)return toast('Enter a valid phone and at least one priced item');ask('Record sale of '+money(q.items.reduce((a,i)=>a+i.price,0)+q.ne)+' for '+q.ph+'?',rec2)}

function rec2(){if(lock)return;const{ph,items,ne}=parse();if(!ph)return toast('Enter a valid phone number');if(!items.length)return toast('Add at least one item with a price');
 let c=S.cs.find(x=>x.phone==ph);const rc=D.ref&&S.cs.find(x=>x.code==D.ref);if(D.ref&&!rc)return toast('Invalid referral code');if(rc&&c&&rc.id==c.id)return toast('Self-referral not allowed');
 lock=true;$('#rec').disabled=true;$('#rec').textContent='Recording…';
 setTimeout(()=>{const r=post(S,ph,items,ne);if(rc&&r.isNew&&!r.c.by){r.c.by=rc.id;if(r.t.elig>S.cfg.refMin){S.refs.push({id:'r'+(S.refs.length+1),from:rc.id,to:r.c.id,amt:0,st:'PENDING'});const x=S.refs[S.refs.length-1];S.refs.pop();/* reuse post logic */
   x.st='REWARDED';x.amt=r.t.elig;x.txId=r.t.id;S.refs.push(x);L(S,rc.id,'REFERRAL',S.cfg.ref,'Referral reward');L(S,r.c.id,'REFERRAL',S.cfg.inv,'Welcome referral reward');sendSms(S,rc,'ref',{pts:S.cfg.ref,bal:bal(S,rc.id)});sendSms(S,r.c,'ref',{pts:S.cfg.inv,bal:bal(S,r.c.id)});r.t.refRewarded=true}
  else S.refs.push({id:'r'+(S.refs.length+1),from:rc.id,to:r.c.id,amt:0,st:'PENDING'})}
  save();lock=false;done={...r,bal:bal(S,r.c.id)};D={phone:'',items:[{name:'Printing',price:''}],ne:'',ref:''};render()},500)}

function doneUI(){const d=done;return`<div class="card"><h2 style="color:var(--ac)">✓ Sale recorded successfully</h2><div class="li"><span>Customer</span><span>${d.c.phone}</span></div><div class="li"><span>Total</span><span>${money(d.t.total)}</span></div><div class="li"><span>Points earned</span><b>${d.t.pts}</b></div><div class="li"><span>New balance</span><b>${d.bal} pts</b></div>${d.t.refRewarded?'<div class="ok">Referral rewarded: inviter +50, invitee +30</div>':''}<div class="li"><span>SMS</span><span class="pill">SENT (simulated)</span></div><button class="big" onclick="go('sale')">New Sale</button><button class="s big" style="margin-top:8px" onclick="view.c=done.c.id;go('cust')">View Customer</button></div>`}

function txUI(){const q=view.tq||'';return`<h2>Transactions</h2><input placeholder="Filter by phone" value="${q}" oninput="view.tq=this.value;render();document.querySelector('input').focus()">${S.tx.filter(t=>t.phone.includes(q.replace(/^0/,'+254'))).slice().reverse().map(t=>`<div class="card"><div class="li" onclick="view.rt=view.rt=='${t.id}'?null:'${t.id}';render()"><span><b>${t.id}</b> · ${t.phone}<br><span class="mu">${new Date(t.at).toLocaleString('en-KE',{timeZone:'Africa/Nairobi'})} · operator admin</span></span><span>${money(t.total)}<br>${bd(t.status)} +${t.pts}</span></div>${view.rt==t.id?`<div class="ok">${t.items.map(i=>`<div class="li"><span>${i.name} (${i.type})</span><span>${money(i.price)} · ${i.pts} pts @${i.rate}</span></div>`).join('')}<div class="li"><span>Eligible</span><span>${money(t.elig)}</span></div>${t.reason?'<p>Reason: '+t.reason+'</p>':''}${t.status=='COMPLETED'?`<button class="d" onclick="rev('${t.id}')">Reverse sale</button>`:''}</div>`:''}</div>`).join('')}`}

function rev(id){const t=S.tx.find(x=>x.id==id);if(bal(S,t.c)<t.pts)return toast('Customer already spent these points');return ask('Reason for reversal',r=>{if(!r)return;t.status='REVERSED';t.reason=r;L(S,t.c,'REVERSAL',-t.pts,'Reversal of '+id+': '+r);S.audit.push({at:now(),a:'REVERSE '+id+' '+r});save();render()},1)}

function txUI2(){const f=view,T=S.tx.filter(t=>t.phone.includes(fx(f.tq))&&(!f.ts||t.status==f.ts)&&(!f.tc||t.items.some(i=>i.type==f.tc))&&(!f.tm||t.total>=+f.tm)&&(!f.td||t.at.slice(0,10)>=f.td)).slice().reverse(),sm=t=>{const m=S.sms.find(x=>x.phone==t.phone&&x.type=='sale'&&Math.abs(new Date(x.at)-new Date(t.at))<6e4);return m?m.st:'-'},rc=S.tx.find(t=>t.id==f.rt),op=(id,l,v)=>`<option value="${id}"${id==v?' selected':''}>${l}</option>`;
return`<h2>Transactions</h2><div class="bar"><input placeholder="Phone" value="${f.tq||''}" onchange="view.tq=this.value;render()"><select onchange="view.ts=this.value;render()">${op('','Any status',f.ts)}${op('COMPLETED','Completed',f.ts)}${op('REVERSED','Reversed',f.ts)}</select><select onchange="view.tc=this.value;render()">${op('','Any category',f.tc)}${op('SERVICE','Services',f.tc)}${op('PRODUCT','Products',f.tc)}</select><input inputmode="numeric" placeholder="Min KES" value="${f.tm||''}" onchange="view.tm=this.value;render()"><input type="date" value="${f.td||''}" onchange="view.td=this.value;render()"></div>${rc?`<div class="card"><h3>Receipt ${rc.id} · ${rc.phone} · ${dt(rc.at)}</h3>${rc.items.map(i=>`<div class="li"><span>${i.name} (${i.type})</span><span>${money(i.price)} · ${i.pts} pts @${i.rate}</span></div>`).join('')}<div class="li"><span>Total / eligible</span><b>${money(rc.total)} / ${money(rc.elig)}</b></div>${rc.reason?'<p>Reversed: '+rc.reason+'</p>':''}<div class="row">${rc.status=='COMPLETED'?`<button class="d" onclick="rev('${rc.id}')">Reverse sale</button>`:''}<button class="s" onclick="view.rt=null;render()">Close</button></div></div>`:''}<table class="tb"><thead><tr><th>ID<th>Phone<th>Items<th>Total<th>Eligible<th>Points<th>Date<th>SMS<th>Status<th>Operator</tr></thead>${T.map(t=>`<tr class="cr" onclick="view.rt='${t.id}';render()"><td><b>${t.id}</b><td>${t.phone}<td>${t.items.map(i=>i.name).join(', ')}<td>${money(t.total)}<td>${money(t.elig)}<td>+${t.pts}<td>${dt(t.at)}<td>${sm(t)}<td>${bd(t.status)}<td>admin`).join('')}</table><div class="mv">${T.map(t=>`<div class="card" onclick="view.rt='${t.id}';render();scrollTo(0,0)"><div class="li"><span><b>${t.id}</b> · ${t.phone}<br><span class="mu">${dt(t.at)}</span></span><span>${money(t.total)}<br>${bd(t.status)} +${t.pts}</span></div></div>`).join('')}</div>`}

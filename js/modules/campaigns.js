// modules/campaigns
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{campUI,editCamp,newCamp,pv,campUI2,tgC,saveCamp});

function campUI(){return`<h2>Campaigns</h2><p class="mu">The active campaign is added to SMS only for customers who opted in to marketing.</p>${S.camps.map(k=>`<div class="card"><div class="li"><b>${k.name}</b>${S.act==k.id?'<span class="pill">ACTIVE</span>':''}</div><p class="mu">${k.ad} https://perks.samuhia.co.ke</p><button class="${S.act==k.id?'s':''}" onclick="S.act='${k.id}';save();render()">${S.act==k.id?'Selected':'Make active'}</button> <button class="s" onclick="editCamp('${k.id}')">Edit ad</button></div>`).join('')}<button class="s big" onclick="newCamp()">+ New campaign</button>`}

function editCamp(id){const k=S.camps.find(x=>x.id==id),a=prompt('Advertisement text',k.ad);if(a){k.ad=a;save();render()}}

function newCamp(){const n=prompt('Campaign name');if(!n)return;const a=prompt('Advertisement text');if(!a)return;S.camps.push({id:'k'+(S.camps.length+1),name:n,ad:a,on:true});save();render()}

function pv(k){return S.tpl.sale.replace(/{(\w+)}/g,(m,x)=>({amount:600,pts:36,bal:255,val:51})[x]??m)+' '+k.ad+' '+(k.url||'https://perks.samuhia.co.ke')+' Reply STOP to opt out.'}

function campUI2(){const e=S.camps.find(k=>k.id==view.ek)||{},fi=(id,l,v,t)=>`<div><label>${l}</label><input id="${id}" type="${t||'text'}" value="${(v||'').toString().replace(/"/g,'&quot;')}"></div>`;
return`<h2>Campaigns</h2><div class="split rv"><div class="card"><h3>${e.id?'Edit':'New'} campaign</h3>${fi('cn','Name',e.name)}<label>Advertisement</label><textarea id="ca" rows="3">${e.ad||''}</textarea>${fi('cu','Destination link',e.url||'https://perks.samuhia.co.ke')}${fi('cm','Product or service promoted',e.promo)}<div class="row">${fi('cs','Start',e.start,'date')}${fi('ce','End',e.end,'date')}</div>${fi('cp','Priority',e.pr||1,'number')}<button class="big" onclick="saveCamp()">Save campaign</button>${e.id?'<button class="s big" style="margin-top:8px" onclick="view.ek=null;render()">Cancel edit</button>':''}</div><div class="cg">${S.camps.slice().sort((a,b)=>(b.pr||0)-(a.pr||0)).map(k=>`<div class="card"><div class="li"><b>${k.name}</b>${S.act==k.id?'<span class="pill">ACTIVE</span>':k.on?'<span class="pill">READY</span>':bd('PAUSED')}</div><p class="mu">${k.ad}<br>${k.url||'https://perks.samuhia.co.ke'}<br>Priority ${k.pr||1}${k.start?' · from '+k.start:''}${k.end?' · to '+k.end:''}${k.promo?' · promotes '+k.promo:''}</p><p style="font-size:13px"><b>SMS preview:</b> ${pv(k)}</p><div class="row">${k.on?`<button onclick="S.act='${k.id}';save();render()">${S.act==k.id?'Selected':'Make active'}</button>`:''}<button class="s" onclick="tgC('${k.id}')">${k.on?'Pause':'Resume'}</button><button class="s" onclick="view.ek='${k.id}';render();scrollTo(0,0)">Edit</button></div></div>`).join('')}</div></div>`}

function tgC(id){const k=S.camps.find(x=>x.id==id);k.on=!k.on;if(!k.on&&S.act==id)S.act='';save();render()}

function saveCamp(){const g=i=>$('#'+i).value.trim();if(!g('cn')||!g('ca'))return toast('Name and advertisement required');let k=S.camps.find(x=>x.id==view.ek);if(!k){k={id:'k'+Date.now(),on:true};S.camps.push(k)}Object.assign(k,{name:g('cn'),ad:g('ca'),url:g('cu'),promo:g('cm'),start:g('cs'),end:g('ce'),pr:+g('cp')||1});view.ek=null;save();toast('Campaign saved');render()}

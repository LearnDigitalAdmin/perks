// modules/vouchers
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{award,vouchUI,mkV,bulkV,asgV,voS,vact,vouchUI2});

function award(v,cid){const c=S.cs.find(x=>x.id==cid);v.st='AWARDED';v.c=cid;if(v.type=='POINTS'){L(S,cid,'VOUCHER',v.val,'Voucher '+v.code);v.st='REDEEMED'}sendSms(S,c,'voucher',{code:v.code,val:v.type=='POINTS'?v.val+' pts':'KES '+v.val,bal:bal(S,cid)});S.audit.push({at:now(),a:'AWARD '+v.code+' '+c.phone})}

function vouchUI(){return`<h2>Vouchers</h2><div class="card"><div class="row"><select id="vt"><option>DISCOUNT</option><option>AIRTIME</option><option>POINTS</option></select><input id="vv" inputmode="numeric" placeholder="Value"></div><button class="big" onclick="mkV()">Create voucher</button><button class="s big" style="margin-top:8px" onclick="bulkV()">Bulk add 5 demo vouchers</button></div>${S.vo.slice().reverse().map(v=>`<div class="card"><div class="li"><b>${v.code}</b>${bd(v.st)}</div><span class="mu">${v.type} ${v.val} · ${v.c?nmc(v.c):'unassigned'}</span><div class="row" style="margin-top:8px">${v.st=='AVAILABLE'?`<button class="s" onclick="asgV('${v.id}')">Assign</button>`:''}${v.st=='AWARDED'?`<button onclick="voS('${v.id}','REDEEMED')">Mark redeemed</button>`:''}${v.st=='AVAILABLE'||v.st=='AWARDED'?`<button class="d" onclick="voS('${v.id}','VOID')">Void</button>`:''}</div></div>`).join('')}`}

function mkV(){const v=+$('#vv').value,t=$('#vt').value;if(!v)return toast('Enter a value');S.vo.push({id:'v'+S.vo.length,code:t.slice(0,4)+v+Math.random().toString(36).slice(2,5).toUpperCase(),type:t,val:v,st:'AVAILABLE',c:null,at:now()});save();render()}

function bulkV(){for(let i=0;i<5;i++)S.vo.push({id:'v'+S.vo.length,code:'DEMO'+Math.random().toString(36).slice(2,6).toUpperCase(),type:'DISCOUNT',val:20,st:'AVAILABLE',c:null,at:now()});save();render()}

function asgV(id){ask('Customer phone',v=>{const p=norm(v||''),c=S.cs.find(x=>x.phone==p);if(!c)return toast('Customer not found');award(S.vo.find(x=>x.id==id),c.id);save();render()},1)}

function voS(id,st){const go=()=>{S.vo.find(v=>v.id==id).st=st;S.audit.push({at:now(),a:st+' '+id});save();render()};st=='VOID'?ask('Void this voucher?',go):go()}

function vact(v){return(v.st=='AVAILABLE'?`<button class="s" onclick="event.stopPropagation();asgV('${v.id}')">Assign</button> `:'')+(v.st=='AWARDED'?`<button onclick="voS('${v.id}','REDEEMED')">Mark redeemed</button> `:'')+(v.st=='AVAILABLE'||v.st=='AWARDED'?`<button class="d" onclick="voS('${v.id}','VOID')">Void</button>`:'')}

function vouchUI2(){const V=S.vo.slice().reverse();return`<h2>Vouchers</h2><div class="split rv"><div class="card"><h3>Create voucher</h3><select id="vt"><option>DISCOUNT</option><option>AIRTIME</option><option>POINTS</option></select><input id="vv" inputmode="numeric" placeholder="Value"><button class="big" onclick="mkV()">Create voucher</button><button class="s big" style="margin-top:8px" onclick="bulkV()">Bulk add 5 demo vouchers</button></div><div><table class="tb"><thead><tr><th>Code<th>Type<th>Value<th>Status<th>Customer<th>Created<th>Actions</tr></thead>${V.map(v=>`<tr><td><b>${v.code}</b><td>${v.type}<td>${v.val}<td>${bd(v.st)}<td>${v.c?nmc(v.c):'-'}<td>${dt(v.at)}<td>${vact(v)}`).join('')}</table><div class="mv">${V.map(v=>`<div class="card"><div class="li"><b>${v.code}</b>${bd(v.st)}</div><span class="mu">${v.type} ${v.val} · ${v.c?nmc(v.c):'unassigned'}</span><div class="row" style="margin-top:8px">${vact(v)}</div></div>`).join('')}</div></div></div>`}

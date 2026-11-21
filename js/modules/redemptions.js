// modules/redemptions
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{redeemUI,rr,redeem,redeem2,redeem3});

function redeemUI(){const ph=norm(view.rp||''),c=ph&&S.cs.find(x=>x.phone==ph),p=Math.floor(+view.pts||0);
 return`<h2>Redeem points</h2><div class="card"><label>Customer phone</label><input inputmode="tel" value="${view.rp||''}" oninput="view.rp=this.value;rr()"><div id="rd"></div></div>`}

function rr(){const ph=norm(view.rp||''),c=ph&&S.cs.find(x=>x.phone==ph);$('#rd').innerHTML=!c?(ph?'<span class="err">Customer not found</span>':''):`<div class="ok">${bal(S,c.id)} pts available</div><label>Points to redeem (min ${S.cfg.min})</label><input inputmode="numeric" oninput="view.pts=this.value;$('#rv2').textContent=money(Math.floor(+this.value||0)*20/100)"><p>Discount value: <b id="rv2">KES 0</b></p><button class="big" onclick="redeem('${c.id}')">Confirm redemption</button>`}

function redeem(id){const p=Math.floor(+view.pts||0),c=S.cs.find(x=>x.id==id),b=bal(S,id);if(p<S.cfg.min)return toast('Minimum '+S.cfg.min+' points');if(p>b)return toast('Exceeds balance');
 return ask('Redeem '+p+' points for '+money(p*20/100)+'?',()=>{L(S,id,'REDEEM',-p,'Redeemed in shop');sendSms(S,c,'redeem',{pts:p,val:p*20/100,bal:bal(S,id)});save();view.pts='';toast('Redeemed '+money(p*20/100));render()})}

function redeem2(){return redeemUI()+`<div class="card"><h3>Recent redemptions</h3>${S.led.filter(l=>l.type=='REDEEM').slice(-8).reverse().map(l=>`<div class="li"><span>${nmc(l.c)}</span><b>${-l.pts} pts · ${money(-l.pts/5)}</b></div>`).join('')||'<p class="mu">None yet.</p>'}</div>`}

function redeem3(){const H=S.led.filter(l=>l.type=='REDEEM').slice().reverse();return`<div class="two"><div>${redeemUI()}</div><div><h2>Redemption history</h2><table class="tb"><thead><tr><th>Customer<th>Points<th>Value<th>Balance after<th>Date</tr></thead>${H.map(l=>`<tr><td>${nmc(l.c)}<td>${-l.pts}<td>${money(-l.pts/5)}<td>${l.after}<td>${dt(l.at)}`).join('')}</table><div class="mv">${H.map(l=>`<div class="li"><span>${nmc(l.c)}</span><b>${-l.pts} pts · ${money(-l.pts/5)}</b></div>`).join('')||'<p class="mu">No redemptions yet.</p>'}</div></div></div>`}

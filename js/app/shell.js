// app/shell
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{go,render,moreUI,ask});

function go(t){tab=t;done=null;render()}

function render(){ensure();document.body.classList.toggle('op',!!(S.user&&S.user.role=='op'));const u=S.user;$('#who').innerHTML=u?`<button class="s" onclick="S.user=null;save();render()">Log out</button>`:'';
 if(!u){$('#nav').innerHTML='';$('#app').innerHTML=loginUI2();return}
 if(u.role=='cust'){$('#nav').innerHTML='';$('#app').innerHTML=custUI2();return}
 const T=[['over','Overview','⌂',1],['sale','New Sale','＋',3],['cust','Customers','☺',2],['txn','Transactions','☰'],['redeem','Redemptions','⇄',4],['refs','Referrals','⚭'],['vouch','Vouchers','🎟'],['camp','Campaigns','📣'],['sms','SMS Centre','✉'],['tpl','Templates','✎'],['rep','Reports','▤'],['set','Settings','⚙'],['more','More','⋯',5]];
 $('#nav').innerHTML=T.map(t=>`<a class="${t[0]==tab?'on ':''}${t[0]=='sale'?'sale ':''}${t[3]?'':'dk '}${t[0]=='more'?'mo':''}" style="--o:${t[3]||9}" onclick="go('${t[0]}')"><i>${t[2]}</i>${t[1]}</a>`).join('');
 $('#app').innerHTML=({over:overUI2,sale:saleUI,cust:custList2,redeem:redeem3,camp:campUI2,sms:sms3,set:set3,txn:txUI2,refs:refUI,vouch:vouchUI2,tpl:tplUI2,rep:repUI2,more:moreUI})[tab]();$('#app').className=u.role=='op'?tab:'';if(tab=='tpl'){tp();cc()}}

function moreUI(){return`<h2>More</h2><div class="grid">${[['txn','Transactions'],['refs','Referrals'],['vouch','Vouchers'],['camp','Campaigns'],['sms','SMS Centre'],['tpl','Templates'],['rep','Reports'],['set','Settings']].map(t=>`<button class="s" style="min-height:72px" onclick="go('${t[0]}')">${t[1]}</button>`).join('')}</div>`}

function ask(msg,fn,inp){const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:30;display:flex;align-items:center;justify-content:center;padding:16px';o.innerHTML=`<div class="card" style="max-width:380px;width:100%;margin:0"><p><b>${msg}</b></p>${inp?'<input id="mi">':''}<div class="row"><button class="s" id="mn">Cancel</button><button id="my">Confirm</button></div></div>`;document.body.appendChild(o);const x=()=>o.remove();o.querySelector('#mn').onclick=()=>{view.dc=0;x()};o.querySelector('#my').onclick=()=>{const v=inp?o.querySelector('#mi').value:null;x();fn(v)};if(inp)o.querySelector('#mi').focus()}

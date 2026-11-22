// app/shell
import { registerActions } from '../core/actions.js';
import { S, setDone, setTab, tab, view } from '../core/state.js';
import { $, ap } from '../core/utils.js';
import { loginUI2, logout, unregisteredUI } from '../modules/auth.js';
import { campUI2 } from '../modules/campaigns.js';
import { custUI2 } from '../modules/customer-app.js';
import { custList2 } from '../modules/customers.js';
import { ensure } from '../modules/data.js';
import { redeem3 } from '../modules/redemptions.js';
import { refUI } from '../modules/referrals.js';
import { overUI2, repUI2 } from '../modules/reports.js';
import { set3 } from '../modules/settings.js';
import { cc, sms3, tp, tplUI2 } from '../modules/sms.js';
import { saleUI, txUI2 } from '../modules/transactions.js';
import { vouchUI2 } from '../modules/vouchers.js';
import { isLive } from '../services/runtime.js';

export function go(t){setTab(t);setDone(null);render()}

export function render(){if(!isLive())ensure();document.body.classList.toggle('op',!!(S.user&&S.user.role=='op'));const u=S.user;$('#who').innerHTML=u?`<button class="s" data-on-click="app_shell_1">Log out</button>`:'';
 if(!u){$('#nav').innerHTML='';$('#app').innerHTML=loginUI2();return}
 if(u.role=='cust'){$('#nav').innerHTML='';$('#app').innerHTML=u.unregistered?unregisteredUI():custUI2();return}
 const T=[['over','Overview','⌂',1],['sale','New Sale','＋',3],['cust','Customers','☺',2],['txn','Transactions','☰'],['redeem','Redemptions','⇄',4],['refs','Referrals','⚭'],['vouch','Vouchers','🎟'],['camp','Campaigns','📣'],['sms','SMS Centre','✉'],['tpl','Templates','✎'],['rep','Reports','▤'],['set','Settings','⚙'],['more','More','⋯',5]];
 $('#nav').innerHTML=T.map(t=>`<a class="${t[0]==tab?'on ':''}${t[0]=='sale'?'sale ':''}${t[3]?'':'dk '}${t[0]=='more'?'mo':''}" style="--o:${t[3]||9}" data-on-click="app_shell_2" ${ap([t[0]],'click')} role="button" tabindex="0"><i>${t[2]}</i>${t[1]}</a>`).join('');
 $('#app').innerHTML=({over:overUI2,sale:saleUI,cust:custList2,redeem:redeem3,camp:campUI2,sms:sms3,set:set3,txn:txUI2,refs:refUI,vouch:vouchUI2,tpl:tplUI2,rep:repUI2,more:moreUI})[tab]();$('#app').className=u.role=='op'?tab:'';if(tab=='tpl'){tp();cc()}}

export function moreUI(){return`<h2>More</h2><div class="grid">${[['txn','Transactions'],['refs','Referrals'],['vouch','Vouchers'],['camp','Campaigns'],['sms','SMS Centre'],['tpl','Templates'],['rep','Reports'],['set','Settings']].map(t=>`<button class="s" style="min-height:72px" data-on-click="app_shell_3" ${ap([t[0]],'click')}>${t[1]}</button>`).join('')}</div>`}

export function ask(msg,fn,inp){const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:30;display:flex;align-items:center;justify-content:center;padding:16px';o.innerHTML=`<div class="card" style="max-width:380px;width:100%;margin:0"><p><b>${msg}</b></p>${inp?'<input id="mi">':''}<div class="row"><button class="s" id="mn">Cancel</button><button id="my">Confirm</button></div></div>`;document.body.appendChild(o);const x=()=>o.remove();o.querySelector('#mn').onclick=()=>{view.dc=0;x()};o.querySelector('#my').onclick=()=>{const v=inp?o.querySelector('#mi').value:null;x();fn(v)};if(inp)o.querySelector('#mi').focus()}

registerActions({
async app_shell_1(p,event){await logout()},
app_shell_2(p,event){go(p[0])},
app_shell_3(p,event){go(p[0])}
});

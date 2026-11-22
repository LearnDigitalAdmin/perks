// modules/redemptions
import { ask, render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { S, view } from '../core/state.js';
import { $, ap, dt, money, nmc, norm, toast } from '../core/utils.js';
import { bal } from './points.js';
import { errText, newKey } from '../services/api.js';
import { svc } from '../services/index.js';

export function redeemUI(){const ph=norm(view.rp||''),c=ph&&S.cs.find(x=>x.phone==ph),p=Math.floor(+view.pts||0);
 return`<h2>Redeem points</h2><div class="card"><label>Customer phone</label><input inputmode="tel" value="${view.rp||''}" data-on-input="modules_redemptions_1"><div id="rd"></div></div>`}

export function rr(){const ph=norm(view.rp||''),c=ph&&S.cs.find(x=>x.phone==ph);$('#rd').innerHTML=!c?(ph?'<span class="err">Customer not found</span>':''):`<div class="ok">${bal(S,c.id)} pts available</div><label>Points to redeem (min ${S.cfg.min})</label><input inputmode="numeric" data-on-input="modules_redemptions_2"><p>Discount value: <b id="rv2">KES 0</b></p><button class="big" data-on-click="modules_redemptions_3" ${ap([c.id],'click')}>Confirm redemption</button>`}

export function redeem(id){
  const c=S.cs.find(x=>x.id==id),p=Math.floor(+view.pts||0);if(!c)return toast('Customer not found');
  if(p<S.cfg.min)return toast('Minimum '+S.cfg.min+' points');if(p>bal(S,id))return toast('Exceeds balance');
  const key=view.rkey||(view.rkey=newKey());
  return ask('Redeem '+p+' points for '+money(p*20/100)+'?',async()=>{try{const r=await svc.redeem({customer:c,points:p,key});view.rkey=null;view.pts='';toast('Redeemed '+money(r.valueKes))}catch(e){toast(errText(e))}render()})
}

export function redeem3(){const H=S.led.filter(l=>l.type=='REDEEM').slice().reverse();return`<div class="two"><div>${redeemUI()}</div><div><h2>Redemption history</h2><table class="tb"><thead><tr><th>Customer<th>Points<th>Value<th>Balance after<th>Date</tr></thead>${H.map(l=>`<tr><td>${nmc(l.c)}<td>${-l.pts}<td>${money(-l.pts/5)}<td>${l.after}<td>${dt(l.at)}`).join('')}</table><div class="mv">${H.map(l=>`<div class="li"><span>${nmc(l.c)}</span><b>${-l.pts} pts · ${money(-l.pts/5)}</b></div>`).join('')||'<p class="mu">No redemptions yet.</p>'}</div></div></div>`}

registerActions({
modules_redemptions_1(p,event){view.rp=this.value;rr()},
modules_redemptions_2(p,event){view.pts=this.value;$('#rv2').textContent=money(Math.floor(+this.value||0)*20/100)},
modules_redemptions_3(p,event){redeem(p[0])}
});

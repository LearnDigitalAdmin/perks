// modules/customer-app
import { render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { DISC } from '../core/constants.js';
import { S, view } from '../core/state.js';
import { ap, bd, money, toast } from '../core/utils.js';
import { bal } from './points.js';
import { errText } from '../services/api.js';
import { svc } from '../services/index.js';

export function custUI2(){const c=S.cs.find(x=>x.id==S.user.id),b=bal(S,c.id),link='https://perks.samuhia.co.ke/join?ref='+c.code,rs=S.refs.filter(r=>r.from==c.id),mine=S.tx.filter(t=>t.c==c.id),earned=S.led.filter(l=>l.c==c.id&&l.pts>0).reduce((a,l)=>a+l.pts,0),red=-S.led.filter(l=>l.c==c.id&&l.type=='REDEEM').reduce((a,l)=>a+l.pts,0);
return`<div class="pts"><span>Your loyalty rewards · ${c.phone}</span><b>${b} points</b>KES ${b/5} value<div class="row" style="margin-top:10px;font-size:13px"><span>Spent ${money(c.spend??mine.filter(t=>t.status=='COMPLETED').reduce((a,t)=>a+t.elig,0))}</span><span>Earned ${earned}</span><span>Redeemed ${red}</span><span>Referrals ${rs.filter(r=>r.st=='REWARDED').length}</span></div></div>
<h2 style="margin-top:22px">Discover Samuhia</h2><div class="disc">${DISC.map((d,i)=>`<a class="dc${i?'':' big1'}" style="background:linear-gradient(135deg,${d[3].split(',')[0]},${d[3].split(',')[1]})" href="${d[2]}" target="_blank" rel="noopener"><i>${d[4]}</i><b>${d[0]}</b><span>${d[1]}</span><em>Learn more →</em></a>`).join('')}</div>
<div class="two"><div><div class="card"><h3>Refer a friend</h3><p><b>${c.code}</b><br><span class="mu">${link}</span></p><div class="row"><button data-on-click="modules_customer_app_2" ${ap([link],'click')}>Copy link</button><button class="s" data-on-click="modules_customer_app_3" ${ap([link],'click')}>Share</button></div><p class="mu">When someone you invite spends above KES 50, you get 50 points and they get 30. ${rs.filter(r=>r.st=='REWARDED').length} rewarded · ${rs.filter(r=>r.st=='PENDING').length} pending.</p></div>
<div class="card"><h3>My vouchers</h3>${S.vo.filter(v=>v.c==c.id).map(v=>`<div class="li"><span>${v.code}<br><span class="mu">${v.type} ${v.val}</span></span>${bd(v.st)}</div>`).join('')||'<p class="mu">No vouchers yet.</p>'}<p class="mu">To redeem points, visit Samuhia Cyber. Our operator will apply your rewards.</p></div>
<div class="card"><h3>Promotions</h3><button class="s" data-on-click="modules_customer_app_4" ${ap([c.id],'click')}>Marketing: ${c.mkt?'On (tap to opt out)':'Off (tap to opt in)'}</button></div></div>
<div><div class="card"><h3>Transactions</h3>${mine.slice().reverse().map(t=>`<div class="li" style="cursor:pointer" data-on-click="modules_customer_app_1" ${ap([t.id,t.id],'click')} role="button" tabindex="0"><span>${t.items.map(i=>i.name+(view.ct==t.id?' ('+money(i.price)+', +'+i.pts+' pts)':'')).join(', ')}<br><span class="mu">${new Date(t.at).toLocaleDateString('en-KE')} · ${t.status}</span></span><span>${money(t.total)}<br><span class="pill">+${t.pts}</span></span></div>`).join('')}</div><div class="card"><h3>Points history</h3>${S.led.filter(l=>l.c==c.id).slice(-12).reverse().map(l=>`<div class="li"><span>${l.desc}<br><span class="mu">${l.type}</span></span><b>${l.pts>0?'+':''}${l.pts}</b></div>`).join('')}</div></div></div>`}

registerActions({
modules_customer_app_1(p,event){view.ct=view.ct==p[0]?null:p[1];render()},
modules_customer_app_2(p,event){navigator.clipboard&&navigator.clipboard.writeText(p[0]).then(()=>toast('Link copied'),()=>toast('Copy failed'))},
modules_customer_app_3(p,event){navigator.share?navigator.share({title:'Samuhia Perks',url:p[0]}).catch(()=>{}):toast('Sharing unavailable, copy the link')},
async modules_customer_app_4(p,event){try{await svc.setMarketing(!S.cs.find(y=>y.id==p[0]).mkt)}catch(e){toast(errText(e))}render()}
});

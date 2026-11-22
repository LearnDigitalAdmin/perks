// modules/campaigns
import { render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { S, view } from '../core/state.js';
import { $, ap, bd, toast } from '../core/utils.js';
import { errText } from '../services/api.js';
import { svc } from '../services/index.js';
import { OPT_OUT, fillTemplate } from '../services/templates.js';

export function pv(k){return fillTemplate(S.tpl.sale||'')+' '+k.ad+' '+(k.url||'https://perks.samuhia.co.ke')+' '+OPT_OUT}

export function campUI2(){const e=S.camps.find(k=>k.id==view.ek)||{},fi=(id,l,v,t)=>`<div><label>${l}</label><input id="${id}" type="${t||'text'}" value="${(v||'').toString().replace(/"/g,'&quot;')}"></div>`;
return`<h2>Campaigns</h2><div class="split rv"><div class="card"><h3>${e.id?'Edit':'New'} campaign</h3>${fi('cn','Name',e.name)}<label>Advertisement</label><textarea id="ca" rows="3">${e.ad||''}</textarea>${fi('cu','Destination link',e.url||'https://perks.samuhia.co.ke')}${fi('cm','Product or service promoted',e.promo)}<div class="row">${fi('cs','Start',e.start,'date')}${fi('ce','End',e.end,'date')}</div>${fi('cp','Priority',e.pr||1,'number')}<button class="big" data-on-click="modules_campaigns_4">Save campaign</button>${e.id?'<button class="s big" style="margin-top:8px" data-on-click="campaigns_cancel_edit" role="button">Cancel edit</button>':''}</div><div class="cg">${S.camps.slice().sort((a,b)=>(b.pr||0)-(a.pr||0)).map(k=>`<div class="card"><div class="li"><b>${k.name}</b>${S.act==k.id?'<span class="pill">ACTIVE</span>':k.on?'<span class="pill">READY</span>':bd('PAUSED')}</div><p class="mu">${k.ad}<br>${k.url||'https://perks.samuhia.co.ke'}<br>Priority ${k.pr||1}${k.start?' · from '+k.start:''}${k.end?' · to '+k.end:''}${k.promo?' · promotes '+k.promo:''}</p><p style="font-size:13px"><b>SMS preview:</b> ${pv(k)}</p><div class="row">${k.on?`<button data-on-click="modules_campaigns_1" ${ap([k.id],'click')}>${S.act==k.id?'Selected':'Make active'}</button>`:''}<button class="s" data-on-click="modules_campaigns_2" ${ap([k.id],'click')}>${k.on?'Pause':'Resume'}</button><button class="s" data-on-click="modules_campaigns_3" ${ap([k.id],'click')}>Edit</button></div></div>`).join('')}</div></div>`}

export async function tgC(id){try{await svc.toggleCampaign(id)}catch(e){toast(errText(e))}render()}

export async function saveCamp(){const g=i=>$('#'+i).value.trim();if(!g('cn')||!g('ca'))return toast('Name and advertisement required');try{await svc.saveCampaign({id:view.ek,name:g('cn'),ad:g('ca'),url:g('cu'),promo:g('cm'),start:g('cs'),end:g('ce'),pr:+g('cp')||1});view.ek=null;toast('Campaign saved')}catch(e){toast(errText(e))}render()}

registerActions({
campaigns_cancel_edit(p,event){view.ek=null;render()},
async modules_campaigns_1(p,event){try{await svc.setActiveCampaign(p[0])}catch(e){toast(errText(e))}render()},
modules_campaigns_2(p,event){tgC(p[0])},
modules_campaigns_3(p,event){view.ek=p[0];render();scrollTo(0,0)},
modules_campaigns_4(p,event){saveCamp()}
});

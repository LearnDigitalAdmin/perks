// modules/referrals
import { ask, render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { S } from '../core/state.js';
import { $, bd, money, nmc, norm, toast } from '../core/utils.js';
import { errText } from '../services/api.js';
import { svc } from '../services/index.js';

export function refUI(){const R=S.refs,n=s=>R.filter(r=>r.st==s).length;return`<h2>Referrals</h2><div class="grid"><div class="stat"><b>${R.length}</b><span>Total</span></div><div class="stat"><b>${n('PENDING')}</b><span>Pending</span></div><div class="stat"><b>${n('REWARDED')}</b><span>Rewarded</span></div><div class="stat"><b>${n('REWARDED')*(S.cfg.ref+S.cfg.inv)}</b><span>Points issued</span></div></div><div class="two" style="margin-top:12px"><div class="card"><h3>Register referral</h3><input id="rg1" placeholder="Inviter referral code"><input id="rg2" inputmode="tel" placeholder="Invitee phone"><button class="big" data-on-click="modules_referrals_1">Register (pending)</button></div><div class="card"><h3>Reward draw: DEMO / SIMULATED</h3><p class="mu">Not connected to any real prize service. Production use stays disabled pending Kenyan legal and regulatory review.</p><button class="s" data-on-click="modules_referrals_2">Draw: ${S.draw?'ON':'OFF'}</button> <button ${S.draw?'':'disabled'} data-on-click="modules_referrals_3">Run simulated draw</button></div></div>${R.slice().reverse().map(r=>`<div class="card"><div class="li"><span>${nmc(r.from)} → ${nmc(r.to)}</span>${bd(r.st)}</div><span class="mu">${r.txId?'Qualifying '+r.txId+' ('+money(r.amt)+')':'Awaiting purchase above KES '+S.cfg.refMin}${r.draw?' · Draw: '+r.draw:''}</span></div>`).join('')}`}

export async function regRef(){const code=$('#rg1').value.trim().toUpperCase(),p=norm($('#rg2').value);if(!code||!p)return toast('Check code and phone');try{await svc.registerReferral({phone:p,code});toast('Referral registered')}catch(e){toast(errText(e))}render()}

export function runDraw(){return ask('Run simulated draw (DEMO)?',async()=>{try{const r=await svc.runDraw();toast(r.message)}catch(e){toast(errText(e))}render()})}

registerActions({
modules_referrals_1(p,event){regRef()},
async modules_referrals_2(p,event){try{await svc.setDrawEnabled(!S.draw)}catch(e){toast(errText(e))}render()},
modules_referrals_3(p,event){runDraw()}
});

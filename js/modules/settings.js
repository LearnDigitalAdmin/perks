// modules/settings
import { ask, render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { S, setS, setTab } from '../core/state.js';
import { dt, esc, save, toast } from '../core/utils.js';
import { seed } from './data.js';
import { errText } from '../services/api.js';
import { svc } from '../services/index.js';
import { isLive } from '../services/runtime.js';

export function set2(){return`<h2>Settings</h2><div class="two"><div class="card"><label>Services points per KES 100</label><input inputmode="numeric" value="${S.cfg.sv}" data-on-change="modules_settings_1"><label>Products points per KES 100</label><input inputmode="numeric" value="${S.cfg.pr}" data-on-change="modules_settings_2"><label>Inviter / invitee points</label><div class="row"><input value="${S.cfg.ref}" data-on-change="modules_settings_3"><input value="${S.cfg.inv}" data-on-change="modules_settings_4"></div><label>SMS cost (KES)</label><input value="${S.cfg.sms}" data-on-change="modules_settings_5"><p class="mu">Rate changes apply to new sales only. 100 points = KES 20; minimum redemption 100; referral needs a purchase above KES 50.</p></div><div class="card"><h3>Production pipeline</h3><p class="mu">Simulated here behind one data layer: Firebase Auth and Phone OTP, Firestore, Cloud Run writes, Host Pinnacle SMS (keys in Secret Manager), App Check, Firestore Rules, rate limiting. Audit entries: ${S.audit.length}.</p></div></div><button class="d big" data-on-click="modules_settings_6">Reset demo data</button>`}

async function setCfg(patch){try{await svc.updateSettings(patch);toast('Saved')}catch(e){toast(errText(e));render()}}
export function set3(){
  const live=isLive(),rows=(live?S.audit.slice(0,12):S.audit.slice(-12).reverse()).map(x=>`<div class="li"><span>${esc(x.a)}</span><span class="mu">${dt(x.at)}</span></div>`).join('');
  return `<h2>Settings</h2><div class="two"><div class="card"><label>Services points per KES 100</label><input inputmode="numeric" value="${S.cfg.sv}" data-on-change="modules_settings_1"><label>Products points per KES 100</label><input inputmode="numeric" value="${S.cfg.pr}" data-on-change="modules_settings_2"><label>Inviter / invitee points</label><div class="row"><input value="${S.cfg.ref}" data-on-change="modules_settings_3"><input value="${S.cfg.inv}" data-on-change="modules_settings_4"></div><label>SMS cost (KES)</label><input value="${S.cfg.sms}" data-on-change="modules_settings_5"><p class="mu">Rate changes apply to new sales only. 100 points = KES 20; minimum redemption ${S.cfg.min}; a referral needs a purchase above KES ${S.cfg.refMin}. Reward draw is ${S.draw?'ON':'OFF'}${live?' and also needs legal approval in the console':' (DEMO only)'}.</p></div><div class="card"><h3>${live?'Activity log':'Audit and consent log'}</h3>${rows||'<span class="mu">No events yet.</span>'}</div></div>${live?'':'<button class="d big" data-on-click="modules_settings_6">Reset demo data</button>'}`}

registerActions({
async modules_settings_1(p,event){await setCfg({servicesPointsRate:+this.value||0})},
async modules_settings_2(p,event){await setCfg({productsPointsRate:+this.value||0})},
async modules_settings_3(p,event){await setCfg({referrerReward:+this.value||0})},
async modules_settings_4(p,event){await setCfg({inviteeReward:+this.value||0})},
async modules_settings_5(p,event){await setCfg({smsCost:+this.value||0})},
modules_settings_6(p,event){ask('Reset all demo data?',()=>{setS(seed());save();setTab('over');render();toast('Demo reset')})}
});

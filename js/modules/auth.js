// modules/auth: demo logins (simulated) and live logins (Firebase email/password for staff, SMS code for customers).
import { render } from '../app/shell.js';
import { registerActions } from '../core/actions.js';
import { S, setS, view } from '../core/state.js';
import { $, esc, norm, now, save, toast } from '../core/utils.js';
import { errText } from '../services/api.js';
import { emptyState } from '../services/live.js';
import { isLive, runtime } from '../services/runtime.js';

const joinCard = () => (view.joinRef ? `<div class="card"><h2>You’re invited to Samuhia Perks</h2><p>Visit Samuhia Cyber and give the code <b>${esc(view.joinRef)}</b> on your first purchase above KES 50. You get 30 points and your friend gets 50.</p></div>` : '');
const errCard = () => (view.authError ? `<div class="card"><span class="err">${esc(view.authError)}</span></div>` : '');

// ───────── demo ─────────
function demoLoginUI() {
  return `<div class="card"><h2>Operator login</h2><label>Username</label><input id="u" value="admin@samuhia.demo"><label>Password</label><input id="p" type="password" value="Samuhia@2026!"><button class="big" data-on-click="auth_demoOperator">Sign in</button><p class="mu">Demo environment. These credentials are for the demo only.</p></div>
<div class="card"><h2>Customer demo (simulated OTP)</h2>${S.cs.slice(0, 4).map((c) => `<button class="s" style="width:100%;margin-bottom:8px" data-on-click="auth_demoOtp" data-p-click="${esc(JSON.stringify([c.id]))}">${c.phone} — send demo OTP</button>`).join('')}<p class="mu">Live access uses a real SMS code. Demo code: 123456, auto-filled.</p></div>
<div class="card"><h3>Or enter your phone</h3><input id="cp" inputmode="tel" placeholder="07XX XXX XXX"><button class="s big" data-on-click="auth_demoPhone">Send OTP</button></div>`;
}
function demoOtpUI() {
  const c = S.cs.find((x) => x.id === view.otp);
  return `<div class="card"><h2>Verify ${esc(c.phone)}</h2><div class="ok">DEMO ONLY: your code is 123456. No SMS is sent.</div><input id="ot" inputmode="numeric" value="123456"><button class="big" data-on-click="auth_demoVerify" data-p-click="${esc(JSON.stringify([c.id]))}">Verify</button><button class="s big" style="margin-top:8px" data-on-click="auth_back">Back</button></div>`;
}
function demoOtpStart(id) {
  const c = S.cs.find((x) => x.id === id);
  S.sms.push({ id: 'm' + S.sms.length, phone: c.phone, type: 'otp', camp: null, msg: 'Samuhia Perks code: 123456. Do not share it.', st: 'SENT', cost: S.cfg.sms, at: now() });
  view.otp = id; save(); render();
}

// ───────── live ─────────
function liveLoginUI() {
  if (view.loading) return '<div class="card"><p class="mu">Loading…</p></div>';
  if (view.otpPhone) {
    return `${joinCard()}<div class="card"><h2>Enter your code</h2><p class="mu">We sent a 6-digit code to ${esc(view.otpPhone)}.</p><input id="lc" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456"><button class="big" data-on-click="auth_liveVerify">Verify</button><button class="s big" style="margin-top:8px" data-on-click="auth_back">Use a different number</button></div>${errCard()}`;
  }
  return `${joinCard()}<div class="card"><h2>My rewards</h2><label>Phone number</label><input id="lp" inputmode="tel" autocomplete="tel" placeholder="07XX XXX XXX"><button class="big" data-on-click="auth_liveSend">Send code</button><p class="mu">We text you a 6-digit code. Points are redeemed in person at Samuhia Cyber.</p></div>
<div class="card"><h3>Samuhia Cyber staff</h3><label>Email</label><input id="em" type="email" autocomplete="username"><label>Password</label><input id="pw" type="password" autocomplete="current-password"><button class="s big" data-on-click="auth_liveStaff">Staff sign in</button></div>${errCard()}`;
}
export const unregisteredUI = () => `<div class="card"><h2>No Perks account yet</h2><p>Your number ${esc(S.user.phone || '')} is verified. Visit Samuhia Cyber and give this number at your next purchase to start earning points.</p><p class="mu">Have a friend’s referral code? Show it to the operator on your first purchase above KES 50.</p></div>`;

export const loginUI2 = () => (isLive() ? liveLoginUI() : view.otp ? demoOtpUI() : demoLoginUI());

/** Auth state from Firebase (live only): routes a signed-in user to the staff or customer screens. */
export async function onAuth(user) {
  const { live, loadCustomerSession } = await import('../services/live.js');
  view.loading = false;
  if (!user) { setS(emptyState()); view.otpPhone = null; render(); return; }
  view.loading = true; render();
  try {
    if (user.phone) await loadCustomerSession(user);
    else {
      await live.refresh();
      S.user = { role: 'op', uid: user.uid, email: user.email };
    }
    view.authError = '';
  } catch (e) {
    view.authError = e.code === 'permission-denied' ? 'This account is not allowed to use the Perks operator screens.' : errText(e);
    view.loading = false;
    await runtime.auth.signOut();
    return;
  }
  view.loading = false; render();
}

export async function logout() {
  if (isLive()) { await runtime.auth.signOut(); return; }
  S.user = null; save(); render();
}

const busy = async (fn) => { try { await fn(); } catch (e) { view.authError = ''; toast(errText(e)); } };
registerActions({
  auth_demoOperator() { if ($('#u').value === 'admin@samuhia.demo' && $('#p').value === 'Samuhia@2026!') { S.user = { role: 'op' }; save(); render(); } else toast('Invalid credentials'); },
  auth_demoOtp(p) { demoOtpStart(p[0]); },
  auth_demoPhone() { const c = S.cs.find((x) => x.phone === norm($('#cp').value)); c ? demoOtpStart(c.id) : toast('Number not registered'); },
  auth_demoVerify(p) { if ($('#ot').value === '123456') { S.user = { role: 'cust', id: p[0] }; view.otp = null; save(); render(); } else toast('Wrong code'); },
  auth_back() { view.otp = null; view.otpPhone = null; view.authError = ''; render(); },
  auth_liveSend() { return busy(async () => { const ph = norm($('#lp').value); if (!ph) return toast('Enter a valid Kenyan number'); await runtime.auth.sendOtp(ph); view.otpPhone = ph; view.authError = ''; render(); }); },
  auth_liveVerify() { return busy(async () => { const code = ($('#lc').value || '').replace(/\D/g, ''); if (code.length !== 6) return toast('Enter the 6-digit code'); await runtime.auth.verifyOtp(view.otpPhone, code); }); },
  auth_liveStaff() { return busy(async () => { const em = $('#em').value.trim(), pw = $('#pw').value; if (!em || !pw) return toast('Enter email and password'); await runtime.auth.signInOperator(em, pw); }); },
});

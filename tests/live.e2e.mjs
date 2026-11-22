/* Live-mode end-to-end: the real Perks frontend (jsdom) -> service layer -> the REAL PAY backend handlers on a fake Firestore.
 * Run:  PAY_FUNCTIONS=../PAY/functions npm run test:e2e     (after `npm run build` in PAY/functions). Skips if PAY_FUNCTIONS is unset. */
import path from 'node:path';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';

if (!process.env.PAY_FUNCTIONS) { console.log('live e2e skipped: set PAY_FUNCTIONS=<path to PAY/functions>'); process.exit(0); }
const PAY = path.resolve(process.env.PAY_FUNCTIONS), req = createRequire(import.meta.url);
const { FakeDb } = req(path.join(PAY, 'test/fake-orderby.js'));
const { handleOperator, handleCustomer } = req(path.join(PAY, 'lib/perks/handlers.js'));
const { PerksError } = req(path.join(PAY, 'lib/perks/types.js'));

const dom = new JSDOM('<!doctype html><html><body><header><div class="logo">Perks</div><div id="who"></div></header><main id="app"></main><nav id="nav"></nav><div id="toast"></div></body></html>', { url: 'https://perks.samuhia.co.ke/join?ref=amani7' });
const W = dom.window;
Object.assign(globalThis, { document: W.document, localStorage: W.localStorage, location: W.location });

const state = await import('../js/core/state.js');
const { ApiError } = await import('../js/services/api.js');
const { boot } = await import('../js/app/bootstrap.js');
const { bal } = await import('../js/modules/points.js');

// ---- fake "server": real handlers, JSON round-trip like the network, auth stub like Firebase ----
const db = new FakeDb(), sent = []; let pid = 0, failNext = false, cur = null; const listeners = [];
const send = async (phone, message) => { if (failNext) { failNext = false; return { success: false, error: 'gateway down' }; } sent.push({ phone, message }); return { success: true, providerId: 'P' + (++pid) }; };
const wire = async (fn) => { try { return JSON.parse(JSON.stringify((await fn()) ?? null)); } catch (e) { if (e instanceof PerksError) throw new ApiError(e.code, e.message); throw e; } };
const emit = () => listeners.forEach((cb) => cb(cur));
const rt = {
  live: true,
  transport: {
    op: (a, p) => wire(() => { if (!cur || cur.uid !== 'op1') throw new ApiError('permission-denied', 'Not a Perks operator.'); return handleOperator(db, send, 'op1', a, p); }),
    me: (a, p) => wire(() => { if (!cur?.phone) throw new ApiError('permission-denied', 'Verify your phone number.'); return handleCustomer(db, { uid: cur.uid, phone: cur.phone }, a, p); }),
  },
  auth: {
    async signInOperator(email, pw) { if (pw !== 'correct-horse') throw new ApiError('auth/invalid-credential', 'Wrong email or password.'); cur = { uid: email.startsWith('op') ? 'op1' : 'stranger', email, phone: null }; emit(); },
    async sendOtp() { return { ok: true }; },
    async verifyOtp(phone, code) { if (code !== '123456') throw new ApiError('invalid-argument', 'The code is incorrect.'); cur = { uid: 'u' + phone, email: null, phone }; emit(); },
    async signOut() { cur = null; emit(); },
    onChange(cb) { listeners.push(cb); cb(cur); },
  },
};

// ---- helpers ----
const $ = (s) => document.querySelector(s), sleep = (ms) => new Promise((r) => setTimeout(r, ms)), settle = () => sleep(120);
const text = () => document.body.textContent;
const mk = (t) => new W.MouseEvent(t, { bubbles: true });
const clickEl = (el) => el.dispatchEvent(mk('click'));
const fire = (el, t) => el.dispatchEvent(new W.Event(t, { bubbles: true }));
const type = (el, v) => { el.value = v; fire(el, 'input'); };
const change = (el, v) => { el.value = v; fire(el, 'change'); };
const find = (sel, t) => [...document.querySelectorAll(sel)].find((e) => e.textContent.includes(t));
const press = async (t, sel = 'button,[data-on-click]') => { const e = find(sel, t); if (!e) throw new Error('no control: ' + t + '\n' + text().slice(0, 300)); clickEl(e); await settle(); };
const nav = async (l) => { clickEl(find('#nav a', l)); await settle(); };
const confirmDialog = async (input) => { if (input !== undefined) $('#mi').value = input; clickEl($('#my')); await sleep(400); };
const toastText = () => $('#toast').textContent;
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); };
const noInline = () => ok(!/\son(click|input|change)=/.test(document.body.innerHTML), 'inline handler in DOM');
const S = () => state.S;
const sale = async (phone, price, extra = {}) => {
  await nav('New Sale'); type($('#ph'), phone); type($('#its input'), String(price));
  if (extra.ref) type($('[data-on-input="modules_transactions_7"]'), extra.ref);
  await press('RECORD SALE'); await confirmDialog(); await sleep(250);
};

// ---- 1. boot live: login page, join card, no demo data, nothing persisted ----
await boot(rt); await settle();
ok(text().includes('invited to Samuhia Perks') && text().includes('AMANI7'), 'join card with the referral code');
ok(S().cs.length === 0 && !text().includes('admin@samuhia.demo'), 'live starts empty with no demo credentials');
for (const k of ['S', 'render', 'go', 'bal']) ok(!(k in globalThis), 'global leak ' + k);

// ---- 2. staff sign-in: wrong password, stranger, operator ----
type($('#em'), 'op@samuhia.co.ke'); type($('#pw'), 'nope'); await press('Staff sign in');
ok(toastText().includes('Wrong email or password') && !S().user, 'bad password rejected');
type($('#em'), 'stranger@x.co'); type($('#pw'), 'correct-horse'); await press('Staff sign in'); await settle();
ok(!S().user && text().includes('not allowed to use the Perks operator'), 'non-operator is refused and signed out');
type($('#em'), 'op@samuhia.co.ke'); type($('#pw'), 'correct-horse'); await press('Staff sign in'); await sleep(300);
ok(S().user?.role === 'op', 'operator signed in');
const n = document.querySelectorAll('#nav a').length; ok(n === 13, 'nav items ' + n);
for (let i = 0; i < n; i++) { clickEl(document.querySelectorAll('#nav a')[i]); await settle(); ok($('#app').innerHTML.length > 40, 'empty screen ' + i); noInline(); }

// ---- 3. sales, referral reward, SMS ----
await sale('0711111111', 100);
ok(text().includes('Sale recorded successfully'), 'sale 1 recorded');
const inviter = S().cs.find((c) => c.phone === '+254711111111'); ok(inviter && bal(S(), inviter.id) === 7, 'inviter has 7 pts');
ok(sent.some((m) => /Welcome to Samuhia Perks/.test(m.message)) && sent.some((m) => /KES 100 received/.test(m.message)), 'welcome + receipt SMS');
await sale('0722222222', 200, { ref: inviter.code });
ok(text().includes('Referral rewarded'), 'referral rewarded on first qualifying sale');
const invitee = S().cs.find((c) => c.phone === '+254722222222');
ok(bal(S(), inviter.id) === 57 && bal(S(), invitee.id) === 44, 'inviter 7+50, invitee 14+30');
ok(S().refs.some((r) => r.st === 'REWARDED'), 'referral listed as REWARDED');
await nav('Referrals'); ok(text().includes('REWARDED'), 'referrals screen shows it');

// ---- 4. redemption through the UI, backend rules enforced ----
await sale('0711111111', 2000);                         // +140 -> 197
await nav('Redemptions'); type($('#app input'), '0711111111'); await settle();
type($('#rd input'), '50'); await press('Confirm redemption'); ok(toastText().includes('Minimum'), 'below-minimum refused');
type($('#rd input'), '100'); await press('Confirm redemption'); await confirmDialog();
ok(bal(S(), inviter.id) === 97 && sent.some((m) => /redeemed 100 pts for KES 20/.test(m.message)), '100 pts = KES 20, balance 97, SMS sent');

// ---- 5. reversal (spent points blocked, other sale reversed) ----
await nav('Transactions');
const big = S().tx.find((t) => t.total === 2000);
clickEl(find('tr.cr', big.id)); await settle(); await press('Reverse sale'); await confirmDialog('typo'); await settle();
ok(S().tx.find((t) => t.id === big.id).status === 'COMPLETED' && /spent/.test(toastText()), 'cannot reverse sale whose points were spent');
const small = S().tx.find((t) => t.total === 200);
await nav('Transactions'); clickEl(find('tr.cr', small.id)); await settle(); await press('Reverse sale'); await confirmDialog('wrong amount'); await settle();
ok(S().tx.find((t) => t.id === small.id).status === 'REVERSED' && bal(S(), invitee.id) === 30, 'sale reversed with a ledger adjustment');

// ---- 6. vouchers ----
await nav('Vouchers'); type($('#vv'), '50'); await press('Create voucher');
const v = S().vo.find((x) => x.val === 50); ok(v && v.st === 'AVAILABLE', 'voucher created');
await press('Assign'); await confirmDialog('0722222222'); await settle();
ok(S().vo.find((x) => x.id === v.id).st === 'AWARDED' && sent.some((m) => /won voucher/.test(m.message)), 'voucher awarded + SMS');

// ---- 7. campaign + consent: advert only for opted-in customers, no STOP keyword ----
await nav('Campaigns');
type($('#cn'), 'Samuhia Desk'); $('#ca').value = 'Looking for extra income? Discover Samuhia Desk.'; type($('#cu'), 'https://perks.samuhia.co.ke');
await press('Save campaign'); const camp = S().camps.find((k) => k.name === 'Samuhia Desk'); ok(camp, 'campaign saved');
await press('Make active'); ok(S().act === camp.id, 'campaign active');
sent.length = 0; await sale('0722222222', 100);
ok(sent.length && sent.every((m) => !/Samuhia Desk|STOP/.test(m.message)), 'no advert without consent');
await nav('Customers'); clickEl(find('tr.cr', '+254722222222')); await settle(); await press('Opted out'); await settle();
ok(S().cs.find((c) => c.id === invitee.id).mkt === true, 'consent recorded');
sent.length = 0; await sale('0722222222', 100);
ok(/Discover Samuhia Desk/.test(sent[0].message) && /Opt out: perks\.samuhia\.co\.ke/.test(sent[0].message) && !/STOP|Reply/i.test(sent[0].message), 'advert + opt-out pointer with consent');

// ---- 8. templates, settings, failed SMS retry ----
await nav('Templates'); $('#tb').value = 'Hi {{secret}}'; await press('Save template');
ok(/Unknown placeholder/.test(toastText()), 'bad template placeholder refused');
await nav('Templates'); $('#tb').value = 'Got KES {{amount}}, balance {{pointsBalance}} pts.'; await press('Save template'); await settle();
sent.length = 0; await sale('0722222222', 100); ok(sent.some((m) => /Got KES 100, balance/.test(m.message)), 'custom template used');
await nav('Settings'); change($('[data-on-change="modules_settings_1"]'), '8'); await settle(); ok(S().cfg.sv === 8, 'rate updated on the server');
failNext = true; await sale('0722222222', 100);
await nav('SMS Centre'); const failedRow = S().sms.find((m) => m.st === 'FAILED'); ok(failedRow, 'failed SMS visible');
await press('Retry', 'button'); await settle(); ok(S().sms.find((m) => m.id === failedRow.id).st === 'SENT', 'retry delivers');
await nav('Reports'); await nav('Overview'); noInline();

// ---- 9. customer side: OTP login, own data only, consent toggle, unregistered number ----
await press('Log out'); await settle(); ok(!S().user, 'signed out');
ok(S().cs.length === 0 && S().tx.length === 0, 'operator data wiped on logout');
type($('#lp'), '0722222222'); await press('Send code'); type($('#lc'), '000000'); await press('Verify'); ok(/incorrect/.test(toastText()), 'wrong code refused');
type($('#lc'), '123456'); await press('Verify'); await sleep(300);
ok(S().user?.role === 'cust' && text().includes('Discover Samuhia') && text().includes('Lipa Mdogo Mdogo'), 'customer dashboard with Discover cards');
ok(S().cs.length === 1 && S().cs[0].phone === '+254722222222' && S().tx.every((t) => t.phone === '+254722222222'), 'customer sees only their own data');
ok(!find('button', 'Redeem'), 'no customer redeem control');
await press('Marketing:'); await settle(); ok(S().cs[0].mkt === false, 'customer opted out');
await press('Log out'); await settle();
type($('#lp'), '0733333333'); await press('Send code'); type($('#lc'), '123456'); await press('Verify'); await sleep(300);
ok(text().includes('No Perks account yet'), 'unregistered number gets a clear message');

// ---- 10. privacy and hygiene ----
ok(W.localStorage.length === 0, 'nothing from live mode is written to localStorage');
noInline();
console.log('live e2e OK');
process.exit(0);

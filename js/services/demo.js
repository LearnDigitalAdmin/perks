// Demo service: the same contract as live.js, executed on the local simulated state (persisted in localStorage).
// Keep behaviour and error messages aligned with the backend so the demo is a faithful rehearsal of live.
import { S, view } from '../core/state.js';
import { nmc, norm, now, save } from '../core/utils.js';
import { L, bal } from '../modules/points.js';
import { sendSms } from '../modules/sms.js';
import { post } from '../modules/transactions.js';
import { award } from '../modules/vouchers.js';
import { ApiError, sleep } from './api.js';

const fail = (code, msg) => { throw new ApiError(code, msg); };
const CFG_KEYS = { servicesPointsRate: 'sv', productsPointsRate: 'pr', referrerReward: 'ref', inviteeReward: 'inv', smsCost: 'sms', minimumRedemption: 'min', referralMinimumPurchase: 'refMin' };

export const demo = {
  async refresh() {},
  async recordSale({ phone, items, ne, ref }) {
    await sleep(450);
    const c = S.cs.find((x) => x.phone === phone), rc = ref && S.cs.find((x) => x.code === ref);
    if (ref && !rc) fail('not-found', 'Referral code not found.');
    if (rc && c && rc.id === c.id) fail('failed-precondition', 'Self-referral is not allowed.');
    if (rc && c) fail('failed-precondition', "A referral can only be attached on a customer's first visit.");
    const r = post(S, phone, items, ne);
    if (rc && r.isNew && !r.c.by) {
      r.c.by = rc.id;
      const x = { id: 'r' + (S.refs.length + 1), from: rc.id, to: r.c.id, amt: 0, st: 'PENDING' };
      if (r.t.elig > S.cfg.refMin) {
        Object.assign(x, { st: 'REWARDED', amt: r.t.elig, txId: r.t.id });
        L(S, rc.id, 'REFERRAL', S.cfg.ref, 'Referral reward'); L(S, r.c.id, 'REFERRAL', S.cfg.inv, 'Welcome referral reward');
        sendSms(S, rc, 'ref', { pts: S.cfg.ref, bal: bal(S, rc.id) }); sendSms(S, r.c, 'ref', { pts: S.cfg.inv, bal: bal(S, r.c.id) });
        r.t.refRewarded = true;
      }
      S.refs.push(x);
    }
    save();
    return { t: r.t, c: r.c, bal: bal(S, r.c.id), isNew: r.isNew };
  },
  async redeem({ customer, points }) {
    await sleep(250);
    const b = bal(S, customer.id);
    if (points < S.cfg.min) fail('failed-precondition', `Minimum redemption is ${S.cfg.min} points.`);
    if (points > b) fail('failed-precondition', 'Customer does not have enough points.');
    const value = (points * 20) / 100;
    L(S, customer.id, 'REDEEM', -points, 'Redeemed in shop');
    sendSms(S, customer, 'redeem', { pts: points, val: value, bal: bal(S, customer.id) });
    save();
    return { valueKes: value, bal: bal(S, customer.id) };
  },
  async reverseSale({ id, reason }) {
    await sleep(200);
    const t = S.tx.find((x) => x.id === id);
    if (!t) fail('not-found', 'Transaction not found.');
    if (t.status !== 'COMPLETED') fail('failed-precondition', 'Only completed sales can be reversed.');
    if (bal(S, t.c) < t.pts) fail('failed-precondition', 'The customer has already spent these points; reverse the redemption first.');
    t.status = 'REVERSED'; t.reason = reason;
    L(S, t.c, 'REVERSAL', -t.pts, `Reversal of ${id}: ${reason}`);
    S.audit.push({ at: now(), a: `REVERSE ${id} ${reason}` }); save();
  },
  async registerReferral({ phone, code }) {
    await sleep(200);
    const f = S.cs.find((c) => c.code === code);
    if (!f) fail('not-found', 'Referral code not found.');
    if (f.phone === phone) fail('failed-precondition', 'Self-referral is not allowed.');
    let c = S.cs.find((x) => x.phone === phone);
    if (c && S.refs.some((r) => r.to === c.id)) fail('already-exists', 'This customer already has a referrer.');
    if (!c) { c = { id: 'c' + (S.cs.length + 1), phone, code: Math.random().toString(36).slice(2, 8).toUpperCase(), mkt: false, by: f.id, created: now() }; S.cs.push(c); }
    c.by = f.id; S.refs.push({ id: 'r' + (S.refs.length + 1), from: f.id, to: c.id, amt: 0, st: 'PENDING' }); save();
  },
  async createVoucher({ type, value }) { await sleep(150); S.vo.push({ id: 'v' + S.vo.length, code: type.slice(0, 4) + value + Math.random().toString(36).slice(2, 5).toUpperCase(), type, val: value, st: 'AVAILABLE', c: null, at: now() }); save(); },
  async bulkVouchers({ type, value, count }) { for (let i = 0; i < count; i++) await demo.createVoucher({ type, value }); },
  async assignVoucher({ id, phone }) {
    await sleep(200);
    const v = S.vo.find((x) => x.id === id), c = S.cs.find((x) => x.phone === phone);
    if (!c) fail('not-found', 'Customer not found.');
    if (!v || v.st !== 'AVAILABLE') fail('failed-precondition', 'Voucher is not available.');
    award(v, c.id); save();
  },
  async setVoucherStatus({ id, status }) {
    const v = S.vo.find((x) => x.id === id);
    if (status === 'REDEEMED' && v.st !== 'AWARDED') fail('failed-precondition', 'Only an awarded voucher can be redeemed.');
    if (status === 'VOID' && v.st !== 'AVAILABLE' && v.st !== 'AWARDED') fail('failed-precondition', 'This voucher can no longer be voided.');
    v.st = status; S.audit.push({ at: now(), a: `${status} ${id}` }); save();
  },
  async saveCampaign(k) {
    let c = S.camps.find((x) => x.id === k.id);
    if (!c) { c = { id: 'k' + Date.now(), on: true }; S.camps.push(c); }
    Object.assign(c, { name: k.name, ad: k.ad, url: k.url, promo: k.promo, start: k.start, end: k.end, pr: k.pr || 1 }); save();
  },
  async toggleCampaign(id) { const k = S.camps.find((x) => x.id === id); k.on = !k.on; if (!k.on && S.act === id) S.act = ''; save(); },
  async setActiveCampaign(id) { S.act = id; save(); },
  async saveTemplate({ id, body }) { S.tpl[id] = body; (S.tplAt = S.tplAt || {})[id] = now(); save(); },
  async updateSettings(patch) { for (const [k, v] of Object.entries(patch)) if (CFG_KEYS[k]) S.cfg[CFG_KEYS[k]] = Number(v) || 0; save(); },
  async setDrawEnabled(v) { S.draw = v; save(); },
  async runDraw() {
    const rs = S.refs.filter((r) => r.st === 'REWARDED' && !r.draw), vs = S.vo.filter((v) => v.st === 'AVAILABLE');
    if (!rs.length || !vs.length) fail('failed-precondition', 'Needs a rewarded referral and an available voucher.');
    const r = rs[Math.floor(Math.random() * rs.length)], v = vs[Math.floor(Math.random() * vs.length)];
    award(v, r.from); r.draw = `${v.code} (${v.type} ${v.val})`; S.audit.push({ at: now(), a: 'DRAW ' + r.id }); save();
    return { message: `Winner ${nmc(r.from)}: ${v.code}` };
  },
  async retrySms(id) { const m = S.sms.find((x) => x.id === id); m.st = 'RETRIED'; await sleep(900); m.st = 'SENT'; save(); },
  async setConsent({ customer, value }) { const x = S.cs.find((y) => y.id === customer.id); x.mkt = value; S.audit.push({ at: now(), a: `CONSENT ${x.phone} ${x.mkt}` }); save(); },
  async addCustomer(phone) {
    if (S.cs.some((c) => c.phone === phone)) return S.cs.find((c) => c.phone === phone).id;
    const c = { id: 'c' + (S.cs.length + 1), phone, code: Math.random().toString(36).slice(2, 8).toUpperCase(), mkt: false, by: null, created: now() };
    S.cs.push(c); sendSms(S, c, 'welcome', { code: c.code }); save(); return c.id;
  },
  async openCustomer() {},
  async setMarketing(value) { const x = S.cs.find((y) => y.id === S.user.id); x.mkt = value; S.audit.push({ at: now(), a: `CONSENT ${x.phone} ${value}` }); save(); return x; },
};
void norm; void view;

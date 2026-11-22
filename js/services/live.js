// Live service: every action is a call to perks_op / perks_me; screens are fed by re-reading the affected lists.
import { S, setS, view } from '../core/state.js';
import { itemType } from '../modules/points.js';
import { me, op } from './api.js';
import * as A from './adapt.js';
import { LIVE_TEMPLATE_DEFAULTS } from './templates.js';

export const emptyState = () => ({ cfg: { sv: 7, pr: 4, min: 100, ref: 50, inv: 30, refMin: 50, sms: 0.2 }, cs: [], tx: [], led: [], sms: [], refs: [], vo: [], camps: [], act: '', tpl: { ...LIVE_TEMPLATE_DEFAULTS }, tplAt: {}, audit: [], draw: false, user: null, n: 1 });

const WINDOW_MS = 90 * 24 * 3600 * 1000; // history loaded for lists and reports
const ALL = ['settings', 'customers', 'tx', 'ledger', 'referrals', 'vouchers', 'campaigns', 'templates', 'smsLog', 'audit'];
const list = (collection, limit, since) => op('list', { collection, limit, ...(since ? { since } : {}) }).then((r) => r.items);

export async function refresh(keys = ALL) {
  const since = Date.now() - WINDOW_MS;
  const jobs = {
    settings: () => op('getSettings'), customers: () => list('customers', 1000), tx: () => list('tx', 1000, since), ledger: () => list('ledger', 1000, since),
    referrals: () => list('referrals', 500), vouchers: () => list('vouchers', 500), campaigns: () => list('campaigns', 100), templates: () => list('templates', 50),
    smsLog: () => list('smsLog', 500, since), audit: () => list('audit', 50),
  };
  const got = await Promise.all(keys.map((k) => jobs[k]()));
  const d = Object.fromEntries(keys.map((k, i) => [k, got[i]]));
  if (d.settings) { S.cfg = A.cfg(d.settings); S.act = d.settings.activeCampaignId || ''; S.draw = d.settings.referralDrawEnabled === true; }
  if (d.customers) S.cs = d.customers.map(A.customer);
  if (d.tx) S.tx = d.tx.map(A.tx);
  if (d.ledger) S.led = d.ledger.map(A.ledger);
  if (d.referrals) S.refs = d.referrals.map(A.referral);
  if (d.vouchers) S.vo = d.vouchers.map(A.voucher);
  if (d.campaigns) S.camps = d.campaigns.map(A.campaign);
  if (d.templates) { S.tpl = { ...LIVE_TEMPLATE_DEFAULTS }; S.tplAt = {}; for (const t of d.templates) { S.tpl[t.id] = A.e(t.body); S.tplAt[t.id] = t.updatedAt; } }
  const camp = (id) => (S.camps.find((k) => k.id === id) || {}).name;
  if (d.smsLog) S.sms = d.smsLog.map((m) => A.sms(m, camp));
  if (d.audit) S.audit = d.audit.map(A.audit);
}

/** Customer's own account (perks_me). Returns false when this phone has no Perks account yet. */
export async function loadCustomerSession(user) {
  const r = await me('summary');
  const base = emptyState();
  if (!r.registered) { setS({ ...base, user: { role: 'cust', id: null, phone: user.phone, unregistered: true } }); return false; }
  const c = A.customer(r.customer);
  setS({ ...base, cs: [c], tx: r.tx.map(A.tx), led: r.ledger.map(A.ledger), vo: r.vouchers.map(A.voucher),
    refs: r.referrals.map((x, i) => ({ id: 'r' + i, from: c.id, to: null, st: x.status, amt: 0 })), user: { role: 'cust', id: c.id, phone: c.phone } });
  return true;
}

const salePts = (t) => ({ id: t.id, total: t.totalAmount, elig: t.eligibleAmount, pts: t.pointsEarned });

export const live = {
  refresh,
  async recordSale({ phone, items, ne, ref, key }) {
    const r = await op('recordSale', { phone, items: items.map((i) => ({ itemName: i.name, itemType: itemType(i.name), price: i.price })), nonEligibleAmount: ne, referralCode: ref || undefined, idempotencyKey: key });
    await refresh(['customers', 'tx', 'ledger', 'smsLog', 'referrals']);
    const n = r.notifications || [];
    return { t: { ...salePts(r.transaction), refRewarded: n.some((x) => x.type === 'referralReferrer') }, c: { id: r.customer.id, phone: r.customer.phone }, bal: r.customer.pointsBalance, isNew: n.some((x) => x.type === 'welcome'), duplicate: r.duplicate };
  },
  async redeem({ customer, points, key }) {
    const r = await op('redeem', { phone: customer.phone, points, idempotencyKey: key });
    await refresh(['customers', 'ledger', 'smsLog']);
    return { valueKes: r.redemption.valueKes, bal: r.redemption.balanceAfter };
  },
  async reverseSale({ id, reason }) { await op('reverseSale', { transactionId: id, reason }); await refresh(['customers', 'tx', 'ledger', 'audit']); },
  async registerReferral({ phone, code }) { await op('registerReferral', { inviteePhone: phone, code }); await refresh(['customers', 'referrals', 'audit']); },
  async createVoucher({ type, value }) { await op('createVoucher', { type, value }); await refresh(['vouchers']); },
  async bulkVouchers({ type, value, count }) { await op('bulkVouchers', { type, value, count }); await refresh(['vouchers']); },
  async assignVoucher({ id, phone }) { await op('assignVoucher', { voucherId: id, phone }); await refresh(['vouchers', 'customers', 'ledger', 'smsLog']); },
  async setVoucherStatus({ id, status }) { await op('setVoucherStatus', { voucherId: id, status }); await refresh(['vouchers']); },
  async saveCampaign(k) { await op('saveCampaign', { id: k.id || undefined, name: k.name, advert: k.ad, destinationUrl: k.url, priority: k.pr, startDate: k.start, endDate: k.end, promotes: k.promo }); await refresh(['campaigns']); },
  async toggleCampaign(id) { const k = S.camps.find((x) => x.id === id); await op('setCampaignActive', { id, active: !k.on }); await refresh(['campaigns', 'settings']); },
  async setActiveCampaign(id) { await op('setActiveCampaign', { id }); await refresh(['settings']); },
  async saveTemplate({ id, body }) { await op('saveTemplate', { id, body }); await refresh(['templates']); },
  async updateSettings(patch) { await op('updateSettings', { patch }); await refresh(['settings', 'audit']); },
  async setDrawEnabled(v) { await op('updateSettings', { patch: { referralDrawEnabled: v } }); await refresh(['settings', 'audit']); },
  async runDraw() { await op('runDraw'); return { message: 'Draw complete' }; },
  async retrySms(id) { const r = await op('retrySms', { id }); await refresh(['smsLog']); return r; },
  async setConsent({ customer, value }) { await op('setConsent', { phone: customer.phone, marketing: value }); await refresh(['customers', 'audit']); },
  async addCustomer(phone) { const r = await op('createCustomer', { phone }); await refresh(['customers', 'smsLog']); return r.customer.id; },
  async openCustomer(id) {
    const c = S.cs.find((x) => x.id === id); if (!c) return;
    const r = await op('getCustomer', { phone: c.phone }); if (!r.found) return;
    S.tx = A.mergeBy(S.tx, r.tx.map(A.tx)); S.led = A.mergeBy(S.led, r.ledger.map(A.ledger)); S.vo = A.mergeBy(S.vo, r.vouchers.map(A.voucher));
    const camp = (cid) => (S.camps.find((k) => k.id === cid) || {}).name; S.sms = A.mergeBy(S.sms, r.smsLog.map((m) => A.sms(m, camp)));
  },
  async setMarketing(value) { await me('setMarketing', { value }); const r = await me('summary'); const c = A.customer(r.customer); S.cs = [c]; view.dirty = false; return c; },
};

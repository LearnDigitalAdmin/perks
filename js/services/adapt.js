// Backend documents -> the shapes the screens already render (S.cs, S.tx, ...). One place to change if the API changes.

export const iso = (ms) => new Date(ms || 0).toISOString();
/** Anything free-text from the server is escaped once here, because the screens build HTML strings. */
export const e = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const cfg = (s) => ({ sv: s.servicesPointsRate, pr: s.productsPointsRate, min: s.minimumRedemption, ref: s.referrerReward, inv: s.inviteeReward, refMin: s.referralMinimumPurchase, sms: s.smsCost });
export const customer = (c) => ({ id: c.id, phone: c.phone, code: c.referralCode, mkt: c.marketingConsent === true, by: c.referredBy || null, created: iso(c.createdAt), points: c.pointsBalance || 0, spend: c.totalEligibleSpend || 0, txCount: c.txCount || 0 });
export const tx = (t) => ({ id: t.id, c: t.customerId, phone: t.phone, total: t.totalAmount, elig: t.eligibleAmount, pts: t.pointsEarned, status: t.status, reason: e(t.reversalReason), at: iso(t.createdAt),
  items: (t.items || []).map((i) => ({ name: e(i.itemName), type: i.itemType, price: i.totalPrice, rate: i.pointsRate, pts: i.pointsEarned })) });
export const ledger = (l) => ({ id: l.id, c: l.customerId, type: l.type, pts: l.points, after: l.balanceAfter, desc: e(l.description), at: iso(l.createdAt) });
export const sms = (m, campName) => ({ id: m.id, phone: m.phone, type: m.templateId, camp: m.campaignId ? (campName(m.campaignId) || 'Campaign') : null, msg: e(m.message), st: m.status, delivery: m.delivery || 'UNKNOWN', cost: m.estimatedCost, at: iso(m.createdAt) });
export const referral = (r) => ({ id: r.id, from: r.referrerCustomerId, to: r.referredCustomerId, amt: r.qualifyingAmount || 0, st: r.status, txId: r.qualifyingTransactionId || null, draw: r.drawResult || null });
export const voucher = (v) => ({ id: v.id, code: v.code, type: v.type, val: v.value, st: v.status, c: v.customerId || null, at: iso(v.createdAt) });
export const campaign = (k) => ({ id: k.id, name: e(k.name), ad: e(k.advert), url: e(k.destinationUrl), on: k.active !== false, pr: k.priority || 1, start: k.startDate || '', end: k.endDate || '', promo: e(k.promotes) });
export const audit = (a) => ({ a: e(`${a.action} ${a.ref || ''}`.trim()), at: iso(a.createdAt || a.at) });
/** Merge newest data over what we already hold, keeping every row once. */
export const mergeBy = (have, items, key = 'id') => { const m = new Map(have.map((x) => [x[key], x])); for (const i of items) m.set(i[key], i); return [...m.values()]; };

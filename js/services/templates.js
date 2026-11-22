// SMS template metadata shared by the editor, previews and both services. Keep in sync with PAY perks/rules.ts.

export const LIVE_TEMPLATE_DEFAULTS = {
  sale: 'Rexnet Cyber: KES {{amount}} received. You earned {{pointsEarned}} pts. Balance {{pointsBalance}} pts (KES {{balanceValue}}).',
  redeem: 'Rexnet Cyber: you redeemed {{pointsRedeemed}} pts for KES {{discount}} off. Balance {{pointsBalance}} pts.',
  referralReferrer: 'Samuhia Perks: your referral qualified! You earned {{referrerReward}} pts. Balance {{pointsBalance}} pts.',
  referralInvitee: 'Samuhia Perks: welcome bonus! You earned {{inviteeReward}} pts. Balance {{pointsBalance}} pts.',
  voucher: 'Samuhia Perks: you won voucher {{voucherCode}} worth {{voucherValue}}. Show it at Samuhia Cyber.',
  welcome: 'Welcome to Samuhia Perks! Your referral code is {{referralCode}}. Earn points on every visit.',
};
export const LIVE_PLACEHOLDERS = ['phone', 'amount', 'service', 'pointsEarned', 'pointsBalance', 'balanceValue', 'pointsRedeemed', 'discount', 'referralCode', 'referrerReward', 'inviteeReward', 'voucherCode', 'voucherValue'];
export const DEMO_PLACEHOLDERS = ['amount', 'pts', 'bal', 'val', 'code'];
export const SAMPLE_VARS = {
  phone: '+254712345678', amount: 600, pointsEarned: 36, pointsBalance: 255, balanceValue: 51, pointsRedeemed: 100, discount: 20, service: 'Printing',
  referralCode: 'AMANI7', referrerReward: 50, inviteeReward: 30, voucherCode: 'DISC50', voucherValue: 'KES 50 off',
  pts: 36, bal: 255, val: 51, code: 'DISC50',
};
/** Accepts {{name}} (live) and {name} (demo). Unknown placeholders are left visible so mistakes show in the preview. */
export const fillTemplate = (body, vars = SAMPLE_VARS) => String(body).replace(/\{\{?\s*(\w+)\s*\}?\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
export const OPT_OUT = 'Opt out: perks.samuhia.co.ke';

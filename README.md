# Samuhia Perks

Loyalty, rewards, referrals and promotional SMS for Samuhia Cyber. Plain HTML, CSS and ES modules, no build step.

Status: full interactive DEMO (simulated auth, data and SMS). Live wiring comes next, inside the shared DESK/PAY Firebase project and backend.

## Structure
- `index.html` - entry point
- `css/styles.css` - design tokens and responsive layout (bottom nav on phones, sidebar and tables from 900px)
- `js/app.js` - entry; imports every module, then bootstraps
- `js/core/` - constants, utilities, UI state
- `js/modules/` - one file per domain: data (seed), points, transactions, customers, redemptions, referrals, vouchers, campaigns, sms (+templates), reports, settings, auth, customer-app
- `js/app/` - shell (router, nav, confirm dialog) and bootstrap
- `js/firebase/` - public web config and lazy live client (`DEMO_MODE` flag)
- `tests/smoke.mjs` - renders every screen and records a sale (`npm i && npm test`)

## Run locally
`npx serve .` (or any static server). Demo operator login: `admin@samuhia.demo` / `Samuhia@2026!`. Demo customer OTP: `123456`.

## Demo to live
- All business rules (7 and 4 points per KES 100, 100 points = KES 20, referral above KES 50, consent-gated adverts) live in `modules/points`, `transactions`, `redemptions`, `referrals` and `sms`.
- Live writes must move to the shared backend (Cloud Run + Admin SDK): sales, ledger, redemptions, referral rewards, SMS via the existing provider credentials in Secret Manager. Frontend never writes financial data.
- Auth: Firebase Auth for operator roles, Phone Auth for customers. Add App Check and Firestore Rules before setting `DEMO_MODE = false`.
- The reward draw stays DEMO-only until Kenyan legal and regulatory review.

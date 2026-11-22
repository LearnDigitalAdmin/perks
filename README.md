# Samuhia Perks

Loyalty, rewards, referrals and promotional SMS for Samuhia Cyber. Plain HTML, CSS and native ES modules, no build step. Live at https://perks.samuhia.co.ke, backed by the shared Firebase project `plot-9fd6e` (PAY functions: `perks_op`, `perks_me`, `hpSmsWebhook`).

Add `?demo=1` to the URL for the local DEMO (simulated data and SMS, kept in the browser, badged DEMO). Live mode never writes customer data to the browser.

## Structure
- `index.html`, `css/styles.css` - shell and responsive layout (bottom nav on phones, sidebar and tables from 900px)
- `js/app.js` - entry; `app/bootstrap.js` picks live or demo, `app/events.js` delegates all clicks/inputs (no inline handlers)
- `js/core/` - constants, utils, UI state (live bindings plus setters), action registry
- `js/services/` - the data boundary: `index.js` switches per call between `live.js` (Firebase callables) and `demo.js` (local simulation); `firebase.js` is the only file that talks to the Firebase SDK; `adapt.js` maps API documents to screen shapes and escapes server text
- `js/modules/` - one module per domain (screens + handlers); they only call `svc.*`
- `firebase.json`, `.firebaserc` - hosting site `samuhia-perks` with security headers and an SPA rewrite (`/join?ref=CODE` works)
- `tests/smoke.mjs` (demo) and `tests/live.e2e.mjs` (live, runs the real PAY backend handlers)

## Run and test
```bash
npx serve .                      # then open the URL; add ?demo=1 for the demo
npm i && npm test                # demo smoke test
PAY_FUNCTIONS=../PAY/functions npm run test:e2e   # live end-to-end (build PAY/functions first)
```
Setup, deploy and go-live steps: `docs/LIVE.md`. Production checklist: `docs/LIVE-READINESS.md`.

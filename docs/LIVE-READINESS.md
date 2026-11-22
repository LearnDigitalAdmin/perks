# Live readiness checklist

Status: the frontend is wired to the live backend (see docs/LIVE.md). The items below were the original gap list; what remains is operational (console setup, deploys, real-device checks).

The demo is built to behave like the live app. Rules it already enforces:

- Real ES modules only. No globals, no `window.*` state.
- No inline `onclick`/`oninput`/`onchange`. Elements declare `data-on-<event>` and `data-p-<event>`; handlers are registered per module with `registerActions` and run by one delegated listener (`js/app/events.js`). This is what makes the strict Content-Security-Policy in `index.html` valid.
- State is a single module (`js/core/state.js`); reassignment goes through setters.
- Non-button clickable elements get `role="button"` and `tabindex="0"` and respond to Enter and Space.
- `tests/smoke.mjs` drives the app through DOM events and fails on any inline handler or leaked global.

Before `DEMO_MODE = false`:

1. Move every write (sale, ledger, redemption, referral reward, voucher award, SMS) behind the shared Cloud Run backend. The browser never writes financial data.
2. Server-side validation of rates, referral rule (above KES 50), balance floor, one-time rewards, idempotency keys.
3. Firebase Auth with operator role claims; Phone Auth for customers; a customer reads only their own documents.
4. App Check, Firestore Rules, rate limiting, API key referrer restrictions.
5. SMS through the existing provider credentials in Secret Manager; consent-gated adverts and STOP handling enforced server-side.
6. Replace `modules/data.js` seed and localStorage with Firestore reads; remove the demo login and the demo OTP.
7. Keep the reward draw disabled until Kenyan legal and regulatory review.

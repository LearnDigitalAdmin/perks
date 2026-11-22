# Going live: Perks frontend

Prerequisite: the PAY and PMS patches are deployed (`PAY/docs/perks/DEPLOY.md`): functions `perks_op`, `perks_me`, `hpSmsWebhook`, `sendLoginOtp`, `verifyLoginOtp`, Firestore rules and indexes, `HP_WEBHOOK_TOKEN`.

## 1. Firebase console (project plot-9fd6e)
1. Authentication > Sign-in method: enable **Email/Password**. (Customers use the SMS code, which signs in with a custom token; nothing to enable.)
2. Authentication > Users: add the shop owner (email + strong password). Copy the user's UID.
3. Allow that UID as Perks operator: `cd PAY/functions && GOOGLE_CLOUD_PROJECT=plot-9fd6e node scripts/perks-operators.js add <UID>`
4. Authentication > Settings > Authorized domains: add `perks.samuhia.co.ke`.
5. Google Cloud Console > APIs & Services > Credentials: restrict the web API key to HTTP referrers `https://perks.samuhia.co.ke/*` and `http://localhost:*`.

## 2. Hosting
```bash
firebase hosting:sites:create samuhia-perks --project plot-9fd6e      # once; change the id in firebase.json/.firebaserc if taken
firebase deploy --only hosting --project plot-9fd6e
```
Then Hosting > Add custom domain `perks.samuhia.co.ke` and add the DNS records it shows.

## 3. First checks (use a real phone you control)
1. Open https://perks.samuhia.co.ke/ : staff sign in with the owner account; you should see all screens.
2. Record a sale for your own number: the receipt SMS arrives; Firestore `perks_smsLog` row goes `SENT`, then `delivery: DELIVERED` once the Host Pinnacle webhook is configured.
3. Log out, choose "My rewards", enter the same number: SMS code arrives, dashboard shows the points and the Discover cards.
4. Open `https://perks.samuhia.co.ke/join?ref=<your code>`: invitation card shows.
5. Staff > Settings: the draw stays OFF and `runDraw` refuses until legal approval is set in the console.

## Notes and limits
- Lists load the newest 1000 customers and the last 90 days of sales, ledger and SMS; a customer profile loads that customer's last 50 of each on open. Reports cover the loaded window. Beyond ~1000 customers add paging.
- The customer OTP accepts any Kenyan mobile network (07x and 01x).
- Operator pages hold customer phone numbers in memory only; closing the tab or signing out clears them.
- `?demo=1` is local-only practice data and is clearly badged DEMO.

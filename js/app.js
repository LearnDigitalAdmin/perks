// Entry point. Order matters: constants, utils and state first, bootstrap (initial render) last.
import './core/constants.js';
import './core/utils.js';
import './core/state.js';
import './modules/data.js';
import './modules/points.js';
import './modules/sms.js';
import './modules/transactions.js';
import './modules/customers.js';
import './modules/redemptions.js';
import './modules/referrals.js';
import './modules/vouchers.js';
import './modules/campaigns.js';
import './modules/reports.js';
import './modules/settings.js';
import './modules/auth.js';
import './modules/customer-app.js';
import './app/shell.js';
import './app/bootstrap.js';
import { DEMO_MODE } from './firebase/config.js';

if (!DEMO_MODE) import('./firebase/client.js').then((m) => m.initLive());

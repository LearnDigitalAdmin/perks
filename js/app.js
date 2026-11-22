// Entry point. Everything is a real ES module: no globals, no inline handlers.
// Live by default. Add ?demo=1 to rehearse on local simulated data (clearly badged DEMO, nothing leaves the browser).
import { boot } from './app/bootstrap.js';
import { DEMO_MODE } from './firebase/config.js';

const demo = DEMO_MODE || new URLSearchParams(location.search).get('demo') === '1';
if (demo) await boot({ live: false });
else {
  const { createFirebaseRuntime } = await import('./services/firebase.js');
  await boot(await createFirebaseRuntime());
}

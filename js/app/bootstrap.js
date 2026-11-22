// app/bootstrap: pick the runtime (live or demo), restore state, wire events, first render.
import { initEvents } from './events.js';
import { render } from './shell.js';
import { setS, view } from '../core/state.js';
import { K } from '../core/utils.js';
import { onAuth } from '../modules/auth.js';
import { seed } from '../modules/data.js';
import { emptyState } from '../services/live.js';
import { configureRuntime } from '../services/runtime.js';

function loadDemoState() {
  try { const s = localStorage.getItem(K); if (s) return JSON.parse(s); } catch (e) { /* fall through to seed */ }
  return seed();
}

/** rt = { live: false } for the demo, or the object from services/firebase.js (or a test double) for live. */
export async function boot(rt) {
  configureRuntime(rt);
  setS(rt.live ? emptyState() : loadDemoState());
  const ref = new URLSearchParams(globalThis.location?.search || '').get('ref');
  if (globalThis.location?.pathname.replace(/\/+$/, '').endsWith('/join') && ref) view.joinRef = ref.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  initEvents();
  if (!rt.live) {
    document.querySelector('header .logo')?.insertAdjacentHTML('beforeend', '<span class="demo">DEMO</span>');
    render();
    return;
  }
  view.loading = true;
  render();
  rt.auth.onChange(onAuth);
}

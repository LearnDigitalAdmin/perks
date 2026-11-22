// One delegated listener per event type. Elements declare data-on-<type>="action" and data-p-<type>='[params]'.
// Bubbling is honoured: an action that calls event.stopPropagation() stops the walk.
import { getAction } from '../core/actions.js';

function run(type, e) {
  for (let el = e.target; el && el.nodeType === 1; el = el.parentElement) {
    const name = el.getAttribute('data-on-' + type);
    if (name) {
      const fn = getAction(name);
      if (!fn) console.error('Unknown action', name);
      else {
        let p = [];
        try { p = JSON.parse(el.getAttribute('data-p-' + type) || '[]'); } catch { /* ignore */ }
        fn.call(el, p, e);
      }
      if (e.cancelBubble) return;
    }
  }
}

export function initEvents() {
  for (const t of ['click', 'input', 'change']) document.addEventListener(t, (e) => run(t, e));
  document.addEventListener('keydown', (e) => {
    const el = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && el.getAttribute && el.getAttribute('role') === 'button' && el.hasAttribute('data-on-click')) { e.preventDefault(); el.click(); }
  });
}

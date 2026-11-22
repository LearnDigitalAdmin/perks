// The only thing screens import for data actions. Picks live or demo per call, so one build serves both.
import { demo } from './demo.js';
import { live } from './live.js';
import { isLive } from './runtime.js';

export const svc = new Proxy({}, { get: (_, k) => (...a) => (isLive() ? live : demo)[k](...a) });

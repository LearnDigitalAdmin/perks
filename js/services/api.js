// Thin client for the two Perks callables. Same contract the backend documents (PAY docs/perks/BACKEND.md).
import { runtime } from './runtime.js';

export class ApiError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
export const op = (action, payload = {}) => runtime.transport.op(action, payload);
export const me = (action, payload = {}) => runtime.transport.me(action, payload);
/** Idempotency key: the server records a sale/redemption once per key, so a double tap or retry is safe. */
export const newKey = () => globalThis.crypto?.randomUUID?.() ?? `k-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
export const errText = (e) => (e && e.message ? e.message : 'Something went wrong. Please try again.');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

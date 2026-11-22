// Single source of UI state. Imported bindings are live; reassign only through the setters.

export let S;
export let tab = 'sale';
import { newKey } from '../services/api.js';

// key = idempotency key for this draft; regenerated whenever the draft is edited (see modules/transactions.js).
export const newDraft = () => ({ phone: '', items: [{ name: 'Printing', price: '' }], ne: '', ref: '', key: newKey() });
export let D = newDraft();
export let done = null;
export let lock = false;
export const view = {};
export const setS = (v) => { S = v; };
export const setTab = (v) => { tab = v; };
export const setD = (v) => { D = v; };
export const setDone = (v) => { done = v; };
export const setLock = (v) => { lock = v; };

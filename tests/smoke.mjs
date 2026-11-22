import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><header><div id="who"></div></header><main id="app"></main><nav id="nav"></nav><div id="toast"></div></body></html>', { url: 'https://perks.samuhia.co.ke' });
const W = dom.window;
globalThis.document = W.document;
globalThis.localStorage = W.localStorage;

const state = await import('../js/core/state.js');
const { boot } = await import('../js/app/bootstrap.js');
await boot({ live: false });
const { bal } = await import('../js/modules/points.js');

const $ = (s) => document.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clickEl = (el) => el.dispatchEvent(new W.MouseEvent('click', { bubbles: true }));
const type = (el, v) => { el.value = v; el.dispatchEvent(new W.Event('input', { bubbles: true })); };
const find = (sel, txt) => [...document.querySelectorAll(sel)].find((e) => e.textContent.includes(txt));
const press = (txt) => { const e = find('button,[data-on-click]', txt); if (!e) throw new Error('no control: ' + txt); clickEl(e); };
const noInline = () => { if (/\son(click|input|change)=/.test(document.body.innerHTML)) throw new Error('inline handler in DOM'); };
const ok = (c, m) => { if (!c) throw new Error(m); };

for (const k of ['S', 'render', 'go', 'bal', 'view', 'tab']) ok(!(k in globalThis), 'global leak: ' + k);

// Operator login and every screen, driven through real DOM events
press('Sign in');
const n = document.querySelectorAll('#nav a').length;
ok(n === 13, 'expected 13 nav items, got ' + n);
for (let i = 0; i < n; i++) { clickEl(document.querySelectorAll('#nav a')[i]); ok($('#app').innerHTML.length > 50, 'empty screen ' + i); noInline(); }

// New Sale: phone, price, confirm dialog, record
clickEl(find('#nav a', 'New Sale'));
const before = bal(state.S, 'c1');
type($('#ph'), '0712345678');
type($('#its input'), '100');
press('RECORD SALE');
clickEl($('#my'));
await sleep(800);
ok($('#app').textContent.includes('Sale recorded successfully'), 'sale not recorded');
ok(bal(state.S, 'c1') - before === 7, 'service points wrong');

// Redemption through the confirm dialog
clickEl(find('#nav a', 'Redemptions'));
type($('#app input'), '0712345678');
type($('#rd input'), '100');
press('Confirm redemption');
clickEl($('#my'));
await sleep(600);
ok(bal(state.S, 'c1') === before + 7 - 100, 'redemption balance wrong');
noInline();

// Customer OTP flow
press('Log out');
press('+254712345678');
press('Verify');
ok($('#app').textContent.includes('Discover Samuhia'), 'customer dashboard missing');
noInline();
console.log('smoke OK');
process.exit(0);

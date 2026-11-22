// Runtime switch: live (Firebase callables + real auth) or demo (local simulation). Set once by app/bootstrap.js.

export const runtime = { live: false, transport: null, auth: null };
export const configureRuntime = (r) => Object.assign(runtime, r);
export const isLive = () => runtime.live === true;

// Registry for delegated UI actions (replaces inline onclick/oninput/onchange).

const reg = new Map();
export const registerActions = (o) => { for (const [k, f] of Object.entries(o)) reg.set(k, f); };
export const getAction = (k) => reg.get(k);

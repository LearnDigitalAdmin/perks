// core/utils
import { S } from './state.js';
import { isLive } from '../services/runtime.js';

export const K='sperks_v1';

export const $=s=>document.querySelector(s);

export const money=n=>'KES '+Number(n).toLocaleString('en-KE');

export const now=()=>new Date().toISOString();

export function norm(p){p=String(p).replace(/[\s-]/g,'');if(/^\+254[17]\d{8}$/.test(p))return p;if(/^254[17]\d{8}$/.test(p))return'+'+p;if(/^0[17]\d{8}$/.test(p))return'+254'+p.slice(1);return null}

// Live data (customers, sales, phone numbers) is never written to the browser: only the demo persists locally.
export const save=()=>{if(isLive())return;try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};

export function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2400)}

export const bd=s=>`<span class="pill ${/FAIL|VOID|REVERS|REJECT|UNDELIV|EXPIRED/.test(s)?'f':''}">${s}</span>`;

export const nmc=id=>(S.cs.find(c=>c.id==id)||{}).phone;

export const dt=s=>new Date(s).toLocaleString('en-KE',{timeZone:'Africa/Nairobi',dateStyle:'short',timeStyle:'short'});

export const fx=s=>(s||'').replace(/^0/,'+254');

export const esc=(s)=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
export const ap=(a,ev)=>`data-p-${ev}="${esc(JSON.stringify(a))}"`;

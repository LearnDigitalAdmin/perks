// core/utils
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{norm,toast});

window.K='sperks_v1';

window.$=s=>document.querySelector(s);

window.money=n=>'KES '+Number(n).toLocaleString('en-KE');

window.now=()=>new Date().toISOString();

function norm(p){p=String(p).replace(/[\s-]/g,'');if(/^\+254[17]\d{8}$/.test(p))return p;if(/^254[17]\d{8}$/.test(p))return'+'+p;if(/^0[17]\d{8}$/.test(p))return'+254'+p.slice(1);return null}

window.save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};

function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2400)}

window.bd=s=>`<span class="pill ${/FAIL|VOID|REVERS|REJECT/.test(s)?'f':''}">${s}</span>`;

window.nmc=id=>(S.cs.find(c=>c.id==id)||{}).phone;

window.dt=s=>new Date(s).toLocaleString('en-KE',{timeZone:'Africa/Nairobi',dateStyle:'short',timeStyle:'short'});

window.fx=s=>(s||'').replace(/^0/,'+254');

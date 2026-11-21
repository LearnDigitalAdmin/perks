// modules/points
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{itemType,calc,L});

function itemType(n){return CAT.PRODUCT.includes(n)?'PRODUCT':'SERVICE'}

function calc(S,items){return items.map(i=>{const t=itemType(i.name),r=t=='SERVICE'?S.cfg.sv:S.cfg.pr;return{...i,type:t,rate:r,pts:Math.floor(i.price*r/100)}})}

window.bal=(S,id)=>S.led.filter(l=>l.c==id).reduce((a,l)=>a+l.pts,0);

function L(S,c,type,pts,desc,at){S.led.push({id:'l'+S.led.length,c,type,pts,after:bal(S,c)+pts,desc,at:at||now()})}

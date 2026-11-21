// app/bootstrap
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

window.S=(()=>{try{const s=localStorage.getItem(K);if(s)return JSON.parse(s)}catch(e){}return seed()})();

render();

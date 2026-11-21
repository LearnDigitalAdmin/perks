// core/state
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

window.tab='sale';

window.D={phone:'',items:[{name:'Printing',price:''}],ne:'',ref:''};

window.done=null;

window.lock=false;

window.view={};

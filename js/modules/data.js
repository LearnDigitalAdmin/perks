// modules/data
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{seed,ensure});

function seed(){const d=n=>new Date(Date.now()-n*864e5).toISOString();
 const cs=[['+254712345678','AMANI7',1],['+254723456789','WANJI4',1],['+254734567890','KIPRO2',0],['+254745678901','NEEMA9',1]].map((c,i)=>({id:'c'+(i+1),phone:c[0],code:c[1],mkt:!!c[2],by:null,created:d(6-i)}));
 const S={cfg:{sv:7,pr:4,min:100,ref:50,inv:30,refMin:50,sms:0.2},cs,tx:[],led:[],sms:[],refs:[],act:'k5',user:null,n:1,
 camps:[{id:'k1',name:'Lipa Mdogo Mdogo',ad:'Need help paying rent in instalments? Discover Lipa Mdogo Mdogo.',on:true},{id:'k2',name:'Samuhia Desk',ad:'Looking for extra income? Discover Samuhia Desk.',on:true},{id:'k3',name:'MyChama',ad:'Run your chama with MyChama.',on:true},{id:'k4',name:'MyRegister',ad:'Simplify records with MyRegister.',on:true},{id:'k5',name:'Samuhia Perks',ad:'Enjoy more rewards every time you shop at Samuhia Cyber.',on:true}]};
 S.refs.push({id:'r1',from:'c1',to:'c2',amt:0,st:'PENDING'});
 const seedTx=[[0,'Printing',150,5],[1,'USB cables',300,5],[0,'Phone flashing',500,4],[2,'KRA services',400,3],[3,'Passport photos',250,2],[1,'eCitizen assistance',350,2],[0,'Chargers',600,1],[3,'Scanning',100,0],[2,'Photocopying',80,0]];
 seedTx.forEach(t=>post(S,S.cs[t[0]].phone,[{name:t[1],price:t[2]}],0,d(t[3]),true));return S}

function ensure(){if(!S.vo)S.vo=[['DISC50','DISCOUNT',50,'AVAILABLE'],['DISC100','DISCOUNT',100,'AWARDED','c1'],['AIR20','AIRTIME',20,'AVAILABLE'],['AIR50','AIRTIME',50,'REDEEMED','c2'],['PTS25','POINTS',25,'AVAILABLE'],['PTS50','POINTS',50,'AVAILABLE'],['DISC30','DISCOUNT',30,'VOID'],['AIR10','AIRTIME',10,'AVAILABLE'],['PTS100','POINTS',100,'AVAILABLE'],['DISC20','DISCOUNT',20,'AVAILABLE']].map((v,i)=>({id:'v'+i,code:v[0],type:v[1],val:v[2],st:v[3],c:v[4]||null,at:now()}));
if(!S.tpl)S.tpl={...TPL,voucher:'Samuhia Perks: You won voucher {code} worth {val}. Show it at Samuhia Cyber.',welcome:'Welcome to Samuhia Perks! Your referral code is {code}. Earn points on every visit.'};
if(!S.audit)S.audit=[];if(S.draw==null)S.draw=false;if(S.refs.length<2)S.refs.push({id:'r2',from:'c4',to:'c3',amt:0,st:'PENDING'});
if(!S.sms.some(m=>m.st=='FAILED')&&S.sms.length>3){S.sms[1].st='FAILED';S.sms[3].st='FAILED'}}

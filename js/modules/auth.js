// modules/auth
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

Object.assign(window,{loginUI,opLogin,custLogin,loginUI2});

function loginUI(){return`<div class="card"><h2>Operator login</h2><label>Username</label><input id="u" value="admin@samuhia.demo"><label>Password</label><input id="p" type="password" value="Samuhia@2026!"><button class="big" onclick="opLogin()">Sign in</button><p class="mu">Demo environment. These credentials are for the demo only.</p></div>
<div class="card"><h2>Customer demo (simulated OTP)</h2>${S.cs.slice(0,4).map(c=>`<button class="s" style="width:100%;margin-bottom:8px" onclick="custLogin('${c.id}')">${c.phone} — send demo OTP</button>`).join('')}<p class="mu">Real access will use Firebase Phone Authentication. Demo OTP: 123456, auto-filled.</p></div>`}

function opLogin(){if($('#u').value=='admin@samuhia.demo'&&$('#p').value=='Samuhia@2026!'){S.user={role:'op'};save();render()}else toast('Invalid credentials')}

function custLogin(id){const c=S.cs.find(x=>x.id==id);S.sms.push({id:'m'+S.sms.length,phone:c.phone,type:'otp',camp:null,msg:'Samuhia Perks code: 123456. Do not share it.',st:'SENT',cost:S.cfg.sms,at:now()});view.otp=id;save();render()}

function loginUI2(){if(!view.otp)return loginUI()+`<div class="card"><h3>Or enter your phone</h3><input id="cp" inputmode="tel" placeholder="07XX XXX XXX"><button class="s big" onclick="const c=S.cs.find(x=>x.phone==norm($('#cp').value));c?custLogin(c.id):toast('Number not registered')">Send OTP</button></div>`;const c=S.cs.find(x=>x.id==view.otp);return`<div class="card"><h2>Verify ${c.phone}</h2><div class="ok">DEMO ONLY: your code is 123456. No SMS is sent. Production uses Firebase Phone Authentication.</div><input id="ot" inputmode="numeric" value="123456"><button class="big" onclick="if($('#ot').value=='123456'){S.user={role:'cust',id:'${c.id}'};view.otp=null;save();render()}else toast('Wrong code')">Verify</button><button class="s big" style="margin-top:8px" onclick="view.otp=null;render()">Back</button></div>`}

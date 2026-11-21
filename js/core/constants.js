// core/constants
// Demo-era module: shared state and helpers live on window so inline handlers keep working.
// The live pipeline replaces data access in modules/data.js and the sms/points writes with Cloud Run calls.

window.RATE={SERVICE:7,PRODUCT:4};

window.CAT={SERVICE:['eCitizen assistance','KRA services','SHA services','NSSF services','Printing','Photocopying','Scanning','Passport photos','Phone flashing','Phone software repair','Virus/security troubleshooting','Google account assistance','Other service'],PRODUCT:['Chargers','Earphones','USB cables','Phone accessories','Bulbs','Other product']};

window.TPL={sale:'Samuhia Cyber: Sale KES {amount} received. You earned {pts} pts. Balance: {bal} pts (KES {val}).',redeem:'Samuhia Cyber: You redeemed {pts} pts for KES {val} off. Balance: {bal} pts.',ref:'Samuhia Perks: Referral reward! You received {pts} pts. Balance: {bal} pts.'};

window.DISC=[['Samuhia Perks','Earn points on every visit and invite friends for bonus rewards.','https://perks.samuhia.co.ke','#0e9f6e,#0b6e7a','★'],['Lipa Mdogo Mdogo','Pay rent in small, manageable instalments.','https://samuhia.co.ke','#7c3aed,#4338ca','🏠'],['Samuhia Desk','Discover an extra income opportunity.','https://samuhia.co.ke','#f59e0b,#ea580c','💼'],['MyChama','Run your chama with clarity and trust.','https://samuhia.co.ke','#0ea5e9,#2563eb','🤝'],['MyRegister','Keep your records simple and organised.','https://samuhia.co.ke','#ec4899,#be123c','📒']];

// modules/points
import { CAT } from '../core/constants.js';
import { now } from '../core/utils.js';

export function itemType(n){return CAT.PRODUCT.includes(n)?'PRODUCT':'SERVICE'}

export function calc(S,items){return items.map(i=>{const t=itemType(i.name),r=t=='SERVICE'?S.cfg.sv:S.cfg.pr;return{...i,type:t,rate:r,pts:Math.floor(i.price*r/100)}})}

export const bal=(S,id)=>{const c=S.cs.find(x=>x.id==id);return c&&typeof c.points==='number'?c.points:S.led.filter(l=>l.c==id).reduce((a,l)=>a+l.pts,0)};

export function L(S,c,type,pts,desc,at){S.led.push({id:'l'+S.led.length,c,type,pts,after:bal(S,c)+pts,desc,at:at||now()})}

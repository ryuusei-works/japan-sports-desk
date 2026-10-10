import {captureFifaHistory} from './enhancements.mjs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {comparisonSnapshot,captureDraftHistory} from '../scripts/build-pages.mjs';

export const cooldownMs=5*60*1000;
export function memoryCache(){const values=new Map();return {async get(key){const row=values.get(key);return row&&row.until>Date.now()?row.value:null;},async set(key,value,{ttl=86400}={}){values.set(key,{value,until:Date.now()+ttl*1000});}};}
export function pack(data){const text=JSON.stringify(data);if(Buffer.byteLength(text)>4000000)throw Error('Response exceeds safe size');const packed=gzipSync(text).toString('base64');if(packed.length>1900000)throw Error('Cache exceeds safe size');return packed;}
export function unpack(value){return value?JSON.parse(gunzipSync(Buffer.from(value,'base64'),{maxOutputLength:4000000}).toString()):null;}
function countSources(value){if(!value||typeof value!=='object')return 0;if(typeof value.ok==='boolean')return value.ok?1:0;return Object.values(value).reduce((n,row)=>n+countSources(row),0);}
async function hasBody(request){
 if(!request.body)return false;
 // Vercel represents even an empty POST as a stream. Inspect at most one
 // non-empty chunk; never buffer arbitrary uploaded data.
 const reader=request.body.getReader();let timer;
 try{return await Promise.race([(async()=>{for(let i=0;i<8;i++){const {done,value}=await reader.read();if(done)return false;if(value?.byteLength)return true;}return true;})(),new Promise(resolve=>{timer=setTimeout(()=>resolve(true),2000);})]);}
 finally{clearTimeout(timer);reader.cancel().catch(()=>{});}
}

// Runtime Cache has no atomic compare-and-set. This combines a shared cooldown
// with an instance-local promise; simultaneous cold instances can still race.
// Fail closed on cache errors so an outage cannot turn into unbounded fetching.
export function createLiveData({cache,collect,loadBaseline,now=Date.now}){
 let pending=null;
 const reply=(data,state)=>Response.json(data,{headers:{'Cache-Control':'no-store','X-Data-Update':state,'X-Content-Type-Options':'nosniff'}});
 const error=(status,message)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store','Retry-After':'300'}});
 async function latest(){const baseline=await loadBaseline();let cached;try{cached=unpack(await cache.get('snapshot-v1'));}catch{return baseline;}
  return cached&&Date.parse(cached.generatedAt)>Date.parse(baseline.generatedAt)?cached:baseline;
 }
 async function update(){
  const previous=await latest();
  const gate=await cache.get('cooldown-v1');
  if(gate&&now()-gate.started<cooldownMs)return reply(previous,gate.running?'busy':'cached');
  await cache.set('cooldown-v1',{started:now(),running:true},{ttl:300});
  try{
   const data=await collect();
   if(countSources({...data,previous:null,draftHistory:null})===0)throw Error('All sources failed');
   data.previous=comparisonSnapshot(previous,data);
   data.draftHistory=captureDraftHistory(previous,data);
   data.fifaHistory=captureFifaHistory(previous,data);
   await cache.set('snapshot-v1',pack(data),{ttl:86400});
   await cache.set('cooldown-v1',{started:now(),running:false},{ttl:300});
   return reply(data,'updated');
  }catch{return error(503,'最新情報を取得できませんでした。前回の表示を保持しています。5分後に再試行してください。');}
 }
 return async request=>{
  if(request.method==='GET'){try{return reply(await latest(),'read');}catch{return error(503,'公開データを読み込めませんでした。');}}
  if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'GET, POST'}});
  // A custom header prevents cross-site forms and simple cross-origin requests.
  // Do not accept source URLs, credentials or user data from the client.
  if(request.headers.get('x-daily-desk-refresh')!=='1'||request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return error(403,'このサイトの更新ボタンから実行してください。');
  if(new URL(request.url).search||request.headers.get('content-length')&&request.headers.get('content-length')!=='0'||await hasBody(request))return error(400,'更新リクエストにデータを含めることはできません。');
  if(!pending)pending=update().catch(()=>error(503,'更新サービスを利用できません。表示中のデータをご利用ください。')).finally(()=>{pending=null;});
  return (await pending).clone();
 };
}

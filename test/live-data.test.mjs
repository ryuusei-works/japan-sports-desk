import test from 'node:test';
import assert from 'node:assert/strict';
import {createLiveData,memoryCache,cooldownMs} from '../lib/live-data.mjs';

const before={year:2026,generatedAt:'2026-10-10T00:00:00Z',standings:{ok:true,data:[]},leaders:{},draftHistory:{version:1,seasons:{}}};
const after=()=>({...structuredClone(before),generatedAt:'2026-10-10T01:00:00Z'});
const request=(method='POST',headers={},url='https://desk.example/api/data')=>new Request(url,{method,headers:{Origin:'https://desk.example','X-Daily-Desk-Refresh':'1',...headers}});
test('reading never collects; simultaneous manual updates share work and a cooldown across instances',async()=>{
 let calls=0,release,clock=1000000;const cache=memoryCache(),options={cache,loadBaseline:async()=>before,now:()=>clock,collect:async()=>{calls++;await new Promise(resolve=>release=resolve);return after();}};
 const handle=createLiveData(options);assert.equal((await handle(request('GET'))).status,200);assert.equal(calls,0);
 const a=handle(request()),b=handle(request());while(!release)await new Promise(resolve=>setImmediate(resolve));release();
 const results=await Promise.all([a,b]);assert.equal(calls,1);for(const result of results){assert.equal(result.headers.get('x-data-update'),'updated');assert.equal((await result.json()).previous.generatedAt,before.generatedAt);}
 const other=createLiveData(options);const cached=await other(request());assert.equal(cached.headers.get('x-data-update'),'cached');assert.equal(calls,1);assert.equal((await cached.json()).generatedAt,after().generatedAt);
 clock+=cooldownMs;options.collect=async()=>{calls++;return after();};await createLiveData(options)(request());assert.equal(calls,2);
});
test('cross-origin, unsupported methods, bodies and arbitrary URLs never start collection',async()=>{
 let calls=0;const handle=createLiveData({cache:memoryCache(),loadBaseline:async()=>before,collect:async()=>{calls++;return after();}});
 assert.equal((await handle(request('POST',{Origin:'https://evil.example'}))).status,403);
 assert.equal((await handle(request('POST',{'X-Daily-Desk-Refresh':''}))).status,403);
 assert.equal((await handle(request('DELETE'))).status,405);
 assert.equal((await handle(request('POST',{},'https://desk.example/api/data?url=https://evil.example'))).status,400);
 assert.equal((await handle(new Request('https://desk.example/api/data',{method:'POST',headers:{Origin:'https://desk.example','X-Daily-Desk-Refresh':'1'},body:'user data'}))).status,400);
 assert.equal(calls,0);
});
test('all-source failure preserves the snapshot and cache outage blocks new collection',async()=>{
 const cache=memoryCache();let fail=false,calls=0,clock=1000000;
 const handle=createLiveData({cache,loadBaseline:async()=>before,now:()=>clock,collect:async()=>{calls++;return fail?{year:2026,generatedAt:'2026-10-10T02:00:00Z',standings:{ok:false},leaders:{}}:after();}});
 await handle(request());clock+=cooldownMs;fail=true;assert.equal((await handle(request())).status,503);assert.equal((await (await handle(request('GET'))).json()).generatedAt,after().generatedAt);await handle(request());assert.equal(calls,2);
 const broken=createLiveData({cache:{get:async()=>{throw Error('offline');}},loadBaseline:async()=>before,collect:async()=>{calls++;return after();}});
 assert.equal((await broken(request())).status,503);assert.equal(calls,2);assert.equal((await (await broken(request('GET'))).json()).generatedAt,before.generatedAt);
});
test('oversized snapshots are rejected while partial failures remain explicit',async()=>{
 const cache=memoryCache();let huge=false,clock=1000000;
 const handle=createLiveData({cache,loadBaseline:async()=>before,now:()=>clock,collect:async()=>({...after(),footballGames:{ok:false,error:'source unavailable'},...(huge?{text:'x'.repeat(4000000)}:{})})});
 const partial=await (await handle(request())).json();assert.equal(partial.footballGames.ok,false);huge=true;clock+=cooldownMs;assert.equal((await handle(request())).status,503);assert.equal((await (await handle(request('GET'))).json()).generatedAt,after().generatedAt);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPages } from '../scripts/build-pages.mjs';

test('static export works from a GitHub project subdirectory',async()=>{
  const output=await mkdtemp(join(tmpdir(),'sports-pages-'));
  try{
    const ok={ok:true}, data={standings:ok,baseballGames:ok,footballGames:ok,fifa:ok,leaders:{},generatedAt:'2026-10-10T00:00:00Z'};
    await buildPages({output,collect:async()=>data});
    const html=await readFile(join(output,'index.html'),'utf8');
    const script=await readFile(join(output,'app.js'),'utf8');
    assert.match(html,/href="\.\/style.css"/);assert.match(html,/src="\.\/app.js"/);
    assert.doesNotMatch(html,/(?:src|href)="\/(?!\/)/);
    assert.match(script,/fetch\('\.\/data\/sports\.json\?t='\+Date\.now\(\)/);
    assert.deepEqual(JSON.parse(await readFile(join(output,'data/sports.json'),'utf8')),data);
    assert.equal(await readFile(join(output,'.nojekyll'),'utf8'),'');
    const failed={ok:false};
    await assert.rejects(buildPages({output,collect:async()=>({...data,standings:failed,baseballGames:failed,footballGames:failed,fifa:failed})}),/All public sources/);
    assert.deepEqual(JSON.parse(await readFile(join(output,'data/sports.json'),'utf8')),data,'Complete source failure must preserve the previous snapshot');
  }finally{await rm(output,{recursive:true,force:true});}
});

test('comparison snapshot keeps only one prior generation and never crosses seasons',async()=>{
 const {comparisonSnapshot}=await import('../scripts/build-pages.mjs');
 const prior={year:2026,generatedAt:'2026-10-09T21:00:00Z',standings:{ok:true},leaders:{hr:{c:{ok:true}}},previous:{generatedAt:'older'},footballGames:{ok:true}};
 const current={year:2026,generatedAt:'2026-10-09T22:00:00Z'};
 const snapshot=comparisonSnapshot(prior,current);assert.equal(snapshot.generatedAt,prior.generatedAt);assert.equal(snapshot.previous,undefined);assert.equal(snapshot.footballGames,undefined);assert.equal(comparisonSnapshot(prior,{...current,year:2027}),null);assert.equal(comparisonSnapshot(prior,{...current,generatedAt:prior.generatedAt}),null);assert.equal(comparisonSnapshot({...prior,generatedAt:'bad'},current),null);
});

test('static builds preserve the preceding published snapshot without growing history',async()=>{
 const output=await mkdtemp(join(tmpdir(),'sports-history-'));const ok={ok:true};const make=hour=>({year:2026,standings:ok,baseballGames:ok,footballGames:ok,fifa:ok,leaders:{},generatedAt:`2026-10-10T0${hour}:00:00Z`});
 try{
  await buildPages({output,collect:async()=>make(1)});assert.equal(JSON.parse(await readFile(join(output,'data/sports.json'),'utf8')).previous,null);
  await buildPages({output,collect:async()=>make(2)});const second=JSON.parse(await readFile(join(output,'data/sports.json'),'utf8'));assert.equal(second.previous.generatedAt,make(1).generatedAt);
  await buildPages({output,collect:async()=>make(3)});const third=JSON.parse(await readFile(join(output,'data/sports.json'),'utf8'));assert.equal(third.previous.generatedAt,make(2).generatedAt);assert.equal(third.previous.previous,undefined);
 }finally{await rm(output,{recursive:true,force:true});}
});

function historyFixture(when,year,hr='1'){
 const teams=['神','巨','デ','広','ヤ','中','ソ','西','日','オ','ロ','楽'];const ok=data=>({ok:true,data});const clubs=Object.fromEntries(teams.map(team=>[team,{bat:ok([{team,name:'選手 '+team,values:{avg:'.300',hr,h:'100',rbi:'40'}}]),pit:ok([{team,name:'投手 '+team,values:{era:'2.00',w:'10',sv:'0'}}])}]));return {year,generatedAt:when,draft:{clubs,seasonComplete:false},leaders:{avg:{c:ok(teams.slice(0,6).map(team=>({team,name:'選手 '+team}))),p:ok(teams.slice(6).map(team=>({team,name:'選手 '+team})))},era:{c:ok([]),p:ok([])}}};
}
test('monthly archive keeps one latest complete snapshot per Tokyo month and preserves old seasons',async()=>{
 const {captureDraftHistory}=await import('../scripts/build-pages.mjs');let draftHistory=captureDraftHistory(null,historyFixture('2026-09-30T14:59:00Z',2026));assert.ok(draftHistory.seasons['2026'].months['2026-09']);draftHistory=captureDraftHistory({draftHistory},historyFixture('2026-09-30T15:01:00Z',2026,'2'));assert.equal(Object.keys(draftHistory.seasons['2026'].months).length,2);assert.equal(draftHistory.seasons['2026'].latestMonth,'2026-10');draftHistory=captureDraftHistory({draftHistory},historyFixture('2026-10-10T00:00:00Z',2026,'3'));assert.equal(draftHistory.seasons['2026'].months['2026-10'].rows[0][3],'3');assert.equal(draftHistory.seasons['2026'].months['2026-10'].rows[0][9],true);assert.equal(draftHistory.seasons['2026'].months['2026-10'].rows.find(row=>row[1]==='投手 神')[8],'0');const before=JSON.stringify(draftHistory);const failed=historyFixture('2026-10-11T00:00:00Z',2026);failed.draft.clubs['神'].bat.ok=false;assert.equal(JSON.stringify(captureDraftHistory({draftHistory},failed)),before);assert.equal(JSON.stringify(captureDraftHistory({draftHistory},historyFixture('2026-10-01T00:00:00Z',2026))),before);draftHistory=captureDraftHistory({draftHistory},historyFixture('2027-01-01T00:00:00Z',2027));assert.ok(draftHistory.seasons['2026'].months['2026-09']);assert.ok(draftHistory.seasons['2027'].months['2027-01']);assert.equal(draftHistory.seasons['2027'].months['2027-01'].previous,undefined);
});

test('published history download failure stops a build rather than silently dropping archived seasons',async t=>{
 const {readPublishedPrevious}=await import('../scripts/build-pages.mjs');const mock=t.mock.method(globalThis,'fetch',async()=>({ok:false,status:404}));await assert.rejects(readPublishedPrevious(),/keeping previous deployment/);mock.mock.mockImplementation(async()=>{throw Error('network');});await assert.rejects(readPublishedPrevious(),/keeping previous deployment/);
});

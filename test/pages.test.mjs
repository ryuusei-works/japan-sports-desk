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
    assert.match(script,/fetch\('\.\/data\/sports.json'/);
    assert.deepEqual(JSON.parse(await readFile(join(output,'data/sports.json'),'utf8')),data);
    assert.equal(await readFile(join(output,'.nojekyll'),'utf8'),'');
    const failed={ok:false};
    await assert.rejects(buildPages({output,collect:async()=>({...data,standings:failed,baseballGames:failed,footballGames:failed,fifa:failed})}),/All official sources/);
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

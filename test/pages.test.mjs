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

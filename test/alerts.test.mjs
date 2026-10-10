import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAlerts,collectAlerts} from '../lib/alerts.mjs';
const areas={offices:{'011000':{},'016000':{},'130000':{},'460040':{},'460100':{},'471000':{},'474000':{}},class10s:{'130010':{name:'東京地方'}}};
const report=(code='03',status='発表',dataTypeCode='VPWW55',reportDatetime='2026-10-10T17:00:00+09:00')=>({dataTypeCode,reportDatetime,warning:{class10Items:[{areaCode:'130010',kinds:[{code,status}]}]}});
test('r8 warnings retain simultaneous report types, use latest per type and ignore released warnings',()=>{
 const d=parseAlerts([report('03'),report('43','継続','VPWW55','2026-10-10T18:00:00+09:00'),report('14','継続','VPWW59'),report('15','解除','VPWW58')],areas);
 assert.deepEqual(d.items.map(i=>i.name),['レベル4大雨危険警報','雷注意報']);assert.equal(d.items[0].area,'東京地方');assert.equal(parseAlerts([report('03','解除')],areas).items.length,0);assert.equal(parseAlerts([report('99')],areas).items[0].name,'気象情報（コード99）');assert.throws(()=>parseAlerts({},areas));assert.throws(()=>parseAlerts([{...report(),warning:{}}],areas));
});
test('all prefectural offices are covered including Hokkaido and islands, failures remain explicit',async()=>{
 const calls=[],get=async url=>{calls.push(url);if(url.endsWith('/area.json'))return JSON.stringify(areas);if(url.includes('460040'))throw Error('offline');return JSON.stringify([report('03','解除')]);};const d=await collectAlerts(get,[{id:'01'},{id:'13'},{id:'46'},{id:'47'}]);assert.equal(d['01'].ok,true);assert.equal(d['46'].ok,false);assert.equal(d['47'].ok,true);for(const code of ['011000','016000','460040','460100','471000','474000'])assert.ok(calls.some(url=>url.endsWith(code+'.json')));const failure=await collectAlerts(async()=>{throw Error('offline');},[{id:'13'}]);assert.equal(failure['13'].ok,false);
});

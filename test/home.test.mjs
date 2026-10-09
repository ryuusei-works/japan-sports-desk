import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';

const categories=[{id:'avg',label:'打率',unit:''},{id:'hr',label:'本塁打',unit:'本'},{id:'rbi',label:'打点',unit:'点'},{id:'w',label:'勝利',unit:'勝'},{id:'era',label:'防御率',unit:'',low:true},{id:'so',label:'奪三振',unit:'個'}];
const ok=data=>({ok:true,data,source:'https://npb.jp/',fetchedAt:'2026-12-31T16:00:00Z'});
const fixture=()=>({year:2027,today:'2027-01-01',generatedAt:'2026-12-31T16:00:00Z',categories,
 standings:ok({c:[{team:'阪神タイガース',wins:'80',losses:'60',draws:'3',pct:'.571',gap:'-'},{team:'読売ジャイアンツ',wins:'77',losses:'62',draws:'4',pct:'.554',gap:'2.5'}],p:[]}),
 baseballGames:ok([{date:'2026-12-28',home:'阪神',away:'巨人',status:'finished',time:'14:00',venue:'甲子園'},{date:'2027-01-01',home:'巨人',away:'DeNA',status:'scheduled',time:'14:00',venue:'東京ドーム'},{date:'2027-01-02',home:'阪神',away:'広島',status:'cancelled',time:'14:00',venue:'甲子園'},{date:'2027-01-04',home:'巨人',away:'阪神',status:'scheduled',time:'18:00',venue:'東京ドーム'}]),
 footballGames:ok([{date:'2027-01-03',opponent:'対戦国',status:'scheduled',url:'https://www.jfa.jp/',venue:'国立'}]),fifa:{ok:false},baseballNews:ok([]),footballNews:ok([]),
 leaders:Object.fromEntries(categories.map(c=>[c.id,{c:ok(c.id==='era'?[{name:'投手A',team:'神',league:'c',value:'1.80'},{name:'投手B',team:'巨',league:'c',value:'2.13'}]:[{name:'選手A',team:'神',league:'c',value:c.id==='avg'?'.320':'39'},{name:'選手B',team:'巨',league:'c',value:c.id==='avg'?'.297':'20'}]),p:ok([{name:'選手C',team:'西',league:'p',value:c.id==='era'?'1.60':c.id==='avg'?'.330':'45'}])}]))});
async function setup(){
 const data=fixture(),{window,document}=parseHTML(await readFile('public/index.html','utf8'));
 window.location={hash:''};window.history={pushState(_state,_title,url){window.location.hash=url;}};window.localStorage={getItem(){return null;},setItem(){}};
 Object.defineProperty(window.HTMLSelectElement.prototype,'options',{configurable:true,get(){return this.querySelectorAll('option');}});
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this._value??this.querySelector('option')?.getAttribute('value')??'';},set(v){this._value=v;}});
 class Clock extends Date{constructor(...args){super(...(args.length?args:['2026-12-31T16:00:00Z']));}static now(){return new Date('2026-12-31T16:00:00Z').getTime();}}
 const context=vm.createContext({window,document,Intl,Date:Clock,Number,String,Set,Math,AbortSignal,setInterval(){},fetch:async()=>({ok:true,json:async()=>data})});
 vm.runInContext(await readFile('public/app.js','utf8'),context);await new Promise(r=>setTimeout(r,0));
 return {data,context,document,$:id=>document.getElementById(id),change:(id,value)=>{const el=document.getElementById(id);el.value=value;el.dispatchEvent(new window.Event('change'));}};
}
test('home uses Tokyo today and Monday to Sunday across the year boundary',async()=>{
 const {$}=await setup();assert.equal($('today-count').textContent,'1試合');assert.match($('today-games').textContent,/巨人 × DeNA/);assert.equal($('week-count').textContent,'4試合');assert.match($('week-games').textContent,/終了/);assert.match($('week-games').textContent,/中止・延期/);assert.match($('week-games').textContent,/対戦国/);assert.match($('week-range').textContent,/12月28日/);assert.match($('week-range').textContent,/1月3日/);assert.doesNotMatch($('week-games').textContent,/巨人 × 阪神/);
});
test('calendar filters include the selected day and favorite changes update the summary',async()=>{
 const {document,$,change}=await setup();const filter=value=>document.querySelector(`[data-calendar-filter="${value}"]`).click();
 filter('football');assert.equal($('calendar').querySelectorAll('.calendar-event.baseball').length,0);assert.equal($('calendar').querySelectorAll('.calendar-event.football').length,1);assert.doesNotMatch($('day-games').textContent,/巨人/);
 filter('favorite');assert.equal($('calendar').querySelectorAll('.calendar-event').length,0);assert.match($('calendar-filter-note').textContent,/応援球団を選ぶ/);
 change('favorite-team','巨');assert.match($('favorite-heading').textContent,/読売/);assert.match($('favorite-summary').textContent,/セ・リーグ 2位/);assert.match($('favorite-summary').textContent,/首位と 2.5 ゲーム差/);assert.match($('favorite-summary').textContent,/巨人 × DeNA/);assert.match($('favorite-summary').textContent,/選手B/);assert.equal($('calendar').querySelectorAll('.calendar-event.football').length,0);assert.equal($('calendar').querySelectorAll('.calendar-event').length,2);assert.match($('day-games').textContent,/巨人/);
 change('favorite-team','神');assert.match($('favorite-summary').textContent,/セ・リーグ 1位/);assert.match($('favorite-summary').textContent,/首位/);assert.doesNotMatch($('day-games').textContent,/巨人/);filter('baseball');assert.equal($('calendar').querySelectorAll('.calendar-event').length,3);filter('all');assert.equal($('calendar').querySelectorAll('.calendar-event').length,4);
});
test('title gaps compare team players with league leaders and preserve decimal precision',async()=>{
 const {document,$,change}=await setup();assert.match($('leaders').textContent,/0.023/);change('leader-team','巨');assert.match($('leaders').textContent,/リーグ首位との差/);assert.match($('leaders').textContent,/0.023/);
 document.querySelector('[data-category="hr"]').click();assert.match($('leaders').textContent,/19 本/);document.querySelector('[data-category="era"]').click();assert.match($('leaders').textContent,/0.33/);
 document.querySelector('#leader-tabs [data-league="all"]').click();assert.match($('leaders').textContent,/0.20/);assert.match($('leaders').textContent,/首位（差なし）/);
});
test('failed sources and absent qualified players do not become fabricated summaries',async()=>{
 const {data,context,$,change}=await setup();change('favorite-team','巨');data.standings.ok=false;data.baseballGames.ok=false;data.leaders.avg.c.data=[];data.leaders.hr.c.ok=false;await vm.runInContext('refresh()',context);
 assert.match($('favorite-summary').textContent,/順位を取得できません/);assert.match($('favorite-summary').textContent,/試合日程を取得できません/);assert.match($('favorite-summary').textContent,/規定条件に該当する選手なし/);assert.match($('favorite-summary').textContent,/取得できませんでした/);assert.match($('home-schedule-note').textContent,/取得成功分のみ/);assert.equal($('today-count').textContent,'0試合');assert.equal($('week-count').textContent,'1試合');
});

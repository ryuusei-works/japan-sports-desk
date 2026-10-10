import test from 'node:test';
import assert from 'node:assert/strict';
import {regions,parseWeather,parseHeadlines,parseRegionalNews,parseNationalTeams,parseTeamSchedule,collectDaily,collectRivals} from '../lib/daily.mjs';

const weather=()=>[{reportDatetime:'2026-10-10T17:00:00+09:00',timeSeries:[{timeDefines:['2026-10-10T17:00:00+09:00','2026-10-11T00:00:00+09:00'],areas:[{area:{name:'東京地方',code:'130010'},weathers:['晴れ','雨'],weatherCodes:['100','300']}]},{timeDefines:['2026-10-10T18:00:00+09:00','2026-10-11T00:00:00+09:00','2026-10-11T06:00:00+09:00'],areas:[{area:{code:'130010'},pops:['0','20','60']}]},{timeDefines:['2026-10-11T00:00:00+09:00','2026-10-11T09:00:00+09:00'],areas:[{area:{name:'東京'},temps:['0','27']}]}]}];
const article=(id,title,date)=>`<a href="https://news.web.nhk/newsweb/na/${id}"><p>${title}</p><time datetime="${date}"></time></a>`;
const regionHtml=()=>`<main><div><div><h2>トップニュース</h2></div>${article('top','地域トップ','2026-10-10T12:00:00+09:00')}</div><div><div><h2>首都圏の最新ニュース</h2></div>${article('older','地域の過去ニュース','2026-10-09T12:00:00+09:00')}${article('recent','地域の最新ニュース','2026-10-10T13:00:00+09:00')}</div><div><div><h2>全国のトップニュース</h2></div>${article('national','混ぜてはいけない全国ニュース','2026-10-10T14:00:00+09:00')}</div></main>`;
const rss=()=>`<rss><channel>${[1,2,3,4].map(i=>`<item><title>見出し${i} &amp; ニュース</title><link>https://news.web.nhk/newsweb/na/${i}</link><pubDate>Sat, 10 Oct 2026 ${10+i}:00:00 +0900</pubDate></item>`).join('')}<item><title>危険なURL</title><link>javascript:alert(1)</link><pubDate>Sat, 10 Oct 2026 16:00:00 +0900</pubDate></item></channel></rss>`;
const directory=()=>({sports:[{leagues:[{teams:Array.from({length:20},(_,i)=>({team:{id:String(i+1),abbreviation:i===0?'ESP':i===1?'BRA':'AAA',displayName:'Country'}}))}]}]});
const event=(state='post',extra={})=>({id:'match',date:'2026-10-09T23:00:00Z',season:{displayName:'International Friendly'},links:[{href:'https://www.espn.com/soccer/match/_/gameId/1'},{href:'javascript:alert(1)'}],competitions:[{timeValid:true,status:{type:{state,completed:state==='post',name:'STATUS_FULL_TIME',shortDetail:'FT'}},competitors:[{homeAway:'home',team:{abbreviation:'ESP',displayName:'Spain'},score:{value:0}},{homeAway:'away',team:{abbreviation:'BRA',displayName:'Brazil'},score:{value:2}}]}],...extra});
const schedule=(events=[event()])=>({team:{abbreviation:'ESP',isNational:true},events});

test('weather uses JST dates, correct minimum/maximum slots and preserves zero/missing values',()=>{
 const d=parseWeather(weather());assert.equal(d.days[0].rain,0);assert.equal(d.days[0].low,null);assert.equal(d.days[0].high,null);assert.equal(d.days[1].date,'2026-10-11');assert.equal(d.days[1].rain,60);assert.equal(d.days[1].low,0);assert.equal(d.days[1].high,27);assert.throws(()=>parseWeather([]));assert.equal(regions.length,47);assert.equal(regions.find(r=>r.id==='01').weatherCode,'016000');assert.equal(regions.find(r=>r.id==='47').newsCode,'470');
});
test('national headlines use RSS titles only, newest three, decoded text and safe links',()=>{
 const rows=parseHeadlines(rss());assert.equal(rows.length,3);assert.equal(rows[0].title,'見出し4 & ニュース');assert.equal(rows[0].date,'2026-10-10');assert.throws(()=>parseHeadlines('<rss/>'));
});
test('regional headlines combine local top/latest blocks and exclude the national block',()=>{
 const news=parseRegionalNews(regionHtml());assert.equal(news.coverage,'首都圏');assert.deepEqual(news.items.map(n=>n.title),['地域の最新ニュース','地域トップ','地域の過去ニュース']);assert.throws(()=>parseRegionalNews('<h2>全国のトップニュース</h2>'));
});
test('national team schedules validate identity, keep JST/zero/PK results and never use pregame zero as a result',()=>{
 assert.equal(parseNationalTeams(directory())[0].code,'ESP');assert.throws(()=>parseNationalTeams({}));const games=parseTeamSchedule(schedule([event(),event('pre')]),'ESP');assert.equal(games[0].date,'2026-10-10');assert.equal(games[0].homeScore,0);assert.equal(games[0].status,'finished');assert.equal(games[1].homeScore,null);assert.equal(games[1].status,'scheduled');assert.throws(()=>parseTeamSchedule(schedule(),'BRA'));
 const pk=event();pk.competitions[0].status.type.name='STATUS_FINAL_PEN';pk.competitions[0].competitors[0].score.shootoutScore=5;pk.competitions[0].competitors[1].score.shootoutScore=4;const result=parseTeamSchedule(schedule([pk]),'ESP')[0];assert.equal(result.homeScore,0);assert.equal(result.homePenalty,5);assert.equal(result.awayPenalty,4);
 const unknown=event('pre');unknown.timeValid=false;unknown.links=[{href:'https://example.org/'}];assert.equal(parseTeamSchedule(schedule([unknown]),'ESP')[0].timeKnown,false);assert.equal(parseTeamSchedule(schedule([unknown]),'ESP')[0].url,'https://www.espn.com/soccer/scoreboard');
});
test('daily collection isolates a missing region/source and still retains all 47 choices',async()=>{
 const get=async url=>{if(url.includes('/forecast/130000'))throw Error('offline');if(url.endsWith('cat0.xml'))return rss();return url.includes('forecast/data')?JSON.stringify(weather()):regionHtml();};const result=await collectDaily(get);assert.equal(result.locations['13'].weather.ok,false);assert.equal(result.locations['13'].news.ok,true);assert.equal(result.locations['27'].weather.ok,true);assert.equal(result.nationalNews.data.length,3);assert.equal(Object.keys(result.locations).length,47);
});
test('rivals are selected by current rank and per-country failures do not hide the remaining countries',async()=>{
 const calls=[],get=async url=>{calls.push(url);if(url.endsWith('/teams'))return JSON.stringify(directory());if(url.includes('/teams/2/'))throw Error('unavailable');return JSON.stringify(schedule([event()]));};const fifa={ok:true,data:{rows:[{rank:1,code:'ESP'},{rank:2,code:'BRA'},{rank:3,code:'JPN'},{rank:4,code:'ARG'}]}};const result=await collectRivals(get,fifa);assert.equal(result.ok,true);assert.equal(result.data.countries.length,2);assert.equal(result.data.countries[0].games.data.length,1,'past/future duplicates removed');assert.equal(result.data.countries[1].games.ok,false);assert.ok(calls.some(c=>c.endsWith('?fixture=true')));assert.equal(calls.length,5);assert.equal((await collectRivals(get,{ok:false})).ok,false);
});

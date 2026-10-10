import {load} from 'cheerio';

const prefectures='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split(' ');
export const regions=prefectures.map((name,i)=>{const id=String(i+1).padStart(2,'0');return {id,name,weatherCode:({'01':'016000','46':'460100','47':'471000'})[id]||id+'0000',newsCode:id+'0'};});
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const day=value=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date(value));
const numeric=value=>value!==''&&value!==null&&value!==undefined&&Number.isFinite(Number(value))?Number(value):null;
const safeLink=(value,host)=>{try{const u=new URL(value);return u.protocol==='https:'&&u.hostname===host?u.href:null;}catch{return null;}};
async function safely(work,source){try{return {ok:true,data:await work(),source,fetchedAt:new Date().toISOString()};}catch{return {ok:false,source,error:'データを取得できませんでした。出典をご確認ください。'};}}
async function mapLimit(items,work){const result=[];for(let i=0;i<items.length;i+=4)result.push(...await Promise.all(items.slice(i,i+4).map(work)));return result;}

export function parseWeather(payload){
 const report=payload?.[0],series=report?.timeSeries,forecast=series?.find(s=>s.areas?.some(a=>Array.isArray(a.weathers)));
 if(!report?.reportDatetime||!forecast?.timeDefines?.length||!forecast.areas[0]?.weathers?.length)throw Error('Weather structure changed');
 const area=forecast.areas[0],rain=series.find(s=>s.areas?.some(a=>Array.isArray(a.pops))),rainArea=rain?.areas.find(a=>a.area.code===area.area.code);
 const temperature=series.find(s=>s.areas?.some(a=>Array.isArray(a.temps))),station=temperature?.areas[0];
 return {area:area.area.name,station:station?.area?.name||'',issuedAt:report.reportDatetime,days:forecast.timeDefines.map((time,i)=>{
  const date=day(time),pops=(rain?.timeDefines||[]).flatMap((t,j)=>day(t)===date&&numeric(rainArea?.pops?.[j])!==null?[Number(rainArea.pops[j])]:[]);
  // JMA short-range temperature slots at 00:00 are minima; 09:00 slots are maxima.
  const temps=(temperature?.timeDefines||[]).flatMap((t,j)=>{const value=numeric(station?.temps?.[j]);return day(t)===date&&value!==null?[{hour:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',hourCycle:'h23'}).format(new Date(t)),value}]:[];});
  return {date,weather:clean(area.weathers[i]),code:area.weatherCodes?.[i]||'',rain:pops.length?Math.max(...pops):null,low:temps.find(t=>t.hour==='00')?.value??null,high:temps.find(t=>t.hour==='09')?.value??null};
 }).filter(d=>d.weather)};
}
export function parseHeadlines(xml){
 const $=load(xml,{xml:true}),rows=$('item').map((_,e)=>{const title=clean($(e).find('title').text()),url=safeLink($(e).find('link').text().trim(),'news.web.nhk'),publishedAt=new Date($(e).find('pubDate').text());return title&&url&&Number.isFinite(publishedAt.getTime())?{title,url,publishedAt:publishedAt.toISOString(),date:day(publishedAt)}:null;}).get();
 if(!rows.length)throw Error('News feed changed');return [...new Map(rows.map(r=>[r.url,r])).values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,3);
}
export function parseRegionalNews(html){
 const $=load(html),heading=$('h1,h2,h3').filter((_,e)=>/最新ニュース$/.test(clean($(e).text()))&&!/全国/.test($(e).text())).first();
 if(!heading.length)throw Error('Regional news section missing');let scope=heading.parent();
 while(scope.length&&!scope.find('a[href*="/newsweb/na/"]').length)scope=scope.parent();
 if(!scope.length||scope.is('body,html'))throw Error('Regional news structure changed');
 const top=$('h1,h2,h3').filter((_,e)=>clean($(e).text())==='トップニュース').first();if(top.length){let topScope=top.parent();while(topScope.length&&!topScope.find('a[href*="/newsweb/na/"]').length)topScope=topScope.parent();if(topScope.length&&!topScope.is('body,html'))scope=scope.add(topScope);}
 const rows=scope.find('a[href*="/newsweb/na/"]').map((_,e)=>{const a=$(e),url=safeLink(new URL(a.attr('href'),'https://news.web.nhk').href,'news.web.nhk'),title=clean(a.find('p').first().text()),publishedAt=new Date(a.find('time').attr('datetime'));return url&&title&&Number.isFinite(publishedAt.getTime())?{title,url,publishedAt:publishedAt.toISOString(),date:day(publishedAt)}:null;}).get();
 if(!rows.length)throw Error('Regional headlines missing');return {coverage:clean(heading.text()).replace(/の最新ニュース$/,''),items:[...new Map(rows.map(r=>[r.url,r])).values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,3)};
}

export function parseNationalTeams(payload){
 const teams=payload?.sports?.[0]?.leagues?.[0]?.teams;if(!Array.isArray(teams)||teams.length<20)throw Error('National team directory missing');
 return teams.map(({team})=>({id:team.id,code:team.abbreviation,name:team.displayName})).filter(t=>/^\d+$/.test(t.id)&&/^[A-Z]{3}$/.test(t.code));
}
export function parseTeamSchedule(payload,code){
 if(payload?.team?.abbreviation!==code||payload.team.isNational!==true||!Array.isArray(payload.events))throw Error('National team schedule mismatch');
 return payload.events.map(event=>{
  const c=event.competitions?.[0],status=c?.status?.type,home=c?.competitors?.find(p=>p.homeAway==='home'),away=c?.competitors?.find(p=>p.homeAway==='away');
  if(!home||!away||![home.team?.abbreviation,away.team?.abbreviation].includes(code)||!Number.isFinite(Date.parse(event.date))||!['pre','post','in'].includes(status?.state))return null;
  const score=person=>numeric(typeof person.score==='object'?person.score?.value:person.score),finished=status.state==='post'&&status.completed===true;
  const url=(event.links||[]).map(link=>safeLink(link.href,'www.espn.com')).find(Boolean)||'https://www.espn.com/soccer/scoreboard';
  return {id:event.id,date:day(event.date),kickoff:event.date,timeKnown:c.timeValid!==false&&event.timeValid!==false,home:{code:home.team.abbreviation,name:home.team.displayName},away:{code:away.team.abbreviation,name:away.team.displayName},homeScore:finished||status.state==='in'?score(home):null,awayScore:finished||status.state==='in'?score(away):null,homePenalty:/PEN/.test(status.name||'')?numeric(home.score?.shootoutScore??home.shootoutScore):null,awayPenalty:/PEN/.test(status.name||'')?numeric(away.score?.shootoutScore??away.shootoutScore):null,status:/POSTPONED|CANCELED|CANCELLED|ABANDONED/.test(status.name||'')?'cancelled':finished?'finished':status.state==='in'?'inprogress':'scheduled',competition:clean(event.season?.displayName||event.leagues?.[0]?.name||''),detail:clean(status.shortDetail||''),url};
 }).filter(Boolean);
}
export async function collectRivals(getText,fifa){
 const source='https://www.espn.com/soccer/scoreboard';if(!fifa.ok)return {ok:false,source,error:'FIFAランキングを取得できないため上位国を特定できません。'};
 return safely(async()=>{
  const teams=parseNationalTeams(JSON.parse(await getText('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.friendly/teams'))),jp=fifa.data.rows.find(r=>r.code==='JPN');if(!jp)throw Error('Japan missing');
  const countries=await mapLimit(fifa.data.rows.filter(r=>r.rank<jp.rank).sort((a,b)=>a.rank-b.rank),async country=>{
   const team=teams.find(t=>t.code===country.code),teamSource=team?`https://www.espn.com/soccer/team/fixtures/_/id/${team.id}`:source;
   const games=await safely(async()=>{if(!team)throw Error('Team not matched');const base=`https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/${team.id}/schedule`;const results=await Promise.all([base,base+'?fixture=true'].map(async url=>parseTeamSchedule(JSON.parse(await getText(url)),country.code)));return [...new Map(results.flat().map(g=>[g.id,g])).values()].sort((a,b)=>a.kickoff.localeCompare(b.kickoff));},teamSource);
   return {code:country.code,games};
  });return {countries};
 },source);
}
export async function collectDaily(getText){
 const nationalPromise=safely(async()=>parseHeadlines(await getText('https://news.web.nhk/n-data/conf/na/rss/cat0.xml')),'https://news.web.nhk/newsweb');
 const locations=await mapLimit(regions,async region=>{
  const weatherSource=`https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=${region.weatherCode}`,newsSource=`https://news.web.nhk/newsweb/area/${region.newsCode}`;
  const [weather,news]=await Promise.all([safely(async()=>parseWeather(JSON.parse(await getText(`https://www.jma.go.jp/bosai/forecast/data/forecast/${region.weatherCode}.json`))),weatherSource),safely(async()=>parseRegionalNews(await getText(newsSource)),newsSource)]);
  return [region.id,{weather,news}];
 });return {regions:regions.map(({id,name})=>({id,name})),nationalNews:await nationalPromise,locations:Object.fromEntries(locations)};
}

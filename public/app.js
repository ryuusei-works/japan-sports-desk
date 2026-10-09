let data, standingsLeague='c', leaderLeague='c', category='avg';
const $=id=>document.getElementById(id);
const panels={play:{title:'観戦に、ちょっとしたワクワクを。',description:'今日の注目選手くじと観戦ビンゴ。試合の楽しみ方を、もうひとつ。',label:'お楽しみ'},home:{title:'今日のスポーツを、ひと目で。',description:'野球と日本代表の試合を、ひとつのカレンダーに。',label:'ホーム'},settings:{title:'あなた好みの、観戦スペース。',description:'好きな色と応援球団で、毎日のチェックをもっと楽しく。',label:'設定'},guide:{title:'Sports Deskの使い方。',description:'知りたい情報へ、迷わず。はじめての方はこちらから。',label:'使い方・更新について'},baseball:{title:'野球を、もっと楽しもう。',description:'次の一戦も、タイトルの行方も。プロ野球の今をひと目で。',label:'野球'},football:{title:'日本代表の、次の一歩を。',description:'次の代表戦と世界の順位。SAMURAI BLUEを、もっと身近に。',label:'サッカー日本代表'}};
function showPanel(id){
 const target=Object.hasOwn(panels,id)?id:'home';
 for(const key of Object.keys(panels)){
  $(key).hidden=key!==target;
  const button=$('tab-'+key);if(!button)continue;button.classList.toggle('active',key===target);button.setAttribute('aria-selected',String(key===target));button.setAttribute('tabindex',key===target?'0':'-1');
 }
 $('page-title').textContent=panels[target].title;$('page-description').textContent=panels[target].description;$('breadcrumb-current').textContent=panels[target].label;
 document.title=panels[target].label+' | Sports Desk';
}
function navigatePanel(id){if(!Object.hasOwn(panels,id))return;showPanel(id);if(window.location.hash!=='#'+id)window.history.pushState(null,'','#'+id);window.scrollTo?.({top:0,behavior:'instant'});}
document.querySelector('.site-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-tab]');if(button)navigatePanel(button.dataset.tab);});
document.querySelector('.site-tabs').addEventListener('keydown',event=>{
 const buttons=[...document.querySelectorAll('.site-tabs [data-tab]')];const index=buttons.indexOf(event.target);if(index<0)return;
 let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
 event.preventDefault();navigatePanel(buttons[next].dataset.tab);buttons[next].focus();
});
document.querySelectorAll('[data-open-tab]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();navigatePanel(link.dataset.openTab);}));
window.addEventListener('hashchange',()=>{const id=window.location.hash.slice(1);if(id!=='main-content')showPanel(id);});
window.addEventListener('popstate',()=>{const id=window.location.hash.slice(1);if(id!=='main-content')showPanel(id);});
showPanel(window.location.hash.slice(1));
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const number=v=>Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const countryNames={JPN:'日本',ESP:'スペイン',ARG:'アルゼンチン',FRA:'フランス',ENG:'イングランド',BRA:'ブラジル',POR:'ポルトガル',NED:'オランダ',BEL:'ベルギー',GER:'ドイツ',CRO:'クロアチア',MAR:'モロッコ',ITA:'イタリア',COL:'コロンビア',URU:'ウルグアイ',SUI:'スイス',USA:'アメリカ',MEX:'メキシコ',SEN:'セネガル',IRN:'イラン',KOR:'韓国',PAR:'パラグアイ',SCO:'スコットランド'};
Object.assign(countryNames,{IDN:'インドネシア',THA:'タイ',UZB:'ウズベキスタン',AUS:'オーストラリア',KSA:'サウジアラビア',QAT:'カタール',IRQ:'イラク',JOR:'ヨルダン',CHN:'中国',VIE:'ベトナム',UAE:'アラブ首長国連邦',BHR:'バーレーン',OMA:'オマーン'});
const name=r=>countryNames[r.code]||r.name;
const teams={神:'阪神タイガース',巨:'読売ジャイアンツ',デ:'横浜DeNAベイスターズ',広:'広島東洋カープ',ヤ:'東京ヤクルトスワローズ',中:'中日ドラゴンズ',ソ:'福岡ソフトバンクホークス',西:'埼玉西武ライオンズ',日:'北海道日本ハムファイターズ',オ:'オリックス・バファローズ',ロ:'千葉ロッテマリーンズ',楽:'東北楽天ゴールデンイーグルス'};
const currentDay=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
const date=v=>new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'long',day:'numeric',weekday:'short'}).format(new Date(v+'T00:00:00+09:00'));
const empty=(message='公式データを取得できませんでした。時間をおいて再確認してください。')=>`<div class="empty">${esc(message)}</div>`;
function setSource(id,url){$(id).href=url;}
function paintStandings(){
 const source=data.standings;setSource('standings-source',source.source);
 if(!source.ok){$('standings').innerHTML=empty();return;}
 const rows=source.data[standingsLeague];
 $('standings').innerHTML=`<table><thead><tr><th>順位</th><th>チーム</th><th>試合</th><th>勝</th><th>敗</th><th>分</th><th><abbr title="勝利数 ÷（勝利数＋敗戦数）。引き分けは分母に含みません。">勝率</abbr></th><th><abbr title="首位とのゲーム差。一般に勝敗数の差から計算し、0.5ゲーム単位で表示します。">差</abbr></th><th>前回比</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td class="team-cell"><span class="team-line"></span>${esc(r.team)}</td><td>${esc(r.games)}</td><td>${esc(r.wins)}</td><td>${esc(r.losses)}</td><td>${esc(r.draws)}</td><td>${esc(r.pct)}</td><td>${esc(r.gap)}</td><td class="change-cell">${standingChange(r,i)}</td></tr>`).join('')}</tbody></table>`;
 document.querySelectorAll('.team-line').forEach((el,i)=>el.setAttribute('data-color',i%6));
}
function baseline(){const prev=data.previous;return prev&&prev.year===data.year&&Date.parse(prev.generatedAt)<Date.parse(data.generatedAt)?prev:null;}
function rankChange(oldRank,newRank){const delta=oldRank-newRank;return delta>0?`↑ ${delta}位上昇`:delta<0?`↓ ${-delta}位下降`:'順位変動なし';}
function valueChange(value,before,cat){const delta=Number(value)-Number(before);if(Math.abs(delta)<1e-9)return '成績変動なし';const decimals=['avg','obp','pct'].includes(cat.id)?3:cat.id==='era'?2:0;return `${delta>0?'+':''}${delta.toFixed(decimals)}${cat.unit?' '+cat.unit:''}`;}
function standingChange(row,index){const prev=baseline()?.standings;if(!prev?.ok)return '比較なし';const prior=prev.data[standingsLeague]||[];const oldIndex=prior.findIndex(r=>r.team===row.team);if(oldIndex<0)return '比較なし';const old=prior[oldIndex];const parts=[rankChange(oldIndex+1,index+1)];for(const [key,label] of [['wins','勝'],['losses','敗'],['draws','分']]){const delta=Number(row[key])-Number(old[key]);if(Number.isFinite(delta)&&delta!==0)parts.push(`${label} ${delta>0?'+':''}${delta}`);}return parts.map(esc).join('<br>');}
function playerChange(row,cat,league,club){const prev=baseline();if(!prev)return '比較なし';const sources=league==='all'?[prev.leaders?.[cat.id]?.c,prev.leaders?.[cat.id]?.p]:[prev.leaders?.[cat.id]?.[league]];if(sources.some(s=>!s?.ok))return '比較なし';const prior=ranked(sources.flatMap(s=>s.data).filter(p=>club==='all'||p.team===club),cat.low,Infinity);const old=prior.find(p=>p.name===row.name&&p.team===row.team&&p.league===row.league);if(!old)return '前回対象なし';return [rankChange(old.rank,row.rank),valueChange(row.value,old.value,cat)].map(esc).join('<br>');}
function paintComparisonTime(){const prev=baseline();$('comparison-time').textContent=prev?'前回比の基準：'+new Date(prev.generatedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+' JST（前回の公開データ）。比較元がない項目は「比較なし」。':'前回比：比較できる前回の公開データがありません。次回更新から比較します。';}
function paintGames(){
 setSource('baseball-source',data.baseballGames.source);
 if(!data.baseballGames.ok){$('baseball-games').innerHTML=empty();return;}
 let games=data.baseballGames.data.filter(g=>g.date>=currentDay()&&g.status==='scheduled');const filter=$('team').value;if(filter!=='all')games=games.filter(g=>g.home===filter||g.away===filter);games=games.slice(0,36);
 $('baseball-games').innerHTML=games.length?games.map(g=>`<div class="game"><div class="game-meta"><span>${date(g.date)}</span><b>${esc(g.time)||'開始時間未定'}</b></div><div class="matchup"><span class="team-mark">${esc(g.home.slice(0,1))}</span>${esc(g.home)}<span class="vs">VS</span>${esc(g.away)}<span class="team-mark">${esc(g.away.slice(0,1))}</span></div><div class="game-venue">${esc(g.venue)}</div></div>`).join(''):empty(filter==='all'?'直近3か月に発表済みの試合はありません。公式日程をご確認ください。':'直近の発表済み日程に、このチームの試合はありません。');
}
function ranked(rows,low,limit=10){let prev,rank=0;return [...rows].sort((a,b)=>low?Number(a.value)-Number(b.value):Number(b.value)-Number(a.value)).map((r,i)=>{if(Number(r.value)!==prev)rank=i+1;prev=Number(r.value);return {...r,rank};}).filter(r=>r.rank<=limit);}
function paintLeaders(){
 const club=$('leader-team').value;const effective=club!=='all'?('神巨デ広ヤ中'.includes(club)?'c':'p'):leaderLeague;const cat=data.categories.find(c=>c.id===category);const sources=effective==='all'?[data.leaders[category].c,data.leaders[category].p]:[data.leaders[category][effective]];
 $('leader-source').innerHTML=sources.map((s,i)=>`<a target="_blank" rel="noopener noreferrer" href="${esc(s.source)}">${effective==='all'?(i?'パ':'セ')+'・リーグ出典':'NPB公式出典'} ↗</a>`).join('　');
 $('leader-time').textContent=sources.map(s=>stamp(s)).join(' / ');
 $('leader-note').textContent=[club!=='all'?'球団内の独自順位（公式タイトルではありません）':leaderLeague==='all'?'セパ総合・独自集計':'リーグ順位',cat.note||'NPB公式成績',club==='all'&&effective==='all'?'セパ総合は独自集計（公式タイトルではありません）':'同順位は同じ順位で表示'].join(' · ')+' · 差は現在の成績差（同率首位まで）。打率などは必要な安打数ではありません。';
 if(sources.some(s=>!s.ok)){$('leaders').innerHTML=empty();$('leader-spotlight').innerHTML=empty('ランキングを確認できません');return;}
 const allRows=sources.flatMap(s=>s.data);const reference=ranked(allRows,cat.low)[0];
 const rows=ranked(allRows.filter(r=>club==='all'||r.team===club),cat.low);const top=rows[0];if(!top){$('leaders').innerHTML=empty('この球団にランキング対象者はいません。規定条件はリーグ順位と同じです。');$('leader-spotlight').innerHTML=empty('対象者なし');return;}
 $('leader-spotlight').innerHTML=`<div class="leader-kicker">${club==='all'?'LEAGUE LEADER':'TEAM LEADER'} / ${esc(cat.label)}</div><div class="crown">♛</div><h4>${esc(top.name)}</h4><div class="leader-team">${esc(teams[top.team]||top.team)}</div><div class="leader-value">${esc(top.value)}<span>${esc(cat.unit)}</span></div><div class="leader-label">${esc(cat.label)}ランキング 第1位</div>${rows.filter(r=>r.rank===1).length>1?'<p class="note">同率首位の選手がいます</p>':''}`;
 $('leaders').innerHTML=`<table class="leaders-table"><thead><tr><th>順位</th><th>選手</th><th>所属</th><th>リーグ</th><th>${esc(cat.label)}</th><th>${club==='all'?'首位との差':'リーグ首位との差'}</th><th>前回比</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.team===preferences.favorite?'favorite-player':''}"><td>${r.rank}</td><td class="team-cell">${r.team===preferences.favorite?'<span class="favorite-player-mark" aria-label="応援球団の選手">★</span> ':''}${esc(r.name)}</td><td>${esc(r.team)}</td><td><span class="league-pill">${r.league==='c'?'セ':'パ'}</span></td><td>${esc(r.value)} <small>${esc(cat.unit)}</small></td><td class="title-gap">${esc(titleGap(r,reference,cat))}</td><td class="change-cell">${playerChange(r,cat,effective,club)}</td></tr>`).join('')}</tbody></table>`;
}
function paintFootball(){
 const s=data.footballGames;setSource('football-source',s.source);
 if(!s.ok){$('football-game').innerHTML=empty();return;}
 const g=s.data.find(g=>g.date>=currentDay()&&g.status==='scheduled');if(!g){$('football-game').innerHTML=empty('取得済みのデータに次の代表戦はありません。公式日程をご確認ください。');return;}
 $('football-game').innerHTML=`<div class="football-match-content"><div class="competition">${esc(g.competition)}</div><div class="football-date">${date(g.date)}</div><div class="national-matchup"><div><div class="japan-flag"></div><strong>日本</strong></div><span>VS</span><div><div class="flag">⚽</div><strong>${esc(g.opponent)}</strong></div></div><div class="kickoff">キックオフ ${g.time?esc(g.time)+'（日本時間）':'時刻は公式詳細をご確認ください'}</div><div class="football-venue">${esc(g.venue)}</div></div>`;setSource('football-source',g.url);
}
function paintFifa(){
 if(!data.fifa.ok){$('fifa-summary').innerHTML=empty();$('roadmap').innerHTML=empty('順位とポイントを取得できないため、ポイント差を計算できません。');$('simulator').hidden=true;return;}
 const rows=data.fifa.data.rows;const jp=rows.find(r=>r.code==='JPN');const index=rows.indexOf(jp),above=rows[index-1];
 $('fifa-summary').innerHTML=`<div class="fifa-main"><div class="rank-big">${jp.rank}<span>位</span></div><div class="fifa-points"><small>JAPAN / TOTAL POINTS</small><b>${number(jp.points)} <span>pts</span></b><small>前回 ${jp.previousRank}位</small></div></div><div class="fifa-neighbors">${rows.slice(Math.max(0,index-1),index+2).map(r=>`<div class="neighbor ${r.code==='JPN'?'active':''}"><span>${r.rank}</span><span>${esc(name(r))}</span><b>${number(r.points)} <small>pts</small></b></div>`).join('')}</div>`;
 $('fifa-date').textContent='公式発表 '+new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo'}).format(new Date(data.fifa.data.date));
 paintNextMatchSimulation();
}
function nextFootballGame(){return data.footballGames.ok?[...data.footballGames.data].filter(g=>g.date>=currentDay()&&g.status==='scheduled').sort((a,b)=>a.date.localeCompare(b.date))[0]:null;}
function matchImportance(game){
 const title=game.competition||'';
 if(/予選|qualif/i.test(title))return '25';
 if(/アジアカップ|ASIAN CUP/i.test(title)){if(/準々決勝|準決勝|決勝(?!トーナメント)|quarter|semi|final$/i.test(title))return '40';if(/グループ|ラウンド16|group|round of 16/i.test(title))return '35';return '';}
 if(/ワールドカップ|WORLD CUP/i.test(title)){if(/準々決勝|準決勝|決勝(?!トーナメント)|quarter|semi|final$/i.test(title))return '60';if(/グループ|ラウンド|group|round of/i.test(title))return '50';return '';}
 if(/親善|friendly|CHALLENGE|キリンチャレンジ/i.test(title)){
  // FIFA men's calendar 2026: March 23–31, June 1–9,
  // September 21–October 6, November 9–17. Other years need confirmation.
  const windows=[['2026-03-23','2026-03-31'],['2026-06-01','2026-06-09'],['2026-09-21','2026-10-06'],['2026-11-09','2026-11-17']];
  if(game.date.startsWith('2026-'))return windows.some(([a,b])=>game.date>=a&&game.date<=b)?'10':'5';
 }
 return '';
}
function matchedOpponent(game,rows){const opponent=game.opponent.replace(/代表$/,'').trim();return rows.find(r=>r.code!=='JPN'&&(name(r)===opponent||r.name===opponent));}
let simulationGameKey='';
function paintNextMatchSimulation(){
 const game=nextFootballGame();$('simulator').hidden=true;
 if(!game){$('roadmap').innerHTML=empty('次の代表戦が未発表、または日程を取得できないため試算できません。');return;}
 const opponent=matchedOpponent(game,data.fifa.data.rows);
 $('roadmap').innerHTML=`<div class="next-simulation-match"><span class="eyebrow">NEXT MATCH / ${date(game.date)}</span><h4>日本 × ${esc(game.opponent)}</h4><p>${esc(game.competition)}</p><p>この試合の勝敗で、日本のポイントと順位がどう変わるかを試算します。</p></div>`;
 if(!opponent){$('roadmap').innerHTML+=empty('対戦相手のFIFAポイントを照合できないため試算できません。相手未定・非加盟チームの場合も計算できません。');return;}
 $('simulator').hidden=false;$('opponent').textContent=`${name(opponent)} · ${opponent.rank}位 (${number(opponent.points)} pts)`;
 const key=game.date+'|'+game.opponent+'|'+game.competition;if(key!==simulationGameKey){$('importance').value=matchImportance(game);simulationGameKey=key;}
 $('simulation-assumption').textContent=matchImportance(game)?'公式日程の大会名と国際試合カレンダーから試合種別を設定しています。必要に応じて変更できます。':'試合種別・大会ステージを確定できません。公式日程を確認して試合の種類を選んでください。';paintSimulation();
}
function paintSimulation(){
 if(!data?.fifa.ok)return;const game=nextFootballGame();if(!game)return;const rows=data.fifa.data.rows;const jp=rows.find(r=>r.code==='JPN'),opponent=matchedOpponent(game,rows);const importance=Number($('importance').value);
 if(!opponent||!importance){$('simulation').innerHTML=empty('試合の種類を選ぶと、勝ち・引き分け・負けの場合を表示します。');return;}
 const above=rows.filter(r=>r.points>jp.points).sort((a,b)=>a.points-b.points)[0];const expected=1/(1+10**((opponent.points-jp.points)/600));
 $('simulation').innerHTML=[['勝った場合',1],['引き分け',.5],['負けた場合',0]].map(([label,result])=>{const gain=importance*(result-expected),points=jp.points+gain;const projected=1+rows.filter(r=>r.code!=='JPN'&&(r.code===opponent.code?opponent.points-gain:r.points)>points).length;const target=above?.code===opponent.code?above.points-gain:above?.points;return `<div class="sim-result"><span>${label}</span><b>${gain>=0?'+':''}${number(gain)} pts</b><strong class="projected-rank">概算 ${projected}位</strong><small>試合後 ${number(points)} pts${above?`<br>${points>target?name(above)+'の想定ポイントを超過':points===target?name(above)+'と同ポイント':name(above)+'まで '+number(target-points)+' pts差'}`:''}</small></div>`;}).join('');
}

function tabs(id,set){$(id).addEventListener('click',e=>{const b=e.target.closest('button[data-league]');if(!b||!data)return;$(id).querySelectorAll('button').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));});set(b.dataset.league);});}
tabs('standings-tabs',league=>{standingsLeague=league;paintStandings();});tabs('leader-tabs',league=>{leaderLeague=league;$('leader-team').value='all';paintLeaders();});
$('team').addEventListener('change',()=>{if(data)paintGames();});$('importance').addEventListener('change',paintSimulation);
const scheduleTeams={神:'阪神',巨:'巨人',デ:'DeNA',広:'広島',ヤ:'ヤクルト',中:'中日',ソ:'ソフトバンク',西:'西武',日:'日本ハム',オ:'オリックス',ロ:'ロッテ',楽:'楽天'};
const themes={lavender:'ラベンダー',blue:'ブルー',green:'グリーン',coral:'コーラル',amber:'アンバー'};
const settingsKey='sports-desk-preferences-v1';let preferences={theme:'lavender',favorite:'all',fontSize:'standard'};
try{const saved=JSON.parse(window.localStorage.getItem(settingsKey)||'null');if(saved){if(['standard','large'].includes(saved.fontSize))preferences.fontSize=saved.fontSize;if(Object.hasOwn(themes,saved.theme))preferences.theme=saved.theme;if(saved.favorite==='all'||Object.hasOwn(teams,saved.favorite))preferences.favorite=saved.favorite;}}catch{}
function savePreferences(){try{window.localStorage.setItem(settingsKey,JSON.stringify(preferences));$('settings-status').textContent='保存しました。このブラウザーで次回も反映します。';}catch{$('settings-status').textContent='ブラウザーに保存できませんでした。この画面を開いている間だけ反映します。';}}
function applyTheme(){document.documentElement.dataset.theme=preferences.theme;document.querySelectorAll('[data-theme-choice]').forEach(b=>{b.classList.toggle('selected',b.dataset.themeChoice===preferences.theme);b.setAttribute('aria-pressed',String(b.dataset.themeChoice===preferences.theme));});}
$('theme-options').innerHTML=Object.entries(themes).map(([key,label])=>`<button data-theme-choice="${key}" class="theme-choice ${key}"><span></span>${label}</button>`).join('');
const clubOptions='<option value="all">すべての球団</option>'+Object.entries(teams).map(([key,label])=>`<option value="${key}">${label}</option>`).join('');
$('favorite-team').innerHTML=clubOptions.replace('すべての球団','未設定');$('favorite-team').value=preferences.favorite;$('leader-team').innerHTML=clubOptions;
applyTheme();applyFontSize();
$('theme-options').addEventListener('click',e=>{const b=e.target.closest('[data-theme-choice]');if(!b)return;preferences.theme=b.dataset.themeChoice;applyTheme();savePreferences();});
function applyFavorite(){const code=preferences.favorite;const value=scheduleTeams[code]||'all';if([...$('team').options].some(o=>o.value===value))$('team').value=value;else $('team').value='all';if(data){paintGames();paintCalendar();paintHome();paintLeaders();paintStandings();paintRecentResults();paintLottery();}}
$('favorite-team').addEventListener('change',()=>{preferences.favorite=$('favorite-team').value;savePreferences();applyFavorite();});
$('settings-reset').addEventListener('click',()=>{preferences={theme:'lavender',favorite:'all',fontSize:'standard'};$('favorite-team').value='all';applyTheme();applyFontSize();applyFavorite();savePreferences();});
$('leader-team').addEventListener('change',()=>{const club=$('leader-team').value;if(club!=='all'){leaderLeague='神巨デ広ヤ中'.includes(club)?'c':'p';$('leader-tabs').querySelectorAll('button').forEach(b=>{const chosen=b.dataset.league===leaderLeague;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});}if(data)paintLeaders();});
const stamp=s=>s?.ok&&s.fetchedAt?'取得：'+new Date(s.fetchedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+' JST':'取得できませんでした';
function paintTimes(){document.querySelectorAll('[data-time]').forEach(el=>{el.textContent=stamp(data[el.dataset.time]);});}
function paintNews(){for(const sport of ['baseball','football']){const source=data[sport+'News'];$(sport+'-news').innerHTML=source?.ok?source.data.map(n=>`<a class="news-item" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer"><time>${esc(n.date)}</time><span>${esc(n.title)}</span><b aria-hidden="true">↗</b></a>`).join(''):empty('ニュースを取得できませんでした。公式サイトをご確認ください。');}}
let calendarMonth=currentDay().slice(0,7),selectedDay=currentDay(),calendarFilter='all';
function calendarEvents(){return [...(data.baseballGames.ok?data.baseballGames.data.map(g=>({...g,sport:'baseball'})):[]),...(data.footballGames.ok?data.footballGames.data.map(g=>({...g,sport:'football'})):[])];}
function isFavorite(g){return preferences.favorite!=='all'&&(g.home===scheduleTeams[preferences.favorite]||g.away===scheduleTeams[preferences.favorite]);}
function eventLabel(g){return g.sport==='baseball'?`${g.home} × ${g.away}`:`日本 × ${g.opponent}`;}
function paintCalendar(){
 if(!data)return;const [y,m]=calendarMonth.split('-').map(Number);const offset=new Date(Date.UTC(y,m-1,1)).getUTCDay(),count=new Date(Date.UTC(y,m,0)).getUTCDate();const events=filteredCalendarEvents();
 $('calendar-filter-note').textContent=calendarFilter==='favorite'?(preferences.favorite==='all'?'設定で応援球団を選ぶと、その球団の試合を表示します。':teams[preferences.favorite]+'の試合だけを表示しています。'):'';
 $('calendar-month').textContent=`${y}年${m}月`;
 $('calendar-coverage').textContent=`野球：取得月（${data.today.slice(0,7)}）の前月〜翌々月の公表済み日程。サッカー：${data.year}年の公式日程（翌年分の掲載を含む）。空欄は表示対象の試合が取得済み日程にない日です。${!data.baseballGames.ok||!data.footballGames.ok?'一部の日程を取得できていません。公式日程をご確認ください。':''}`;
 const out=['日','月','火','水','木','金','土'].map(d=>`<div class="weekday">${d}</div>`);for(let i=0;i<offset;i++)out.push('<div class="calendar-blank"></div>');
 for(let n=1;n<=count;n++){const day=`${calendarMonth}-${String(n).padStart(2,'0')}`,games=events.filter(g=>g.date===day);out.push(`<button class="calendar-day ${day===currentDay()?'today':''} ${day===selectedDay?'chosen':''}" data-day="${day}" aria-pressed="${day===selectedDay}" aria-label="${day}、${games.length}試合"><span class="day-number">${n}</span>${games.slice(0,3).map(g=>`<span class="calendar-event ${g.sport} ${isFavorite(g)?'favorite':''}">${g.sport==='baseball'?'⚾':'⚽'} ${isFavorite(g)?'★ ':''}${esc(eventLabel(g))}</span>`).join('')}${games.length>3?`<span class="more-games">ほか${games.length-3}試合</span>`:''}</button>`);}
 $('calendar').innerHTML=out.join('');$('day-title').textContent=date(selectedDay)+'の試合';const games=events.filter(g=>g.date===selectedDay);
 $('day-games').innerHTML=games.length?games.map(g=>`<div class="calendar-detail-game ${g.sport}"><b>${g.sport==='baseball'?'⚾':'⚽'} ${isFavorite(g)?'★ ':''}${esc(eventLabel(g))}</b><span>${esc(gameState(g))} · ${esc(g.venue)}</span></div>`).join(''):empty('表示対象の試合は取得済みの日程にありません。未発表・取得範囲外の日程は公式サイトをご確認ください。');
}
function filteredCalendarEvents(){return calendarEvents().filter(g=>calendarFilter==='all'||calendarFilter==='favorite'&&isFavorite(g)||g.sport===calendarFilter);}
$('calendar-filters').addEventListener('click',e=>{const b=e.target.closest('[data-calendar-filter]');if(!b)return;calendarFilter=b.dataset.calendarFilter;$('calendar-filters').querySelectorAll('button').forEach(el=>{const chosen=el===b;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen));});paintCalendar();});
function shiftDay(day,offset){const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
function weekRange(today=currentDay()){const day=new Date(today+'T00:00:00Z').getUTCDay(),start=shiftDay(today,-((day+6)%7));return {start,end:shiftDay(start,6)};}
function gameState(g){return g.status==='finished'?'終了':g.status==='cancelled'?'中止・延期':g.status==='inprogress'?'試合中（取得時点）':g.time?g.time+' 予定':'開始時刻は公式で確認';}
function homeGames(games){return games.map(g=>`<div class="home-game ${g.sport}"><div><span class="home-game-date">${date(g.date)} · ${g.sport==='baseball'?'⚾ 野球':'⚽ 日本代表'}</span><b>${isFavorite(g)?'★ ':''}${esc(eventLabel(g))}</b><small>${esc(g.venue)}</small></div><span class="home-game-state">${esc(gameState(g))}</span></div>`).join('');}
function titleGap(player,top,cat){const difference=Math.abs(Number(player.value)-Number(top.value));if(difference<1e-9)return '首位（差なし）';const decimals=['avg','obp','pct'].includes(cat.id)?3:cat.id==='era'?2:0;return difference.toFixed(decimals)+(cat.unit?' '+cat.unit:'');}
function paintHome(){
 if(!data)return;const today=currentDay(),week=weekRange(today);const events=calendarEvents().sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99:99').localeCompare(b.time||'99:99'));
 for(const [key,games] of [['today',events.filter(g=>g.date===today)],['week',events.filter(g=>g.date>=week.start&&g.date<=week.end)]]){$(key+'-count').textContent=games.length+'試合';$(key+'-games').innerHTML=games.length?homeGames(games):empty('取得済みの日程に試合の掲載はありません。');}
 $('today-range').textContent=date(today);$('week-range').textContent=`${date(week.start)} 〜 ${date(week.end)}`;
 $('home-schedule-note').textContent='日本時間 · 今週は月曜〜日曜（終了・中止を含む）。公表済み・取得範囲内の日程を表示します。試合速報ではありません。'+(!data.baseballGames.ok||!data.footballGames.ok?' 一部の日程を取得できていないため、試合数は取得成功分のみです。':'');
 paintFavoriteSummary();
}
function paintFavoriteSummary(){
 const club=preferences.favorite;$('favorite-heading').textContent=club==='all'?'応援球団のまとめ':teams[club];
 if(club==='all'){$('favorite-summary').innerHTML=empty('応援球団を設定すると、次の試合・順位・球団のトップ選手をまとめて確認できます。');return;}
 const league='神巨デ広ヤ中'.includes(club)?'c':'p';const standings=data.standings;const rows=standings.ok?standings.data[league]:[];const index=rows.findIndex(r=>r.team===teams[club]);const row=rows[index];
 const games=data.baseballGames;const next=games.ok?[...games.data].filter(g=>g.date>=currentDay()&&g.status==='scheduled'&&isFavorite(g)).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99:99').localeCompare(b.time||'99:99'))[0]:null;
 const rankText=row?`${league==='c'?'セ':'パ'}・リーグ ${index+1}位`:'順位を取得できませんでした';const gap=row?(index===0?'首位':/^\d+(?:\.\d+)?$/.test(row.gap)?`首位と ${row.gap} ゲーム差`:'首位との差は公式順位をご確認ください'):'公式順位をご確認ください';
 const major=['avg','hr','rbi','w','era','so'].map(id=>{const cat=data.categories.find(c=>c.id===id),source=data.leaders[id]?.[league];const leaders=source?.ok?ranked(source.data.filter(r=>r.team===club),cat.low).filter(r=>r.rank===1):[];return `<div class="favorite-stat"><span>${esc(cat.label)}</span>${leaders.length?`<b>${leaders.map(r=>esc(r.name)).join(' / ')}</b><strong>${esc(leaders[0].value)} <small>${esc(cat.unit)}</small></strong>`:`<p>${source?.ok?'規定条件に該当する選手なし':'取得できませんでした'}</p>`}</div>`;}).join('');
 $('favorite-summary').innerHTML=`<div class="favorite-overview"><div><span class="eyebrow">LEAGUE STANDING</span><h4>${esc(rankText)}</h4><p>${esc(gap)}</p>${row?`<small>${esc(row.wins)}勝 ${esc(row.losses)}敗 ${esc(row.draws)}分 · 勝率 ${esc(row.pct)}</small>`:''}</div><div><span class="eyebrow">NEXT GAME</span>${next?`<h4>${esc(eventLabel({...next,sport:"baseball"}))}</h4><p>${date(next.date)} · ${esc(next.time)||'開始時刻未定'}</p><small>${esc(next.venue)}</small>`:`<p>${games.ok?'取得範囲内に次の発表済み試合はありません。':'試合日程を取得できませんでした。'}</p>`}</div></div><h4 class="favorite-stats-heading">球団のトップ選手 <small>レギュラーシーズン</small></h4><div class="favorite-stats">${major}</div><p class="home-note favorite-note">NPB掲載の対象者から集計。同率トップは全員表示。打率・防御率は規定対象者です。</p><p class="source-time">主要6部門 ${['avg','hr','rbi','w','era','so'].map(id=>`${data.categories.find(c=>c.id===id).label} ${stamp(data.leaders[id]?.[league])}`).map(esc).join(' / ')}</p>`;
}
$('calendar').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(b){selectedDay=b.dataset.day;paintCalendar();}});
function moveMonth(delta){const [y,m]=calendarMonth.split('-').map(Number);calendarMonth=new Date(Date.UTC(y,m-1+delta,1)).toISOString().slice(0,7);selectedDay=calendarMonth+'-01';paintCalendar();}
$('month-prev').addEventListener('click',()=>moveMonth(-1));$('month-next').addEventListener('click',()=>moveMonth(1));$('month-today').addEventListener('click',()=>{calendarMonth=currentDay().slice(0,7);selectedDay=currentDay();paintCalendar();});
function applyFontSize(){document.documentElement.dataset.fontSize=preferences.fontSize;$('font-size-options').querySelectorAll('button').forEach(b=>{const chosen=b.dataset.fontSize===preferences.fontSize;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});}
$('font-size-options').addEventListener('click',e=>{const b=e.target.closest('[data-font-size]');if(!b)return;preferences.fontSize=b.dataset.fontSize;applyFontSize();savePreferences();});
function completedFootball(){const source=data.footballHistory||data.footballGames;return source?.ok?[...source.data].filter(g=>g.status==='finished'&&g.date<=currentDay()).sort((a,b)=>b.date.localeCompare(a.date)):[];}
function validScore(a,b){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0;}
function footballOutcome(g){const result=g.result||(validScore(g.japanScore,g.opponentScore)?g.japanScore>g.opponentScore?'win':g.japanScore<g.opponentScore?'loss':'draw':null);return (result==='win'?'勝ち':result==='loss'?'負け':result==='draw'?'引き分け':'結果未取得')+(/PK/i.test(g.score||'')?'（PK戦）':'');}
function footballResultCard(g){const score=validScore(g.japanScore,g.opponentScore)?`${g.japanScore} − ${g.opponentScore}`:'スコア未取得';const pk=(g.score||'').match(/PK\s*\d+\s*[-－–−]\s*\d+/i)?.[0];return `<div class="result-match"><span class="result-date">${date(g.date)} · ${esc(footballOutcome(g))}</span><h4>日本 <strong>${score}</strong> ${esc(g.opponent)}</h4>${pk?`<p>${esc(pk)}</p>`:''}<p>${esc(g.competition||'')}</p><small>${esc(g.venue||'')}</small><a href="${esc(g.url||'https://www.jfa.jp/samuraiblue/')}" target="_blank" rel="noopener noreferrer">JFA公式結果 ↗</a></div>`;}
function paintRecentResults(){
 if(!data)return;const club=preferences.favorite;$('baseball-results-heading').textContent=club==='all'?'応援球団の直近5試合':teams[club]+'の直近5試合';
 const source=data.baseballResults;
 if(club==='all')$('baseball-results').innerHTML=empty('設定で応援球団を選ぶと、直近5試合の結果を表示します。');
 else if(!source?.ok)$('baseball-results').innerHTML=empty('試合結果を取得できませんでした。NPB公式日程をご確認ください。');
 else{const games=[...source.data].filter(g=>g.status==='finished'&&g.date<=currentDay()&&isFavorite(g)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
 $('baseball-results').innerHTML=games.length?`<div class="recent-result-list">${games.map(g=>{const scored=validScore(g.homeScore,g.awayScore),favoriteScore=g.home===scheduleTeams[club]?g.homeScore:g.awayScore,otherScore=g.home===scheduleTeams[club]?g.awayScore:g.homeScore;const outcome=!scored?'スコア未取得':favoriteScore>otherScore?'勝ち':favoriteScore<otherScore?'負け':'引き分け';return `<a class="recent-result" href="${esc(g.url||source.source)}" target="_blank" rel="noopener noreferrer"><time>${date(g.date)}</time><span class="result-outcome">${outcome}</span><b>${esc(g.home)} <strong>${scored?`${g.homeScore} − ${g.awayScore}`:'—'}</strong> ${esc(g.away)}</b><small>${esc(g.venue)} ↗</small></a>`;}).join('')}</div>${games.length<5?'<p class="source-time">取得範囲内の終了試合が5試合未満のため、確認できた分だけ表示しています。</p>':''}`:empty('取得範囲内に終了した試合はありません。最大8か月遡って確認しています。');}
 const history=data.footballHistory||data.footballGames;const last=completedFootball()[0];$('football-result').innerHTML=!history?.ok?empty('代表戦の結果を取得できませんでした。'):last?footballResultCard(last):empty('取得済みの日程に終了した代表戦はありません。');
}
function paintOpponentProfile(){
 if(!data)return;const game=nextFootballGame();if(!game){$('opponent-profile').innerHTML=empty('次の代表戦が未発表、または日程を取得できませんでした。');return;}
 const rows=data.fifa.ok?data.fifa.data.rows:[],opponent=matchedOpponent(game,rows),jp=rows.find(r=>r.code==='JPN');
 const history=data.footballHistory||data.footballGames;const headToHead=completedFootball().find(g=>g.opponent.replace(/代表$/,'').trim()===game.opponent.replace(/代表$/,'').trim());
 const gap=opponent&&jp?opponent.points-jp.points:null;
 $('opponent-profile').innerHTML=`<div class="opponent-intro"><span class="eyebrow">NEXT OPPONENT / ${date(game.date)}</span><h4>${esc(game.opponent)}</h4>${opponent&&jp?`<div class="opponent-numbers"><span><b>${opponent.rank}位</b>FIFAランキング</span><span><b>${number(opponent.points)} pts</b>最新公式ポイント</span></div><p>${Math.abs(gap)<.005?'日本と同ポイント':`日本より ${number(Math.abs(gap))} pts ${gap>0?'上':'下'}`}</p>`:'<p>FIFA順位・ポイントを取得または照合できませんでした。</p>'}<h5>直近の日本との対戦</h5></div>${!history?.ok?empty('過去の対戦結果を取得できませんでした。'):headToHead?footballResultCard(headToHead):empty('取得した直近3年分の公式日程に、この相手との対戦結果は見つかりませんでした。')}<p class="source-time">FIFAは最新公式発表、対戦結果は取得した過去3年分の男子代表日程が対象です。</p>`;
}
const pickKey='sports-desk-player-pick-v1',bingoKey='sports-desk-bingo-v1';let savedPick=null,bingoChecks=Array(9).fill(false);bingoChecks[4]=true;
try{const p=JSON.parse(window.localStorage.getItem(pickKey)||'null');if(p&&typeof p.name==='string'&&Object.hasOwn(teams,p.club)&&typeof p.date==='string')savedPick=p;}catch{}
try{const b=JSON.parse(window.localStorage.getItem(bingoKey)||'null');if(Array.isArray(b)&&b.length===9&&b.every(v=>typeof v==='boolean'))bingoChecks=b;bingoChecks[4]=true;}catch{}
function savePlay(key,value){try{window.localStorage.setItem(key,JSON.stringify(value));$('play-storage-status').textContent='このブラウザーに保存しました。登録・ログインは不要です。';}catch{$('play-storage-status').textContent='ブラウザーに保存できませんでした。この画面を開いている間だけ反映します。';}}
function playerPool(){
 if(!data||preferences.favorite==='all')return [];const club=preferences.favorite,league='神巨デ広ヤ中'.includes(club)?'c':'p',pool=new Map();
 for(const cat of data.categories){const source=data.leaders[cat.id]?.[league];if(!source?.ok)continue;for(const r of source.data){if(r.team!==club)continue;if(!pool.has(r.name))pool.set(r.name,{name:r.name,stats:[]});pool.get(r.name).stats.push({label:cat.label,value:r.value,unit:cat.unit||'',note:cat.note||''});}}
 return [...pool.values()];
}
function paintLottery(){
 if(!data){$('draw-player').disabled=true;$('lottery-result').innerHTML=empty('公式成績の読み込み後に抽選できます。');return;}
 const pool=playerPool(),club=preferences.favorite,league='神巨デ広ヤ中'.includes(club)?'c':'p';$('draw-player').disabled=!pool.length;
 $('lottery-note').textContent=club==='all'?'設定で応援球団を選んでください。':`${teams[club]} · ${data.year}年の取得済み成績掲載選手 ${pool.length}人`;
 const sources=club==='all'?[]:data.categories.map(cat=>data.leaders[cat.id]?.[league]);$('lottery-time').textContent=sources.length?'部門ごとの取得日時は野球ページで確認できます。'+(sources.some(s=>!s?.ok)?'一部の部門を取得できていないため、取得成功分が抽選対象です。':''):'';
 const player=savedPick?.date===currentDay()&&savedPick?.year===data.year&&savedPick?.club===club?pool.find(p=>p.name===savedPick.name):null;
 if(!pool.length){$('lottery-result').innerHTML=empty(club==='all'?'応援球団を選んで、今日の1人を引いてみよう。':'抽選対象の選手を取得できませんでした。公式成績を再確認してください。');return;}
 $('lottery-result').innerHTML=player?`<div class="picked-player"><span class="eyebrow">TODAY’S PICK / ${date(currentDay())}</span><div class="pick-symbol" aria-hidden="true">✦</div><h3>${esc(player.name)}</h3><p>${esc(teams[club])}</p><div class="pick-stats">${player.stats.map(s=>`<div><span>${esc(s.label)}</span><b>${esc(s.value)} <small>${esc(s.unit)}</small></b>${s.note?`<small>${esc(s.note)}</small>`:''}</div>`).join('')}</div><p class="note">取得できた掲載部門のみ表示しています。掲載のない部門を0として扱いません。</p></div>`:'<div class="pick-placeholder"><span aria-hidden="true">🎲</span><h3>今日、誰に注目する？</h3><p>ボタンを押して選手を引いてみよう。</p></div>';
 $('draw-player').textContent=player?'もう一度引く ✦':'注目選手を引く ✦';
}
$('draw-player').addEventListener('click',()=>{const pool=playerPool();if(!pool.length)return;const player=pool[Math.floor(Math.random()*pool.length)];savedPick={date:currentDay(),year:data.year,club:preferences.favorite,name:player.name};savePlay(pickKey,savedPick);paintLottery();});
const bingoLabels=['応援球団が勝利','ホームランが出た','日本代表が無失点','ナイスプレーを見た','FREE','好きな選手が活躍','初めての選手を覚えた','最後まで観戦した','誰かとスポーツの話をした'];
function paintBingo(){const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],complete=lines.filter(line=>line.every(i=>bingoChecks[i]));const winning=new Set(complete.flat());
 $('bingo-board').innerHTML=bingoLabels.map((label,i)=>`<button class="bingo-cell ${bingoChecks[i]?'checked':''} ${winning.has(i)?'bingo-win':''}" data-bingo-cell="${i}" aria-pressed="${bingoChecks[i]}" ${i===4?'disabled':''}>${bingoChecks[i]?'<span aria-hidden="true">✓</span>':''}${label}</button>`).join('');$('bingo-status').textContent=complete.length?`🎉 ${complete.length}ライン BINGO！ · ${bingoChecks.filter(Boolean).length}/9マス達成`:`${bingoChecks.filter(Boolean).length}/9マス達成 · チェックはもう一度押すと戻せます。`;
}
$('bingo-board').addEventListener('click',e=>{const b=e.target.closest('[data-bingo-cell]');if(!b)return;const i=Number(b.dataset.bingoCell);if(!Number.isInteger(i)||i<0||i>8||i===4)return;const focused=document.activeElement===b;bingoChecks[i]=!bingoChecks[i];savePlay(bingoKey,bingoChecks);paintBingo();if(focused)$('bingo-board').querySelector(`[data-bingo-cell="${i}"]`).focus();});
$('reset-bingo').addEventListener('click',()=>{bingoChecks=Array(9).fill(false);bingoChecks[4]=true;savePlay(bingoKey,bingoChecks);paintBingo();});paintBingo();paintLottery();
let loading=false,dataInitialized=false;async function refresh(){
 if(loading)return;loading=true;$('refresh').disabled=true;$('status').textContent='公開済みのデータを確認しています…';
 try{const response=await fetch('./data/sports.json',{cache:'no-cache',signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('データ取得エラー');data=await response.json();
 $('today').textContent=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).format(new Date());
 $('season').textContent=data.year;
 const teamBefore=$('team').value;$('team').innerHTML='<option value="all">すべてのチーム</option>'+Object.entries(scheduleTeams).map(([key,t])=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');$('team').value=[...$('team').options].some(o=>o.value===teamBefore)?teamBefore:'all';if(!dataInitialized){applyFavorite();dataInitialized=true;}
 $('categories').innerHTML=data.categories.map(c=>`<button data-category="${c.id}" class="${category===c.id?'selected':''}" aria-pressed="${category===c.id}">${esc(c.label)}</button>`).join('');
 paintStandings();paintGames();paintLeaders();paintFootball();paintFifa();paintCalendar();paintHome();paintNews();paintTimes();paintComparisonTime();paintRecentResults();paintOpponentProfile();paintLottery();
 const failed=[data.standings,data.baseballGames,data.footballGames,data.fifa,...[data.baseballNews,data.footballNews,data.baseballResults,data.footballHistory].filter(Boolean),...Object.values(data.leaders).flatMap(x=>[x.c,x.p])].filter(s=>!s.ok).length;
 const generated=new Date(data.generatedAt);const stale=Date.now()-generated.getTime()>7200000;
 $('status').classList.toggle('error',!!failed||stale);$('status').textContent=failed?`一部の公式データを取得できませんでした（${failed}件）。各欄の出典をご確認ください。`:stale?'表示中のデータは2時間以上前のものです。自動更新が遅れている可能性があります。出典をご確認ください。':'公式ソースから取得 · 毎時自動更新予定 · 試合速報ではありません';
 $('fetched-at').textContent='データ生成日時：'+generated.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+'（日本時間）';$('data-updated').textContent='データ取得・集計完了：'+generated.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+'（日本時間）';
 }catch{$('status').classList.add('error');$('status').textContent=data?'更新に失敗しました。表示中は前回取得のデータです。出典をご確認ください。':'データを取得できませんでした。「データを再確認」から再試行してください。';if(!data)for(const id of ['standings','baseball-games','leaders','football-game','fifa-summary','roadmap','today-games','week-games','favorite-summary','baseball-results','football-result','opponent-profile'])$(id).innerHTML=empty();}
 finally{loading=false;$('refresh').disabled=false;}
}
$('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$('categories').querySelectorAll('button').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));});paintLeaders();});
$('refresh').addEventListener('click',refresh);setInterval(()=>{if(!document.hidden)refresh();},900000);refresh();

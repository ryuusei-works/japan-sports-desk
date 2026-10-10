let data, standingsLeague='c', leaderLeague='c', category='avg';
const $=id=>document.getElementById(id);
const panels={draft:{title:'あなたの指名で、シーズン勝負。',description:'7部門・5巡のドラフトで、2つの軍の成績を比較。',label:'野球集計'},home:{title:'今日を、ひと目で。',description:'地域の天気とニュース、スポーツ。気になる情報を、ひとつの場所に。',label:'ホーム'},settings:{title:'あなた好みの、情報スペース。',description:'好きな色と表示地域で、毎日のチェックをもっと身近に。',label:'設定'},guide:{title:'Daily Deskの使い方。',description:'知りたい情報へ、迷わず。はじめての方はこちらから。',label:'使い方・更新について'},baseball:{title:'野球を、もっと楽しもう。',description:'次の一戦も、タイトルの行方も。プロ野球の今をひと目で。',label:'野球'},football:{title:'日本代表の、次の一歩を。',description:'次の代表戦と世界の順位。SAMURAI BLUEを、もっと身近に。',label:'サッカー日本代表'}};
function showPanel(id){
 const target=Object.hasOwn(panels,id)?id:'home';
 for(const key of Object.keys(panels)){
  $(key).hidden=key!==target;
  const button=$('tab-'+key);if(!button)continue;button.classList.toggle('active',key===target);button.setAttribute('aria-selected',String(key===target));button.setAttribute('tabindex',key===target?'0':'-1');
 }
 $('page-title').textContent=panels[target].title;$('page-description').textContent=panels[target].description;$('breadcrumb-current').textContent=panels[target].label;
 document.title=panels[target].label+' | Daily Desk';
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
const menuKey='sports-desk-menu-collapsed-v1';let menuCollapsed=false;
try{menuCollapsed=window.localStorage.getItem(menuKey)==='true';}catch{}
function applyMenu(){document.documentElement.dataset.menuCollapsed=String(menuCollapsed);$('site-menu').hidden=menuCollapsed;$('menu-toggle').setAttribute('aria-expanded',String(!menuCollapsed));$('menu-toggle').setAttribute('aria-label',menuCollapsed?'メニューを開く':'メニューを閉じる');$('menu-toggle').textContent=menuCollapsed?'☰ メニュー':'× 閉じる';}
$('menu-toggle').addEventListener('click',()=>{menuCollapsed=!menuCollapsed;applyMenu();try{window.localStorage.setItem(menuKey,String(menuCollapsed));}catch{}});applyMenu();
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const number=v=>Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const countryNames={JPN:'日本',ESP:'スペイン',ARG:'アルゼンチン',FRA:'フランス',ENG:'イングランド',BRA:'ブラジル',POR:'ポルトガル',NED:'オランダ',BEL:'ベルギー',GER:'ドイツ',CRO:'クロアチア',MAR:'モロッコ',ITA:'イタリア',COL:'コロンビア',URU:'ウルグアイ',SUI:'スイス',USA:'アメリカ',MEX:'メキシコ',SEN:'セネガル',IRN:'イラン',KOR:'韓国',PAR:'パラグアイ',SCO:'スコットランド'};
Object.assign(countryNames,{IDN:'インドネシア',THA:'タイ',UZB:'ウズベキスタン',AUS:'オーストラリア',KSA:'サウジアラビア',QAT:'カタール',IRQ:'イラク',JOR:'ヨルダン',CHN:'中国',VIE:'ベトナム',UAE:'アラブ首長国連邦',BHR:'バーレーン',OMA:'オマーン'});
Object.assign(countryNames,{CZE:'チェコ',NOR:'ノルウェー',GRE:'ギリシャ',SRB:'セルビア',MLI:'マリ',BEN:'ベナン',CAN:'カナダ',CHI:'チリ',PER:'ペルー',DEN:'デンマーク',SWE:'スウェーデン',HUN:'ハンガリー',AUT:'オーストリア',MKD:'北マケドニア',TUR:'トルコ',IND:'インド',NGA:'ナイジェリア'});
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
const regionNames=Object.fromEntries('北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split(' ').map((label,i)=>[String(i+1).padStart(2,'0'),label]));
const settingsKey='sports-desk-preferences-v1';let preferences={theme:'lavender',favorite:'all',region:'13'};
try{const saved=JSON.parse(window.localStorage.getItem(settingsKey)||'null');if(saved){if(Object.hasOwn(regionNames,saved.region))preferences.region=saved.region;if(Object.hasOwn(themes,saved.theme))preferences.theme=saved.theme;if(saved.favorite==='all'||Object.hasOwn(teams,saved.favorite))preferences.favorite=saved.favorite;}}catch{}
function savePreferences(){try{window.localStorage.setItem(settingsKey,JSON.stringify(preferences));$('settings-status').textContent='保存しました。このブラウザーで次回も反映します。';}catch{$('settings-status').textContent='ブラウザーに保存できませんでした。この画面を開いている間だけ反映します。';}}
function applyTheme(){document.documentElement.dataset.theme=preferences.theme;document.querySelectorAll('[data-theme-choice]').forEach(b=>{b.classList.toggle('selected',b.dataset.themeChoice===preferences.theme);b.setAttribute('aria-pressed',String(b.dataset.themeChoice===preferences.theme));});}
$('theme-options').innerHTML=Object.entries(themes).map(([key,label])=>`<button data-theme-choice="${key}" class="theme-choice ${key}"><span></span>${label}</button>`).join('');
const clubOptions='<option value="all">すべての球団</option>'+Object.entries(teams).map(([key,label])=>`<option value="${key}">${label}</option>`).join('');
$('favorite-team').innerHTML=clubOptions.replace('すべての球団','未設定');$('favorite-team').value=preferences.favorite;$('leader-team').innerHTML=clubOptions;
applyTheme();syncRegion();
$('theme-options').addEventListener('click',e=>{const b=e.target.closest('[data-theme-choice]');if(!b)return;preferences.theme=b.dataset.themeChoice;applyTheme();savePreferences();});
function applyFavorite(){const code=preferences.favorite;const value=scheduleTeams[code]||'all';if([...$('team').options].some(o=>o.value===value))$('team').value=value;else $('team').value='all';if(data){paintGames();paintCalendar();paintHome();paintLeaders();paintStandings();paintRecentResults();}}
$('favorite-team').addEventListener('change',()=>{preferences.favorite=$('favorite-team').value;savePreferences();applyFavorite();});
$('settings-reset').addEventListener('click',()=>{preferences={theme:'lavender',favorite:'all',region:'13'};$('favorite-team').value='all';applyTheme();syncRegion();applyFavorite();paintDaily();savePreferences();});
$('leader-team').addEventListener('change',()=>{const club=$('leader-team').value;if(club!=='all'){leaderLeague='神巨デ広ヤ中'.includes(club)?'c':'p';$('leader-tabs').querySelectorAll('button').forEach(b=>{const chosen=b.dataset.league===leaderLeague;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});}if(data)paintLeaders();});
const stamp=s=>s?.ok&&s.fetchedAt?'取得：'+new Date(s.fetchedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+' JST':'取得できませんでした';
function paintTimes(){document.querySelectorAll('[data-time]').forEach(el=>{el.textContent=stamp(data[el.dataset.time]);});}
function paintNews(){for(const sport of ['baseball','football']){const source=data[sport+'News'];$(sport+'-news').innerHTML=source?.ok?source.data.slice(0,3).map(n=>`<a class="news-item" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer"><time>${esc(n.date)}</time><span>${esc(n.title)}</span><b aria-hidden="true">↗</b></a>`).join(''):empty('ニュースを取得できませんでした。公式サイトをご確認ください。');}}
function syncRegion(){for(const id of ['home-region','settings-region']){if(!$(id).querySelector('option'))$(id).innerHTML=Object.entries(regionNames).sort(([a],[b])=>a.localeCompare(b)).map(([key,label])=>`<option value="${key}">${label}</option>`).join('');$(id).value=preferences.region;}}
for(const id of ['home-region','settings-region'])$(id).addEventListener('change',()=>{const region=$(id).value;if(!Object.hasOwn(regionNames,region))return;preferences.region=region;syncRegion();savePreferences();paintDaily();});
let homeNewsView='national';
function showHomeNews(view){homeNewsView=view==='local'?'local':'national';for(const id of ['national','local']){$(id+'-news-section').hidden=id!==homeNewsView;}document.querySelectorAll('[data-news-view]').forEach(button=>{const chosen=button.dataset.newsView===homeNewsView;button.classList.toggle('selected',chosen);button.setAttribute('aria-pressed',String(chosen));});}
$('home-news-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-news-view]');if(button)showHomeNews(button.dataset.newsView);});
function headlineList(source){return source?.ok?(Array.isArray(source.data)?source.data:source.data.items).slice(0,3).map(n=>`<a class="news-item" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer"><time>${esc(n.date)}</time><span>${esc(n.title)}</span><b aria-hidden="true">↗</b></a>`).join(''):empty('ニュースを取得できませんでした。出典のページからご確認ください。');}
function paintDaily(){
 if(!data)return;const region=preferences.region,location=data.daily?.locations?.[region],weather=location?.weather,national=data.daily?.nationalNews,local=location?.news;
 $('weather-heading').textContent=regionNames[region]+'の天気';$('weather-source').href=weather?.source||'https://www.jma.go.jp/bosai/forecast/';
 const days=weather?.ok?weather.data.days.filter(d=>d.date>=currentDay()).slice(0,3):[];
 $('home-weather').innerHTML=days.length?days.map(d=>`<div class="weather-day"><time>${d.date===currentDay()?'今日':d.date===shiftDay(currentDay(),1)?'明日':date(d.date)}</time><span class="weather-icon" aria-hidden="true">${/雪/.test(d.weather)?'❄':/雨/.test(d.weather)?'☂':/晴/.test(d.weather)?'☀':'☁'}</span><strong>${esc(d.weather)}</strong><div class="weather-metrics"><span>最高 <b>${d.high===null?'—':esc(d.high)+'°'}</b></span><span>最低 <b>${d.low===null?'—':esc(d.low)+'°'}</b></span><span>降水 <b>${d.rain===null?'—':esc(d.rain)+'%'}</b></span></div></div>`).join(''):empty(weather?.ok?'取得済みの予報の期間が過ぎています。気象庁で最新予報をご確認ください。':'天気を取得できませんでした。気象庁の天気予報をご確認ください。');
 $('weather-note').textContent=weather?.ok?`予報区域：${weather.data.area}${weather.data.station?' ／ 気温：'+weather.data.station:''}。都道府県の代表予報区を表示します（北海道は札幌周辺、鹿児島・沖縄は本島周辺）。降水確率は掲載時間帯の最大値。未発表の気温・降水確率は「—」。現在の観測値ではありません。`:'位置情報は取得しません。表示地域はこのブラウザー内に保存します。';
 $('weather-time').textContent=weather?.ok?`出典：気象庁ホームページを整理して表示 ／ 発表：${new Date(weather.data.issuedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})}（日本時間） ／ ${stamp(weather)}`:stamp(weather);
 $('national-news').innerHTML=headlineList(national);$('national-news-time').textContent='出典：Yahoo!ニュース ／ '+stamp(national);
 $('local-news-heading').textContent=regionNames[region]+'の地域ニュース';document.querySelector('[data-news-view="local"]').textContent=regionNames[region];$('local-news').innerHTML=headlineList(local);$('local-news-source').href=local?.source||'https://news.yahoo.co.jp/';$('local-news-time').textContent=`Yahoo!ニュース${local?.ok?' ／ 配信元：'+(local.data.publisher||local.data.coverage):''} ／ ${stamp(local)}`;paintStatus();
}
let rivalsScope='near';
$('rivals-view').addEventListener('click',event=>{const button=event.target.closest('[data-rivals-scope]');if(!button)return;rivalsScope=button.dataset.rivalsScope==='all'?'all':'near';document.querySelectorAll('[data-rivals-scope]').forEach(el=>{const chosen=el.dataset.rivalsScope===rivalsScope;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen));});if(data)paintRivals();});
function paintRivals(){
 const target=$('football-rivals'),source=data.footballRivals;
 if(!data.fifa.ok){target.innerHTML=empty('FIFAランキングを取得できないため、日本より上位の国を特定できません。');$('rivals-count').textContent='';return;}
 const rows=data.fifa.data.rows,jp=rows.find(r=>r.code==='JPN'),allAbove=rows.filter(r=>r.rank<jp.rank).sort((a,b)=>a.rank-b.rank),above=rivalsScope==='all'?allAbove:allAbove.slice(-3);$('rivals-count').textContent=above.length===allAbove.length?above.length+'か国':above.length+' / '+allAbove.length+'か国';
 if(!above.length){target.innerHTML=empty('日本は1位です。日本より上位の国はありません。');return;}
 if(!source?.ok){target.innerHTML=empty('上位国の日程・結果を取得できませんでした。時間をおいて再確認してください。');return;}
 const open=new Set([...target.querySelectorAll('details[open]')].map(el=>el.dataset.rival));const first=!target.querySelector('details');
 const match=(game,country)=>{const opponent=game.home.code===country.code?game.away:game.home,rank=rows.find(r=>r.code===opponent.code),ours=game.home.code===country.code?game.homeScore:game.awayScore,theirs=game.home.code===country.code?game.awayScore:game.homeScore,scored=validScore(ours,theirs),hasPk=validScore(game.homePenalty,game.awayPenalty),penaltyOurs=game.home.code===country.code?game.homePenalty:game.awayPenalty,penaltyTheirs=game.home.code===country.code?game.awayPenalty:game.homePenalty;
  const state=game.status==='finished'?(scored?`${ours} − ${theirs} · ${hasPk?'PK '+penaltyOurs+' − '+penaltyTheirs:ours>theirs?'勝ち':ours<theirs?'負け':'引分'}`:'終了 · スコア未取得'):game.status==='inprogress'?'試合中（取得時点）':game.status==='cancelled'?'中止・延期':'予定';
  const time=game.timeKnown?new Date(game.kickoff).toLocaleTimeString('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit'}):'時刻未定';
  return `<a class="rival-match" href="${esc(game.url)}" target="_blank" rel="noopener noreferrer"><time>${date(game.date)}<small>${time}</small></time><div><b>対 ${esc(rank?name(rank):opponent.name)}</b><small>${rank?`最新 ${rank.rank}位`:'FIFA順位 未掲載'} · ${esc(game.competition)}</small></div><span class="rival-result">${esc(state)} ↗</span></a>`;
 };
 target.innerHTML=above.map((country,i)=>{const games=source.data.countries.find(c=>c.code===country.code)?.games,next=games?.ok?games.data.filter(g=>g.date>=currentDay()&&g.status!=='finished').slice(0,3):[],past=games?.ok?[...games.data].filter(g=>g.date<=currentDay()&&g.status==='finished').sort((a,b)=>b.kickoff.localeCompare(a.kickoff)).slice(0,3):[];
  return `<details class="rival-country" data-rival="${esc(country.code)}" ${open.has(country.code)||first&&i===above.length-1?'open':''}><summary><span class="rival-rank">${country.rank}<small>位</small></span><strong>${esc(name(country))}</strong><span>${number(country.points)} pts<small>日本と ${number(country.points-jp.points)} pts差</small></span></summary>${games?.ok?`<div class="rival-games"><h4>これからの試合</h4>${next.length?next.map(g=>match(g,country)).join(''):empty('取得済みの予定はありません。未発表・未収録の場合もあります。')}<h4>直近の結果</h4>${past.length?past.map(g=>match(g,country)).join(''):empty('取得済みの結果はありません。')}</div>`:empty('この国の日程・結果を取得できませんでした。')}<div class="card-foot"><a href="${esc(games?.source||source.source)}" target="_blank" rel="noopener noreferrer">ESPNの国別日程 ↗</a><span>${esc(stamp(games))}</span></div></details>`;
 }).join('');
}
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
 for(let n=1;n<=count;n++){const day=`${calendarMonth}-${String(n).padStart(2,'0')}`,games=events.filter(g=>g.date===day);out.push(`<button class="calendar-day ${day===currentDay()?'today':''} ${day===selectedDay?'chosen':''}" data-day="${day}" aria-pressed="${day===selectedDay}" aria-label="${day}、${games.length}試合"><span class="day-number">${n}</span>${games.length?`<span class="calendar-counts" aria-hidden="true">${['baseball','football'].map(sport=>{const total=games.filter(g=>g.sport===sport).length;return total?`<span class="day-count ${sport}">${sport==='baseball'?'⚾':'⚽'}${total}</span>`:'';}).join('')}${games.some(isFavorite)?'<span class="calendar-favorite">★</span>':''}</span>`:''}${games.slice(0,3).map(g=>`<span class="calendar-event ${g.sport} ${isFavorite(g)?'favorite':''}">${g.sport==='baseball'?'⚾':'⚽'} ${isFavorite(g)?'★ ':''}${esc(eventLabel(g))}</span>`).join('')}${games.length>3?`<span class="more-games">ほか${games.length-3}試合</span>`:''}</button>`);}
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
}
$('calendar').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(b){const focused=document.activeElement===b;selectedDay=b.dataset.day;paintCalendar();if(focused)$('calendar').querySelector(`[data-day="${selectedDay}"]`).focus();}});
function moveMonth(delta){const [y,m]=calendarMonth.split('-').map(Number);calendarMonth=new Date(Date.UTC(y,m-1+delta,1)).toISOString().slice(0,7);selectedDay=calendarMonth+'-01';paintCalendar();}
$('month-prev').addEventListener('click',()=>moveMonth(-1));$('month-next').addEventListener('click',()=>moveMonth(1));$('month-today').addEventListener('click',()=>{calendarMonth=currentDay().slice(0,7);selectedDay=currentDay();paintCalendar();});
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
const draftCategories=[{id:'avg',label:'打率',type:'bat',decimals:3,rate:true},{id:'hr',label:'本塁打',type:'bat',unit:'本'},{id:'h',label:'安打',type:'bat',unit:'安打'},{id:'rbi',label:'打点',type:'bat',unit:'点'},{id:'w',label:'勝利',type:'pit',unit:'勝'},{id:'era',label:'防御率',type:'pit',decimals:2,rate:true,low:true},{id:'sv',label:'セーブ',type:'pit',unit:'S'}];
let draftYear=null,selectedDraftYear=null,draftState,draftCategory='avg';const draftSearches=new Map();
const draftSearchKey=(army,round)=>`${draftCategory}-${army}-${round}`;
const normalizePlayerSearch=value=>value.normalize('NFKC').replace(/\s/g,'').toLowerCase();
const draftPickKey=(pick,year=draftYear)=>Number(year)>=2027?normalizePlayerSearch(pick.name):pick.team+'|'+normalizePlayerSearch(pick.name);
function draftOtherPicks(category,exclude){return (draftYear>=2027?Object.values(draftState.picks).flat(2):draftState.picks[category].flat()).filter(p=>p?.name&&p!==exclude);}
function draftPickUsed(pick,category,exclude){return draftOtherPicks(category,exclude).some(p=>draftPickKey(p)===draftPickKey(pick));}
function draftDuplicateNames(state,year){const used=new Set(),duplicates=new Set();for(const [category,armies] of Object.entries(state.picks))for(const pick of armies.flat())if(pick?.name){const key=(Number(year)>=2027?'':category+'|')+draftPickKey(pick,year);if(used.has(key))duplicates.add(pick.name);used.add(key);}return [...duplicates];}
const historyViews=new WeakMap();
function validDraftTeam(team,name,category,year){return Object.hasOwn(teams,team)||(Number(year)===2026&&category==='era'&&team==='MLB'&&(name===''||name==='今井 達也'));}
function draftTeamEntries(cat){return [...Object.entries(teams),...(draftYear===2026&&cat.id==='era'?[['MLB','特別枠（MLB）']]:[])];}
function historyView(snapshot,year){
 if(historyViews.has(snapshot))return historyViews.get(snapshot);const clubs={},leaders={avg:{c:{ok:true,data:[]},p:{ok:true,data:[]}},era:{c:{ok:true,data:[]},p:{ok:true,data:[]}}};
 for(const row of snapshot.rows){const [team,name]=row,league='神巨デ広ヤ中'.includes(team)?'c':'p',source=`https://npb.jp/bis/${year}/stats/`;(clubs[team]??={bat:{ok:true,data:[],source,fetchedAt:snapshot.generatedAt},pit:{ok:true,data:[],source,fetchedAt:snapshot.generatedAt}});const values=Object.fromEntries(['avg','hr','h','rbi','w','era','sv'].map((id,i)=>[id,row[i+2]]));if(['avg','hr','h','rbi'].some(id=>values[id]!==null))clubs[team].bat.data.push({team,name,values});if(['w','era','sv'].some(id=>values[id]!==null))clubs[team].pit.data.push({team,name,values});if(row[9])leaders.avg[league].data.push({team,name,value:values.avg});if(row[10])leaders.era[league].data.push({team,name,value:values.era});}
 const view={year,available:true,draft:{clubs,seasonComplete:snapshot.seasonComplete},leaders};historyViews.set(snapshot,view);return view;
}
function draftDataForYear(){if(draftYear===data.year)return data;const season=data.draftHistory?.seasons?.[draftYear],snapshot=season?.months?.[season.latestMonth];return snapshot?historyView(snapshot,draftYear):{year:draftYear,available:false,draft:{clubs:{},seasonComplete:false},leaders:{}};}
function draftRoster(cat,team){if(draftYear===2026&&cat.id==='era'&&team==='MLB')return {ok:true,data:[{team:'MLB',name:'今井 達也',values:{era:null}}]};const stats=draftDataForYear();return stats.draft?.clubs?.[team]?.[cat.type]||(draftYear>data.year?data.draft?.clubs?.[team]?.[cat.type]:null);}
function paintDraftYears(){const years=new Set([2026,2027,2028,data.year,draftYear]);for(let year=2026;year<=data.year+2;year++)years.add(year);for(const year of Object.keys(data.draftHistory?.seasons||{}))years.add(Number(year));try{for(let i=0;i<window.localStorage.length;i++){const match=window.localStorage.key(i)?.match(/^sports-desk-draft-v1-(\d{4})$/);if(match)years.add(Number(match[1]));}}catch{}$('draft-year-select').innerHTML=[...years].filter(year=>year>=2026&&year<=2200).sort((a,b)=>a-b).map(year=>`<option value="${year}" ${year===draftYear?'selected':''}>${year}年度</option>`).join('');$('draft-year-select').value=String(draftYear);}
$('draft-year-select').addEventListener('change',()=>{const year=Number($('draft-year-select').value);if(!Number.isInteger(year)||year<2026||year>2200)return;selectedDraftYear=year;draftSearches.clear();paintDraft();$('draft-save-status').textContent=`${year}年度の指名を表示しています。年度ごとに別々に保存します。`;});
function emptyDraft(){return {names:['A軍','B軍'],picks:Object.fromEntries(draftCategories.map(cat=>[cat.id,[Array(5).fill(null),Array(5).fill(null)]]))};}
function loadDraft(){const year=selectedDraftYear??data.year;if(draftYear===year)return;draftYear=year;draftState=emptyDraft();try{const saved=JSON.parse(window.localStorage.getItem('sports-desk-draft-v1-'+draftYear)||'null');if(saved){for(let army=0;army<2;army++){if(typeof saved.names?.[army]==='string'&&saved.names[army].trim())draftState.names[army]=saved.names[army].slice(0,24);for(const cat of draftCategories){const used=new Set(draftState.picks[cat.id].flat().filter(p=>p?.name).map(p=>p.team+'|'+p.name));for(let round=0;round<5;round++){const pick=saved.picks?.[cat.id]?.[army]?.[round];if(pick&&validDraftTeam(pick.team,pick.name,cat.id,draftYear)&&typeof pick.name==='string'&&pick.name.length<=80&&(!pick.name||!used.has(pick.team+'|'+pick.name))){draftState.picks[cat.id][army][round]={team:pick.team,name:pick.name};if(pick.name)used.add(pick.team+'|'+pick.name);}}}}}}catch{} }
function saveDraft(){try{window.localStorage.setItem('sports-desk-draft-v1-'+draftYear,JSON.stringify(draftState));$('draft-save-status').textContent='保存しました。このブラウザーで次回も反映します。設定のJSON保存・読み込みで別ブラウザーに引き継げます。';}catch{$('draft-save-status').textContent='ブラウザーに保存できませんでした。指名はこの画面を開いている間だけ反映します。';}}
function draftValue(cat,pick,stats=draftDataForYear()){
 if(!pick?.name)return {status:'未選択'};if(draftYear>=2027&&draftPickUsed(pick,cat.id,pick))return {status:'重複指名'};if(draftYear===2026&&cat.id==='era'&&pick.team==='MLB'&&pick.name==='今井 達也')return {status:'計測不可',excluded:true};if(stats.available===false)return {status:'年度成績未公開'};const source=stats.draft?.clubs?.[pick.team]?.[cat.type];if(!source?.ok)return {status:'取得失敗'};
 const player=source.data.find(p=>p.name===pick.name);if(!player)return {status:'掲載なし'};
 if(cat.rate){const league='神巨デ広ヤ中'.includes(pick.team)?'c':'p',qualified=stats.leaders?.[cat.id]?.[league];if(!qualified?.ok)return {status:'規定確認失敗'};const normalize=s=>s.replace(/\s/g,'');if(!qualified.data.some(p=>p.team===pick.team&&normalize(p.name)===normalize(pick.name)))return {status:'規定未達',excluded:true};}
 const raw=player.values[cat.id];if(raw===null||raw===undefined||raw===''||!Number.isFinite(Number(raw))||Number(raw)<0)return {status:'成績不明'};return {value:Number(raw),status:'ok'};
}
function draftTotal(cat,army,stats=draftDataForYear()){const picks=draftState.picks[cat.id][army],values=picks.map(p=>draftValue(cat,p,stats));const included=values.filter(v=>v.status==='ok'),missing=values.some(v=>v.status!=='ok'&&!v.excluded);const total=included.reduce((sum,v)=>sum+Math.round(v.value*(cat.rate?10**cat.decimals:1)),0)/(cat.rate?10**cat.decimals:1);return {value:included.length?(cat.rate?total/included.length:total):null,count:included.length,selected:picks.filter(p=>p?.name).length,ready:!missing&&included.length>0};}
function draftNumber(cat,value){return value===null?'—':cat.rate?value.toFixed(cat.decimals):String(value);}
function draftDecision(cat,a,b){if(!a.ready||!b.ready)return -1;if(Math.abs(a.value-b.value)<1e-9)return 2;return (cat.low?a.value<b.value:a.value>b.value)?0:1;}
function draftPlayerOptions(cat,army,round,query=''){
 const pick=draftState.picks[cat.id][army][round],source=draftRoster(cat,pick?.team),pool=source?.ok?source.data:[],other=draftOtherPicks(cat.id,pick),needle=normalizePlayerSearch(query);
 const matches=pool.filter(p=>normalizePlayerSearch(p.name).includes(needle));
 const visible=pool.filter(p=>matches.includes(p)||p.name===pick?.name);
 const html=`<option value="">${!pick?.team?'球団を先に選択':!source?.ok?'成績を取得できません':matches.length?'選手を選択':'一致する選手なし'}</option>${pick?.name&&!pool.some(p=>p.name===pick.name)?`<option value="${esc(pick.name)}" selected>${esc(pick.name)}（掲載なし）</option>`:''}${visible.map(p=>{const used=other.some(o=>draftPickKey(o)===draftPickKey(p));return `<option value="${esc(p.name)}" ${p.name===pick?.name?'selected':''} ${used?'disabled':''}>${esc(p.name)}${used?'（指名済み）':!matches.includes(p)?'（選択中）':''}</option>`;}).join('')}`;
 return {html,count:matches.length,enabled:!!pick?.team&&!!source?.ok};
}
function paintDraft(){
 if(!data)return;const draftFocus=document.activeElement?.closest?.('[data-draft-field]');const focusSlot=draftFocus?{field:draftFocus.dataset.draftField,army:draftFocus.dataset.army,round:draftFocus.dataset.round}:null;loadDraft();paintDraftYears();const draftData=draftDataForYear();$('draft-year').textContent=draftYear+'年';$('draft-season').textContent=draftData.draft?.seasonComplete?'公式戦 全日程終了':draftData.available===false?'年度成績 未公開':'シーズン途中・取得時点';$('draft-year-note').textContent=draftYear>data.year?`${draftYear}年の成績はまだありません。${data.year}年掲載の選手で仮指名でき、対象年度の成績公開後に自動で集計します。`:draftYear<data.year?'保存された対象年度の成績で集計します。':'この年度の公開成績を自動で反映します。';
 const duplicates=draftYear>=2027?draftDuplicateNames(draftState,draftYear):[];$('draft-duplicate-warning').hidden=duplicates.length===0;$('draft-duplicate-warning').textContent=duplicates.length?`保存済みの指名に重複があります：${duplicates.join('、')}。重複した枠を選び直してください。修正するまで該当部門は判定待ちになります。保存済みの選手を自動で削除することはありません。`:'';$('draft-duplicate-rule').textContent=draftYear>=2027?'2027年度以降：両軍・全部門で同じ選手を指名できません。':'2026年度：同じ部門内は両軍を通して重複不可。別部門では指名できます。';
 ['a','b'].forEach((army,i)=>{if(document.activeElement!==$('draft-name-'+army))$('draft-name-'+army).value=draftState.names[i];});
 let wins=[0,0],pending=0,ties=0;
 const overview=draftCategories.map(cat=>{const a=draftTotal(cat,0),b=draftTotal(cat,1),winner=draftDecision(cat,a,b);if(winner===-1)pending++;else if(winner===2)ties++;else wins[winner]++;return `<tr><th scope="row"><button data-draft-category="${cat.id}">${esc(cat.label)} →</button></th>${[a,b].map((total,i)=>`<td class="${winner===i?'draft-winning':''}"><strong>${draftNumber(cat,total.value)}</strong><small>${cat.rate?`規定対象 ${total.count}人`:`選択 ${total.selected}/5人`}${!total.ready?' · 集計途中':''}</small></td>`).join('')}<td>${winner===-1?'判定待ち':winner===2?'引き分け':esc(draftState.names[winner])+' 優勢'}</td></tr>`;}).join('');
 $('draft-overview').innerHTML=`<table class="draft-overview-table"><thead><tr><th>部門</th><th>${esc(draftState.names[0])}</th><th>${esc(draftState.names[1])}</th><th>比較</th></tr></thead><tbody>${overview}</tbody></table>`;
 $('draft-score').textContent=`${draftState.names[0]} ${wins[0]}勝 ／ ${draftState.names[1]} ${wins[1]}勝 · 引分 ${ties} · 待ち ${pending}${draftData.draft?.seasonComplete&&pending===0?' · 最終比較':' · 暫定比較'}${pending===0?' ／ '+(wins[0]===wins[1]?'総合引き分け':draftState.names[wins[0]>wins[1]?0:1]+(draftData.draft?.seasonComplete?'の総合勝利':'が総合優勢')):' ／ 総合は判定待ち'}`;
 const cat=draftCategories.find(c=>c.id===draftCategory);$('draft-editor-title').textContent=cat.label+'の部 · 第1巡〜第5巡';$('draft-rule').textContent=cat.rate?`${cat.label}は規定対象者の平均。規定未達は「—」として平均から除外します。`:`${cat.label}は選んだ5人の合計。各軍の球団・選手を選択してください。`;
 $('draft-categories').innerHTML=draftCategories.map(c=>`<button data-draft-category="${c.id}" aria-pressed="${c.id===draftCategory}" class="${c.id===draftCategory?'selected':''}">${esc(c.label)}</button>`).join('');
 const existingRows=[...$('draft-picks').querySelectorAll('details[data-draft-editor]')],sameCategory=existingRows.some(row=>row.dataset.category===cat.id&&row.dataset.year===String(draftYear)),expanded=new Set(existingRows.filter(row=>row.hasAttribute('open')).map(row=>row.dataset.draftEditor));
 $('draft-picks').innerHTML=[0,1].map(army=>`<section class="draft-army draft-army-${army}" aria-label="${esc(draftState.names[army])}"><h4>${esc(draftState.names[army])}</h4>${draftState.picks[cat.id][army].map((pick,round)=>{const value=draftValue(cat,pick),query=draftSearches.get(draftSearchKey(army,round))||'',picker=draftPlayerOptions(cat,army,round,query);return `<details class="draft-round" data-draft-editor="${army}-${round}" data-category="${cat.id}" data-year="${draftYear}" ${sameCategory?expanded.has(army+'-'+round)?'open':'':army===0&&round===0?'open':''}><summary><span class="draft-round-label">第${round+1}巡</span><span class="draft-summary-name">${pick?.name?esc(pick.name):'未指名'}<small>${pick?.team?esc(teams[pick.team]||'特別枠（MLB）'):'タップして選手を選択'}</small></span><span class="draft-summary-value">${value.status==='ok'?draftNumber(cat,value.value):'—'}<small>${value.status==='ok'?(cat.unit||'現在の成績'):value.status}</small></span></summary><div class="draft-round-editor"><label>球団<select data-draft-field="team" data-army="${army}" data-round="${round}" aria-label="${esc(draftState.names[army])} 第${round+1}巡 球団"><option value="">球団を選択</option>${draftTeamEntries(cat).map(([code,label])=>`<option value="${code}" ${pick?.team===code?'selected':''}>${esc(label)}</option>`).join('')}</select></label><div class="draft-player-picker"><label>選手名を検索<input type="search" data-draft-search data-army="${army}" data-round="${round}" value="${esc(query)}" placeholder="名前の一部を入力" maxlength="80" aria-label="${esc(draftState.names[army])} 第${round+1}巡 選手名を検索" aria-controls="draft-player-${army}-${round}" ${picker.enabled?'':'disabled'}></label><label>選手<select id="draft-player-${army}-${round}" data-draft-field="name" data-army="${army}" data-round="${round}" aria-label="${esc(draftState.names[army])} 第${round+1}巡 選手" ${picker.enabled?'':'disabled'}>${picker.html}</select></label><small class="draft-search-count" data-search-count="${army}-${round}" role="status">${picker.enabled?`候補 ${picker.count}人`:''}</small></div><div class="draft-current"><span>現在の成績</span><b>${value.status==='ok'?draftNumber(cat,value.value):'—'}</b><small>${value.status==='ok'?(cat.unit||''):value.status}</small></div></div></details>`;}).join('')}<div class="draft-army-total">${cat.rate?'平均':'合計'} <strong>${draftNumber(cat,draftTotal(cat,army).value)}</strong> ${esc(cat.unit||'')}</div></section>`).join('');
 // Setting explicit values also preserves selections in DOM-only verification tools.
 $('draft-picks').querySelectorAll('select').forEach(el=>{el.value=draftState.picks[cat.id][Number(el.dataset.army)][Number(el.dataset.round)]?.[el.dataset.draftField]||'';});
 $('draft-sources').innerHTML=Object.entries(draftData.draft?.clubs||{}).map(([team,club])=>`<p class="source-time">${esc(teams[team])} · <a href="${esc(club.bat.source)}" target="_blank" rel="noopener noreferrer">打撃</a> ${esc(stamp(club.bat))} ／ <a href="${esc(club.pit.source)}" target="_blank" rel="noopener noreferrer">投手</a> ${esc(stamp(club.pit))}</p>`).join('');
 paintDraftMonths(cat);
 if(focusSlot)$('draft-picks').querySelector(`[data-army="${focusSlot.army}"][data-round="${focusSlot.round}"][data-draft-field="${focusSlot.field}"]`)?.focus();
}
$('draft').addEventListener('click',event=>{const button=event.target.closest('[data-draft-category]');if(!button||!data)return;draftCategory=button.dataset.draftCategory;const overview=!!button.closest('#draft-overview');paintDraft();const active=$('draft-categories').querySelector(`[data-draft-category="${draftCategory}"]`);active.focus();if(overview)$('draft-editor-title').scrollIntoView?.({behavior:'smooth',block:'start'});});
$('draft-picks').addEventListener('input',event=>{const input=event.target.closest('[data-draft-search]');if(!input||!data)return;const army=Number(input.dataset.army),round=Number(input.dataset.round),query=input.value.slice(0,80),cat=draftCategories.find(c=>c.id===draftCategory);draftSearches.set(draftSearchKey(army,round),query);const result=draftPlayerOptions(cat,army,round,query),select=$(`draft-player-${army}-${round}`);select.innerHTML=result.html;select.value=draftState.picks[cat.id][army][round]?.name||'';$('draft-picks').querySelector(`[data-search-count="${army}-${round}"]`).textContent=`検索結果 ${result.count}人${result.count===0?' · 選択中の選手は保持します':''}`;});
$('draft-picks').addEventListener('change',event=>{const el=event.target.closest('[data-draft-field]');if(!el||!data)return;const army=Number(el.dataset.army),round=Number(el.dataset.round),field=el.dataset.draftField,slots=draftState.picks[draftCategory];if(field==='team'){draftSearches.delete(draftSearchKey(army,round));if(el.value&&!validDraftTeam(el.value,'',draftCategory,draftYear))return;slots[army][round]=el.value?{team:el.value,name:''}:null;}else{const pick=slots[army][round];if(!pick)return;const cat=draftCategories.find(c=>c.id===draftCategory),source=draftRoster(cat,pick.team);if(el.value&&(!source?.ok||!source.data.some(p=>p.name===el.value)||draftPickUsed({team:pick.team,name:el.value},draftCategory,pick))){$('draft-save-status').textContent=(draftYear>=2027?'全部門・両軍を通して指名済みの選手、または取得できない選手は選べません。':'同じ部門の指名済み選手、または取得できない選手は選べません。');paintDraft();return;}pick.name=el.value;}saveDraft();paintDraft();$('draft-picks').querySelector(`[data-army="${army}"][data-round="${round}"][data-draft-field="${field}"]`).focus();});
['a','b'].forEach((army,i)=>$('draft-name-'+army).addEventListener('change',()=>{if(!data)return;draftState.names[i]=$('draft-name-'+army).value.trim().slice(0,24)||(i===0?'A軍':'B軍');saveDraft();paintDraft();}));

function paintDraftMonths(cat){
 $('draft-month-title').textContent=`${draftYear}年 ${cat.label}の月ごとの推移`;
 const season=data.draftHistory?.seasons?.[draftYear];let previous=null;const rows=[];
 for(let month=1;month<=12;month++){const key=`${draftYear}-${String(month).padStart(2,'0')}`,snapshot=season?.months?.[key];if(!snapshot){rows.push(`<tr><th scope="row">${month}月</th><td colspan="5">未記録</td></tr>`);previous=null;continue;}const stats=historyView(snapshot,draftYear),totals=[0,1].map(army=>draftTotal(cat,army,stats));const delta=(total,army)=>{const prior=previous?.[army];if(!prior?.ready||!total.ready)return '—';const diff=total.value-prior.value;return (diff>0?'+':'')+diff.toFixed(cat.decimals||0)+(cat.unit?' '+cat.unit:'');};rows.push(`<tr><th scope="row">${month}月<small>${esc(new Date(snapshot.generatedAt).toLocaleDateString('ja-JP',{timeZone:'Asia/Tokyo'}))}時点</small></th>${totals.map((total,army)=>`<td>${draftNumber(cat,total.value)}<small>${total.ready?(cat.rate?`規定 ${total.count}人`:'集計済み'):'集計途中'}</small></td><td>${delta(total,army)}</td>`).join('')}<td>${draftDecision(cat,...totals)===-1?'判定待ち':draftDecision(cat,...totals)===2?'引き分け':esc(draftState.names[draftDecision(cat,...totals)])+' 優勢'}</td></tr>`);previous=totals;}
 $('draft-monthly').innerHTML=`<table class="draft-month-table"><thead><tr><th>保存月</th><th>${esc(draftState.names[0])}</th><th>前月差</th><th>${esc(draftState.names[1])}</th><th>前月差</th><th>比較</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}
const backupFormat='japan-sports-desk-backup',backupMaxBytes=1024*1024;let pendingBackup=null,backupReadId=0;
const plainRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function backupKeys(value,allowed){if(!plainRecord(value)||Object.keys(value).some(key=>!allowed.includes(key)))throw Error('対応していない項目が含まれています。');}
function validateDraftBackup(value,year,{allowConflicts=false}={}){
 backupKeys(value,['names','picks']);if(!Array.isArray(value.names)||value.names.length!==2||value.names.some(name=>typeof name!=='string'||!name.trim()||name.length>24||/[\u0000-\u001f]/.test(name)))throw Error('軍名の形式が正しくありません。');
 backupKeys(value.picks,draftCategories.map(cat=>cat.id));const picks={},seasonUsed=new Set();
 for(const cat of draftCategories){const armies=value.picks[cat.id];if(!Array.isArray(armies)||armies.length!==2||armies.some(slots=>!Array.isArray(slots)||slots.length!==5))throw Error('指名枠は各部門・各軍5人にしてください。');const used=Number(year)>=2027?seasonUsed:new Set();picks[cat.id]=armies.map(slots=>slots.map(pick=>{if(pick===null)return null;backupKeys(pick,['team','name']);if(!validDraftTeam(pick.team,pick.name,cat.id,year)||typeof pick.name!=='string'||pick.name.length>80||/[\u0000-\u001f]/.test(pick.name))throw Error('球団・選手の形式が正しくありません。');const key=draftPickKey(pick,year);if(pick.name&&used.has(key)&&!allowConflicts)throw Error(Number(year)>=2027?'2027年度以降は両軍・全部門を通して重複指名できません。':'同じ部門に重複指名があります。');if(pick.name)used.add(key);return {team:pick.team,name:pick.name};}));}
 return {names:value.names.map(name=>name.trim()),picks};
}
function validateBackup(value,{allowConflicts=false}={}){
 backupKeys(value,['format','version','exportedAt','preferences','menuCollapsed','drafts']);if(value.format!==backupFormat||value.version!==1)throw Error('Daily Deskの対応したJSONファイルを選んでください。');if(typeof value.exportedAt!=='string'||value.exportedAt.length>40||!Number.isFinite(Date.parse(value.exportedAt)))throw Error('保存日時の形式が正しくありません。');
 const prefs=value.preferences;backupKeys(prefs,['theme','favorite','fontSize','region']);if(!Object.hasOwn(themes,prefs.theme)||!(prefs.favorite==='all'||Object.hasOwn(teams,prefs.favorite))||(prefs.fontSize!==undefined&&!['small','standard','large'].includes(prefs.fontSize))||(prefs.region!==undefined&&!Object.hasOwn(regionNames,prefs.region))||typeof value.menuCollapsed!=='boolean')throw Error('設定の形式が正しくありません。');
 if(!plainRecord(value.drafts)||Object.keys(value.drafts).length>50)throw Error('年度データの形式・件数が正しくありません。');const drafts={};for(const [year,draft] of Object.entries(value.drafts)){if(!/^\d{4}$/.test(year)||Number(year)<1900||Number(year)>2200)throw Error('年度の形式が正しくありません。');drafts[year]=validateDraftBackup(draft,Number(year),{allowConflicts});}
 return {format:backupFormat,version:1,exportedAt:value.exportedAt,preferences:{theme:prefs.theme,favorite:prefs.favorite,region:prefs.region||'13'},menuCollapsed:value.menuCollapsed,drafts};
}
function collectBackup(){
 const drafts={};for(let i=0;i<window.localStorage.length;i++){const key=window.localStorage.key(i),match=key?.match(/^sports-desk-draft-v1-(\d{4})$/);if(match)drafts[match[1]]=validateDraftBackup(JSON.parse(window.localStorage.getItem(key)),Number(match[1]),{allowConflicts:true});}
 if(draftYear!==null&&draftState)drafts[String(draftYear)]=validateDraftBackup(draftState,draftYear,{allowConflicts:true});
 return validateBackup({format:backupFormat,version:1,exportedAt:new Date().toISOString(),preferences:{...preferences},menuCollapsed,drafts},{allowConflicts:true});
}
$('backup-export').addEventListener('click',()=>{let url;try{const backup=collectBackup(),body=JSON.stringify(backup,null,2);if(new Blob([body]).size>backupMaxBytes)throw Error('保存データが1MBを超えています。');url=URL.createObjectURL(new Blob([body],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=`sports-desk-backup-${currentDay()}.json`;document.body.append(link);link.click();link.remove();$('backup-status').textContent=Object.entries(backup.drafts).some(([year,state])=>Number(year)>=2027&&draftDuplicateNames(state,year).length)?'JSONファイルを保存しました。2027年度以降の重複指名が含まれます。別ブラウザーへ読み込む前に指名を修正して再保存してください。':'JSONファイルを保存しました。別ブラウザーの設定から読み込めます。';}catch(error){$('backup-status').textContent='JSONを保存できませんでした。'+error.message;}finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);}});
function cancelBackup(){backupReadId++;pendingBackup=null;$('backup-preview').hidden=true;$('backup-file').value='';$('backup-preview-text').textContent='';}
$('backup-cancel').addEventListener('click',()=>{cancelBackup();$('backup-status').textContent='読み込みをキャンセルしました。現在のデータは変更していません。';});
$('backup-file').addEventListener('change',async()=>{const file=$('backup-file').files?.[0];cancelBackup();if(!file)return;const readId=backupReadId;$('backup-status').textContent='JSONファイルを確認しています…';try{if(file.size>backupMaxBytes)throw Error('1MB以下のファイルを選んでください。');const text=await file.text();if(readId!==backupReadId)return;if(text.length>backupMaxBytes)throw Error('1MB以下のファイルを選んでください。');const backup=validateBackup(JSON.parse(text.replace(/^\uFEFF/,'')));pendingBackup=backup;const lines=Object.entries(backup.drafts).sort(([a],[b])=>b.localeCompare(a)).map(([year,draft])=>`${year}年：${draft.names.join(' ／ ')} · ${Object.values(draft.picks).flat(2).filter(p=>p?.name).length}枠を指名`);$('backup-preview-text').textContent=`保存日時：${new Date(backup.exportedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})}（日本時間）\nテーマ：${themes[backup.preferences.theme]} ／ 応援球団：${teams[backup.preferences.favorite]||'未設定'} ／ 表示地域：${regionNames[backup.preferences.region]}\n${lines.length?lines.join('\n'):'野球集計の年度データなし'}\nこの設定と、上記年度の軍名・指名を上書きします。含まれない年度は残ります。`;$('backup-preview').hidden=false;$('backup-status').textContent='内容を確認して「この内容を読み込む」を押してください。まだ反映していません。';}catch(error){if(readId===backupReadId){pendingBackup=null;$('backup-preview').hidden=true;$('backup-status').textContent='JSONを読み込めませんでした。'+(error instanceof SyntaxError?'JSONの形式が正しくありません。':error.message);}}});
function applyBackup(backup){
 const updates=[[settingsKey,JSON.stringify(backup.preferences)],[menuKey,String(backup.menuCollapsed)],...Object.entries(backup.drafts).map(([year,draft])=>['sports-desk-draft-v1-'+year,JSON.stringify(draft)])];
 const previous=updates.map(([key])=>[key,window.localStorage.getItem(key)]),written=[];
 try{for(const [key,value] of updates){window.localStorage.setItem(key,value);written.push(key);}}catch(error){let restored=true;for(const [key,value] of previous.filter(([key])=>written.includes(key))){try{if(value===null)window.localStorage.removeItem(key);else window.localStorage.setItem(key,value);}catch{restored=false;}}throw Error(restored?'ブラウザーへ保存できませんでした。現在のデータは変更していません。':'保存と元データの復元に失敗しました。JSONを保管し、ブラウザーの保存設定を確認してください。');}
 preferences={...backup.preferences};menuCollapsed=backup.menuCollapsed;$('favorite-team').value=preferences.favorite;applyTheme();syncRegion();applyMenu();applyFavorite();paintDaily();draftYear=null;draftSearches.clear();if(data)paintDraft();
}
$('backup-apply').addEventListener('click',()=>{if(!pendingBackup)return;try{applyBackup(pendingBackup);cancelBackup();$('backup-status').textContent='JSONを読み込み、設定・指名を反映しました。成績は公開データで自動集計します。';$('settings-status').textContent='読み込んだ設定をこのブラウザーに保存しました。';}catch(error){$('backup-status').textContent='読み込みに失敗しました。'+error.message;}});

function paintStatus(){if(!data)return;
 const failed=[...Object.values(data.draft?.clubs||{}).flatMap(club=>[club.bat,club.pit]),data.standings,data.baseballGames,data.footballGames,data.fifa,...[data.baseballNews,data.footballNews,data.baseballResults,data.footballHistory,data.daily?.nationalNews,data.daily?.locations?.[preferences.region]?.weather,data.daily?.locations?.[preferences.region]?.news,data.footballRivals,...(data.footballRivals?.ok?data.footballRivals.data.countries.map(c=>c.games):[])].filter(Boolean),...Object.values(data.leaders).flatMap(x=>[x.c,x.p])].filter(s=>!s.ok).length;
 const stale=Date.now()-Date.parse(data.generatedAt)>7200000;
 $('status').classList.toggle('error',!!failed||stale);$('status').textContent=failed?`一部のデータを取得できませんでした（${failed}件）。各欄の出典をご確認ください。`:stale?'最終取得から2時間以上経過しています。自動更新が遅れています。「データを再確認」で公開済みの最新データを読み直せます。':'公開情報から取得 · 30分ごとに自動更新予定 · 試合速報ではありません';
}
let loading=false,dataInitialized=false;async function refresh(){
 if(loading)return;loading=true;$('refresh').disabled=true;$('status').textContent='公開済みのデータを確認しています…';
 try{const response=await fetch('./data/sports.json?t='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('データ取得エラー');data=await response.json();
 $('today').textContent=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).format(new Date());
 $('season').textContent=data.year;
 const teamBefore=$('team').value;$('team').innerHTML='<option value="all">すべてのチーム</option>'+Object.entries(scheduleTeams).map(([key,t])=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');$('team').value=[...$('team').options].some(o=>o.value===teamBefore)?teamBefore:'all';if(!dataInitialized){applyFavorite();dataInitialized=true;}
 $('categories').innerHTML=data.categories.map(c=>`<button data-category="${c.id}" class="${category===c.id?'selected':''}" aria-pressed="${category===c.id}">${esc(c.label)}</button>`).join('');
 paintStandings();paintGames();paintLeaders();paintFootball();paintFifa();paintCalendar();paintHome();paintNews();paintTimes();paintComparisonTime();paintRecentResults();paintOpponentProfile();paintDraft();paintDaily();paintRivals();
 paintStatus();const generated=new Date(data.generatedAt);
 $('fetched-at').textContent='データ生成日時：'+generated.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+'（日本時間）';$('data-updated').textContent='データ取得・集計完了：'+generated.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+'（日本時間）';
 }catch{$('status').classList.add('error');$('status').textContent=data?'更新に失敗しました。表示中は前回取得のデータです。出典をご確認ください。':'データを取得できませんでした。「データを再確認」から再試行してください。';if(!data)for(const id of ['standings','baseball-games','leaders','football-game','fifa-summary','roadmap','today-games','week-games','baseball-results','football-result','opponent-profile'])$(id).innerHTML=empty();}
 finally{loading=false;$('refresh').disabled=false;}
}
$('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$('categories').querySelectorAll('button').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));});paintLeaders();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
$('refresh').addEventListener('click',refresh);setInterval(()=>{if(!document.hidden)refresh();},900000);refresh();

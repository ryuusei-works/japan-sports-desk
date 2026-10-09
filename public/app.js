let data, standingsLeague='c', leaderLeague='c', category='avg';
const $=id=>document.getElementById(id);
const panels={home:{title:'今日のスポーツを、ひと目で。',description:'野球と日本代表の試合を、ひとつのカレンダーに。',label:'ホーム'},settings:{title:'あなた好みの、観戦スペース。',description:'好きな色と応援球団で、毎日のチェックをもっと楽しく。',label:'設定'},guide:{title:'Sports Deskの使い方。',description:'知りたい情報へ、迷わず。はじめての方はこちらから。',label:'使い方・更新について'},baseball:{title:'野球を、もっと楽しもう。',description:'次の一戦も、タイトルの行方も。プロ野球の今をひと目で。',label:'野球'},football:{title:'日本代表の、次の一歩を。',description:'次の代表戦と世界の順位。SAMURAI BLUEを、もっと身近に。',label:'サッカー日本代表'}};
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
 $('standings').innerHTML=`<table><thead><tr><th>順位</th><th>チーム</th><th>試合</th><th>勝</th><th>敗</th><th>分</th><th>勝率</th><th>差</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td class="team-cell"><span class="team-line"></span>${esc(r.team)}</td><td>${esc(r.games)}</td><td>${esc(r.wins)}</td><td>${esc(r.losses)}</td><td>${esc(r.draws)}</td><td>${esc(r.pct)}</td><td>${esc(r.gap)}</td></tr>`).join('')}</tbody></table>`;
 document.querySelectorAll('.team-line').forEach((el,i)=>el.setAttribute('data-color',i%6));
}
function paintGames(){
 setSource('baseball-source',data.baseballGames.source);
 if(!data.baseballGames.ok){$('baseball-games').innerHTML=empty();return;}
 let games=data.baseballGames.data.filter(g=>g.date>=currentDay()&&g.status==='scheduled');const filter=$('team').value;if(filter!=='all')games=games.filter(g=>g.home===filter||g.away===filter);games=games.slice(0,36);
 $('baseball-games').innerHTML=games.length?games.map(g=>`<div class="game"><div class="game-meta"><span>${date(g.date)}</span><b>${esc(g.time)||'開始時間未定'}</b></div><div class="matchup"><span class="team-mark">${esc(g.home.slice(0,1))}</span>${esc(g.home)}<span class="vs">VS</span>${esc(g.away)}<span class="team-mark">${esc(g.away.slice(0,1))}</span></div><div class="game-venue">${esc(g.venue)}</div></div>`).join(''):empty(filter==='all'?'直近3か月に発表済みの試合はありません。公式日程をご確認ください。':'直近の発表済み日程に、このチームの試合はありません。');
}
function ranked(rows,low){let prev,rank=0;return [...rows].sort((a,b)=>low?Number(a.value)-Number(b.value):Number(b.value)-Number(a.value)).map((r,i)=>{if(Number(r.value)!==prev)rank=i+1;prev=Number(r.value);return {...r,rank};}).filter(r=>r.rank<=10);}
function paintLeaders(){
 const club=$('leader-team').value;const effective=club!=='all'?('神巨デ広ヤ中'.includes(club)?'c':'p'):leaderLeague;const cat=data.categories.find(c=>c.id===category);const sources=effective==='all'?[data.leaders[category].c,data.leaders[category].p]:[data.leaders[category][effective]];
 $('leader-source').innerHTML=sources.map((s,i)=>`<a target="_blank" rel="noopener noreferrer" href="${esc(s.source)}">${effective==='all'?(i?'パ':'セ')+'・リーグ出典':'NPB公式出典'} ↗</a>`).join('　');
 $('leader-time').textContent=sources.map(s=>stamp(s)).join(' / ');
 $('leader-note').textContent=[club!=='all'?'球団内の独自順位（公式タイトルではありません）':leaderLeague==='all'?'セパ総合・独自集計':'リーグ順位',cat.note||'NPB公式成績',club==='all'&&effective==='all'?'セパ総合は独自集計（公式タイトルではありません）':'同順位は同じ順位で表示'].join(' · ');
 if(sources.some(s=>!s.ok)){$('leaders').innerHTML=empty();$('leader-spotlight').innerHTML=empty('ランキングを確認できません');return;}
 const rows=ranked(sources.flatMap(s=>s.data).filter(r=>club==='all'||r.team===club),cat.low);const top=rows[0];if(!top){$('leaders').innerHTML=empty('この球団にランキング対象者はいません。規定条件はリーグ順位と同じです。');$('leader-spotlight').innerHTML=empty('対象者なし');return;}
 $('leader-spotlight').innerHTML=`<div class="leader-kicker">${club==='all'?'LEAGUE LEADER':'TEAM LEADER'} / ${esc(cat.label)}</div><div class="crown">♛</div><h4>${esc(top.name)}</h4><div class="leader-team">${esc(teams[top.team]||top.team)}</div><div class="leader-value">${esc(top.value)}<span>${esc(cat.unit)}</span></div><div class="leader-label">${esc(cat.label)}ランキング 第1位</div>${rows.filter(r=>r.rank===1).length>1?'<p class="note">同率首位の選手がいます</p>':''}`;
 $('leaders').innerHTML=`<table class="leaders-table"><thead><tr><th>順位</th><th>選手</th><th>所属</th><th>リーグ</th><th>${esc(cat.label)}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.rank}</td><td class="team-cell">${esc(r.name)}</td><td>${esc(r.team)}</td><td><span class="league-pill">${r.league==='c'?'セ':'パ'}</span></td><td>${esc(r.value)} <small>${esc(cat.unit)}</small></td></tr>`).join('')}</tbody></table>`;
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
 $('roadmap').innerHTML=above?`<div class="roadmap-content"><div><span class="eyebrow">THE GAP TO NO. ${above.rank}</span><div class="gap-number">${number(above.points-jp.points)}<span>ポイント差</span></div><p>${esc(name(above))}（${above.rank}位）${number(above.points)} pts を上回ることが目標です。</p><div class="gap-track"></div></div><div><h4>勝利を重ねて、上の国とのポイント差を縮める。</h4><p>強い相手に勝つほど獲得ポイントが大きくなります。試合の重要度も加点に影響します。下のシミュレーターで、相手と試合の種類を変えて確認できます。</p><p>上位国のポイントが変わらないと仮定した目安です。</p></div></div>`:'<div class="empty">日本は現在1位です。</div>';
 $('simulator').hidden=false;const prev=$('opponent').value;
 $('opponent').innerHTML=rows.filter(r=>r.code!=='JPN').map(r=>`<option value="${esc(r.code)}">${esc(name(r))} · ${r.rank}位 (${number(r.points)} pts)</option>`).join('');
 $('opponent').value=rows.some(r=>r.code===prev)?prev:(above?.code||rows.find(r=>r.code!=='JPN').code);paintSimulation();
}
function paintSimulation(){
 const rows=data.fifa.data.rows;const jp=rows.find(r=>r.code==='JPN');const opponent=rows.find(r=>r.code===$('opponent').value);const above=rows.find(r=>r.rank===jp.rank-1);const importance=Number($('importance').value);const expected=1/(1+10**((opponent.points-jp.points)/600));
 $('simulation').innerHTML=[['勝った場合',1],['引き分け',.5],['負けた場合',0]].map(([label,result])=>{const gain=importance*(result-expected);const points=jp.points+gain;return `<div class="sim-result"><span>${label}</span><b>${gain>=0?'+':''}${number(gain)} pts</b><small>試合後 ${number(points)} pts${above?`<br>${points>above.points?'上位国の現在ポイントを超過':'上位国まで あと '+number(above.points-points)+' pts'}`:''}</small></div>`;}).join('');
}
function tabs(id,set){$(id).addEventListener('click',e=>{const b=e.target.closest('button[data-league]');if(!b||!data)return;$(id).querySelectorAll('button').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));});set(b.dataset.league);});}
tabs('standings-tabs',league=>{standingsLeague=league;paintStandings();});tabs('leader-tabs',league=>{leaderLeague=league;$('leader-team').value='all';paintLeaders();});
$('team').addEventListener('change',()=>{if(data)paintGames();});$('opponent').addEventListener('change',paintSimulation);$('importance').addEventListener('change',paintSimulation);
const scheduleTeams={神:'阪神',巨:'巨人',デ:'DeNA',広:'広島',ヤ:'ヤクルト',中:'中日',ソ:'ソフトバンク',西:'西武',日:'日本ハム',オ:'オリックス',ロ:'ロッテ',楽:'楽天'};
const themes={lavender:'ラベンダー',blue:'ブルー',green:'グリーン',coral:'コーラル',amber:'アンバー'};
const settingsKey='sports-desk-preferences-v1';let preferences={theme:'lavender',favorite:'all'};
try{const saved=JSON.parse(window.localStorage.getItem(settingsKey)||'null');if(saved){if(Object.hasOwn(themes,saved.theme))preferences.theme=saved.theme;if(saved.favorite==='all'||Object.hasOwn(teams,saved.favorite))preferences.favorite=saved.favorite;}}catch{}
function savePreferences(){try{window.localStorage.setItem(settingsKey,JSON.stringify(preferences));$('settings-status').textContent='保存しました。このブラウザーで次回も反映します。';}catch{$('settings-status').textContent='ブラウザーに保存できませんでした。この画面を開いている間だけ反映します。';}}
function applyTheme(){document.documentElement.dataset.theme=preferences.theme;document.querySelectorAll('[data-theme-choice]').forEach(b=>{b.classList.toggle('selected',b.dataset.themeChoice===preferences.theme);b.setAttribute('aria-pressed',String(b.dataset.themeChoice===preferences.theme));});}
$('theme-options').innerHTML=Object.entries(themes).map(([key,label])=>`<button data-theme-choice="${key}" class="theme-choice ${key}"><span></span>${label}</button>`).join('');
const clubOptions='<option value="all">すべての球団</option>'+Object.entries(teams).map(([key,label])=>`<option value="${key}">${label}</option>`).join('');
$('favorite-team').innerHTML=clubOptions.replace('すべての球団','未設定');$('favorite-team').value=preferences.favorite;$('leader-team').innerHTML=clubOptions;
applyTheme();
$('theme-options').addEventListener('click',e=>{const b=e.target.closest('[data-theme-choice]');if(!b)return;preferences.theme=b.dataset.themeChoice;applyTheme();savePreferences();});
function applyFavorite(){const code=preferences.favorite;const value=scheduleTeams[code]||'all';if([...$('team').options].some(o=>o.value===value))$('team').value=value;else $('team').value='all';if(data){paintGames();paintCalendar();}}
$('favorite-team').addEventListener('change',()=>{preferences.favorite=$('favorite-team').value;savePreferences();applyFavorite();});
$('settings-reset').addEventListener('click',()=>{preferences={theme:'lavender',favorite:'all'};$('favorite-team').value='all';applyTheme();applyFavorite();savePreferences();});
$('leader-team').addEventListener('change',()=>{const club=$('leader-team').value;if(club!=='all'){leaderLeague='神巨デ広ヤ中'.includes(club)?'c':'p';$('leader-tabs').querySelectorAll('button').forEach(b=>{const chosen=b.dataset.league===leaderLeague;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});}if(data)paintLeaders();});
const stamp=s=>s?.ok&&s.fetchedAt?'取得：'+new Date(s.fetchedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+' JST':'取得できませんでした';
function paintTimes(){document.querySelectorAll('[data-time]').forEach(el=>{el.textContent=stamp(data[el.dataset.time]);});}
function paintNews(){for(const sport of ['baseball','football']){const source=data[sport+'News'];$(sport+'-news').innerHTML=source?.ok?source.data.map(n=>`<a class="news-item" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer"><time>${esc(n.date)}</time><span>${esc(n.title)}</span><b aria-hidden="true">↗</b></a>`).join(''):empty('ニュースを取得できませんでした。公式サイトをご確認ください。');}}
let calendarMonth=currentDay().slice(0,7),selectedDay=currentDay();
function calendarEvents(){return [...(data.baseballGames.ok?data.baseballGames.data.map(g=>({...g,sport:'baseball'})):[]),...(data.footballGames.ok?data.footballGames.data.map(g=>({...g,sport:'football'})):[])];}
function isFavorite(g){return preferences.favorite!=='all'&&(g.home===scheduleTeams[preferences.favorite]||g.away===scheduleTeams[preferences.favorite]);}
function eventLabel(g){return g.sport==='baseball'?`${g.home} × ${g.away}`:`日本 × ${g.opponent}`;}
function paintCalendar(){
 if(!data)return;const [y,m]=calendarMonth.split('-').map(Number);const offset=new Date(Date.UTC(y,m-1,1)).getUTCDay(),count=new Date(Date.UTC(y,m,0)).getUTCDate();const events=calendarEvents();
 $('calendar-month').textContent=`${y}年${m}月`;
 $('calendar-coverage').textContent=`野球：${data.today.slice(0,7)}から3か月分の公表済み日程。サッカー：${data.year}年の公式日程（翌年分の掲載を含む）。空欄は取得範囲内に試合の掲載がない日です。${!data.baseballGames.ok||!data.footballGames.ok?'一部の日程を取得できていません。公式日程をご確認ください。':''}`;
 const out=['日','月','火','水','木','金','土'].map(d=>`<div class="weekday">${d}</div>`);for(let i=0;i<offset;i++)out.push('<div class="calendar-blank"></div>');
 for(let n=1;n<=count;n++){const day=`${calendarMonth}-${String(n).padStart(2,'0')}`,games=events.filter(g=>g.date===day);out.push(`<button class="calendar-day ${day===currentDay()?'today':''} ${day===selectedDay?'chosen':''}" data-day="${day}" aria-pressed="${day===selectedDay}" aria-label="${day}、${games.length}試合"><span class="day-number">${n}</span>${games.slice(0,3).map(g=>`<span class="calendar-event ${g.sport} ${isFavorite(g)?'favorite':''}">${g.sport==='baseball'?'⚾':'⚽'} ${isFavorite(g)?'★ ':''}${esc(eventLabel(g))}</span>`).join('')}${games.length>3?`<span class="more-games">ほか${games.length-3}試合</span>`:''}</button>`);}
 $('calendar').innerHTML=out.join('');$('day-title').textContent=date(selectedDay)+'の試合';const games=events.filter(g=>g.date===selectedDay);
 $('day-games').innerHTML=games.length?games.map(g=>`<div class="calendar-detail-game ${g.sport}"><b>${g.sport==='baseball'?'⚾':'⚽'} ${isFavorite(g)?'★ ':''}${esc(eventLabel(g))}</b><span>${g.status==='finished'?'終了':g.status==='cancelled'?'中止・延期':esc(g.time)||'開始時刻は公式で確認'} · ${esc(g.venue)}</span></div>`).join(''):empty('取得済みの日程に、この日の試合はありません。未発表・取得範囲外の日程は公式サイトをご確認ください。');
}
$('calendar').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(b){selectedDay=b.dataset.day;paintCalendar();}});
function moveMonth(delta){const [y,m]=calendarMonth.split('-').map(Number);calendarMonth=new Date(Date.UTC(y,m-1+delta,1)).toISOString().slice(0,7);selectedDay=calendarMonth+'-01';paintCalendar();}
$('month-prev').addEventListener('click',()=>moveMonth(-1));$('month-next').addEventListener('click',()=>moveMonth(1));$('month-today').addEventListener('click',()=>{calendarMonth=currentDay().slice(0,7);selectedDay=currentDay();paintCalendar();});
let loading=false,dataInitialized=false;async function refresh(){
 if(loading)return;loading=true;$('refresh').disabled=true;$('status').textContent='公開済みのデータを確認しています…';
 try{const response=await fetch('./data/sports.json',{cache:'no-cache',signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('データ取得エラー');data=await response.json();
 $('today').textContent=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).format(new Date());
 $('season').textContent=data.year;
 const teamBefore=$('team').value;$('team').innerHTML='<option value="all">すべてのチーム</option>'+Object.entries(scheduleTeams).map(([key,t])=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');$('team').value=[...$('team').options].some(o=>o.value===teamBefore)?teamBefore:'all';if(!dataInitialized){applyFavorite();dataInitialized=true;}
 $('categories').innerHTML=data.categories.map(c=>`<button data-category="${c.id}" class="${category===c.id?'selected':''}" aria-pressed="${category===c.id}">${esc(c.label)}</button>`).join('');
 paintStandings();paintGames();paintLeaders();paintFootball();paintFifa();paintCalendar();paintNews();paintTimes();
 const failed=[data.standings,data.baseballGames,data.footballGames,data.fifa,...[data.baseballNews,data.footballNews].filter(Boolean),...Object.values(data.leaders).flatMap(x=>[x.c,x.p])].filter(s=>!s.ok).length;
 const generated=new Date(data.generatedAt);const stale=Date.now()-generated.getTime()>7200000;
 $('status').classList.toggle('error',!!failed||stale);$('status').textContent=failed?`一部の公式データを取得できませんでした（${failed}件）。各欄の出典をご確認ください。`:stale?'表示中のデータは2時間以上前のものです。自動更新が遅れている可能性があります。出典をご確認ください。':'公式ソースから取得 · 毎時自動更新予定 · 試合速報ではありません';
 $('fetched-at').textContent='データ生成日時：'+generated.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+'（日本時間）';$('data-updated').textContent='データ取得・集計完了：'+generated.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+'（日本時間）';
 }catch{$('status').classList.add('error');$('status').textContent=data?'更新に失敗しました。表示中は前回取得のデータです。出典をご確認ください。':'データを取得できませんでした。「データを再確認」から再試行してください。';if(!data)for(const id of ['standings','baseball-games','leaders','football-game','fifa-summary','roadmap'])$(id).innerHTML=empty();}
 finally{loading=false;$('refresh').disabled=false;}
}
$('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$('categories').querySelectorAll('button').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));});paintLeaders();});
$('refresh').addEventListener('click',refresh);setInterval(()=>{if(!document.hidden)refresh();},900000);refresh();

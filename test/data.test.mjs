import test from 'node:test';
import assert from 'node:assert/strict';
import {parseNews,parseStandings,parseLeaders,parseBaseballGames,parseFootballGames,rankPlayers,fifaDelta,jstDate} from '../lib/data.mjs';
test('standings accepts team header cells and separates leagues',()=>{
 const table=t=>`<table><tr><th>勝率 差</th></tr>${Array.from({length:6},(_,i)=>`<tr><th><span class="hide_sp">${t}${i}</span><span class="hide_pc">短名</span></th><td>143</td><td>79</td><td>62</td><td>2</td><td>.560</td><td>-</td></tr>`).join('')}</table>`;
 const result=parseStandings(table('セ')+table('パ'));assert.equal(result.c.length,6);assert.equal(result.c[0].team,'セ0');assert.equal(result.p[0].wins,'79');
 assert.throws(()=>parseStandings('<table></table>'));
});
test('top ten includes ties and skips following ranks',()=>{
 const rows=Array.from({length:12},(_,i)=>({name:String(i),value:String(i<9?20-i:10)}));const r=rankPlayers(rows);assert.equal(r.length,12);assert.equal(r[11].rank,10);
 assert.equal(rankPlayers([{value:'2.01'},{value:'1.10'}],true)[0].value,'1.10');
});
test('leader parser preserves team and decimal value',()=>{
 const r=parseLeaders('<table><tr class="ststats"><td>1</td><td>佐藤　輝明(神)</td><td>.306</td></tr></table>','c');assert.deepEqual(r[0],{name:'佐藤 輝明',team:'神',league:'c',value:'.306'});
});
test('baseball date rowspans and finished matches',()=>{
 const r=parseBaseballGames('<table><tr><th rowspan="2">10/10（土）</th><td><div class="team1">巨人</div><div class="team2">DeNA</div><div class="score1"></div><div class="score2"></div><div class="time">14:00</div></td></tr><tr><td><div class="team1">西武</div><div class="team2">日本ハム</div><div class="score1">3</div><div class="score2">2</div></td></tr></table>',2026,10);assert.equal(r.length,2);assert.equal(r[1].date,'2026-10-10');assert.equal(r[1].status,'finished');
});
test('football preserves explicit next year and completed status',()=>{
 const r=parseFootballGames('<table><tr><td class="date">2027/1/11(月)</td><td class="team">インドネシア</td><td class="score">-</td></tr><tr><td class="date">10/5(月)</td><td class="team">相手</td><td class="score">○1-0</td></tr></table>',2026);assert.equal(r[0].date,'2027-01-11');assert.equal(r[1].status,'finished');
});
test('FIFA SUM formula and Tokyo calendar date',()=>{assert.equal(fifaDelta(1600,1600,10,1),5);assert.equal(fifaDelta(1600,1600,10,.5),0);assert.ok(fifaDelta(1600,1800,10,1)>5);assert.equal(jstDate(new Date('2026-10-09T16:00:00Z')),'2026-10-10');});

test('official news parses dates, removes duplicates and rejects external links',()=>{
 const block=(href,date,title)=>`<div class="news_block"><time>${date}</time><dd><a href="${href}">${title}</a></dd></div>`;
 const html=block('/news/detail/older.html','2026年9月30日','古いニュース')+block('/news/detail/latest.html','2026年10月9日','新しいニュース')+block('/news/detail/latest.html','2026年10月9日','新しいニュース')+block('https://example.com','2026年10月10日','外部');
 const rows=parseNews(html,'baseball');assert.equal(rows.length,2);assert.equal(rows[0].date,'2026-10-09');assert.equal(rows[0].url,'https://npb.jp/news/detail/latest.html');
 const soccer=parseNews('<a href="/news/1/"><span class="date">2026/10/09</span><span class="text-news">代表のニュース</span></a>','football');assert.equal(soccer[0].title,'代表のニュース');assert.throws(()=>parseNews('<html></html>','football'));
});

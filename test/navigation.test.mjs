import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';

test('three accessible tabs support direct links, guide links and keyboard navigation',async()=>{
 const {window,document}=parseHTML(await readFile('public/index.html','utf8'));
 window.location={hash:'#football'};
 window.history={pushState(state,title,url){window.location.hash=url;}};
 const context=vm.createContext({window,document,console,Intl,Date,Number,String,Set,Math,AbortSignal,setInterval(){},fetch:async()=>({ok:false})});
 vm.runInContext(await readFile('public/app.js','utf8'),context);
 await new Promise(r=>setTimeout(r,0));
 const $=id=>document.getElementById(id);
 const visible=()=>['guide','baseball','football'].filter(id=>!$(id).hidden);
 assert.deepEqual(visible(),['football']);assert.match($('breadcrumb-current').textContent,/サッカー/);
 $('tab-guide').click();assert.deepEqual(visible(),['guide']);
 assert.equal($('tab-guide').getAttribute('aria-selected'),'true');assert.equal($('tab-football').getAttribute('tabindex'),'-1');
 document.querySelector('#guide [data-open-tab="baseball"]').click();assert.deepEqual(visible(),['baseball']);
 const down=new window.Event('keydown',{bubbles:true,cancelable:true});Object.defineProperty(down,'key',{value:'ArrowDown'});$('tab-baseball').dispatchEvent(down);assert.deepEqual(visible(),['football']);
 const home=new window.Event('keydown',{bubbles:true,cancelable:true});Object.defineProperty(home,'key',{value:'Home'});$('tab-football').dispatchEvent(home);assert.deepEqual(visible(),['guide']);
 window.location.hash='#baseball';window.dispatchEvent(new window.Event('hashchange'));assert.deepEqual(visible(),['baseball']);
 window.location.hash='#football';window.dispatchEvent(new window.Event('popstate'));assert.deepEqual(visible(),['football']);
 window.location.hash='#invalid';window.dispatchEvent(new window.Event('hashchange'));assert.deepEqual(visible(),['baseball']);
 $('tab-guide').click();window.location.hash='#main-content';window.dispatchEvent(new window.Event('hashchange'));assert.deepEqual(visible(),['guide'],'Skip-to-content must preserve the current tab');
 for(const id of ['guide','baseball','football'])assert.equal($(id).getAttribute('aria-labelledby'),'tab-'+id);
 assert.ok(document.querySelector('#guide #fetched-at'),'Data update documentation belongs to the guide tab');
});

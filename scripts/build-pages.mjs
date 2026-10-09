import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { collectData } from '../lib/data.mjs';

export function comparisonSnapshot(previous,current){
  if(!previous||previous.year!==current.year||!Number.isFinite(Date.parse(previous.generatedAt))||Date.parse(previous.generatedAt)>=Date.parse(current.generatedAt))return null;
  return {year:previous.year,generatedAt:previous.generatedAt,standings:previous.standings,leaders:previous.leaders};
}
export async function readPrevious(output){
  try{return JSON.parse(await readFile(resolve(output,'data/sports.json'),'utf8'));}catch{return null;}
}
export async function readPublishedPrevious(){
  try{
      const response=await fetch(`https://ryuusei-works.github.io/japan-sports-desk/data/sports.json?t=${Date.now()}`,{signal:AbortSignal.timeout(12000),redirect:'error',cache:'no-store'});
      if(!response.ok)throw new Error('Previous deployment unavailable');
      const body=await response.text();if(body.length>6000000)throw new Error('Previous deployment too large');return JSON.parse(body);
  }catch{return null;}
}
export async function buildPages({collect=collectData,output=resolve('dist'),loadPrevious=readPrevious}={}){
  const previous=await loadPrevious(output);
  const data=await collect();
  const sources=[data.standings,data.baseballGames,data.footballGames,data.fifa,...[data.baseballNews,data.footballNews].filter(Boolean),...Object.values(data.leaders).flatMap(v=>[v.c,v.p])];
  const successful=sources.filter(s=>s.ok).length;
  // Do not replace the existing deployment if every official source is unavailable.
  if(successful===0)throw new Error('All official sources unavailable; keeping the previous deployment.');
  if(successful!==sources.length)console.warn(`Official sources: ${successful}/${sources.length}. Missing sections will display an error.`);
  data.previous=comparisonSnapshot(previous,data);
  await mkdir(resolve(output,'data'),{recursive:true});
  for(const file of ['index.html','app.js','style.css','.nojekyll'])await copyFile(resolve('public',file),resolve(output,file));
  await writeFile(resolve(output,'data/sports.json'),JSON.stringify(data));
  console.log(`Static site built. Official sources: ${successful}/${sources.length}. Fetched: ${data.generatedAt}`);
  return data;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  await buildPages({loadPrevious:process.env.GITHUB_ACTIONS==='true'?readPublishedPrevious:readPrevious});
}

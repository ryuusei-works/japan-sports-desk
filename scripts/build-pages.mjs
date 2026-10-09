import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { collectData } from '../lib/data.mjs';

export async function buildPages({collect=collectData,output=resolve('dist')}={}){
  const data=await collect();
  const sources=[data.standings,data.baseballGames,data.footballGames,data.fifa,...Object.values(data.leaders).flatMap(v=>[v.c,v.p])];
  const successful=sources.filter(s=>s.ok).length;
  // Do not replace the existing deployment if every official source is unavailable.
  if(successful===0)throw new Error('All official sources unavailable; keeping the previous deployment.');
  if(successful!==sources.length)console.warn(`Official sources: ${successful}/${sources.length}. Missing sections will display an error.`);
  await mkdir(resolve(output,'data'),{recursive:true});
  for(const file of ['index.html','app.js','style.css','.nojekyll'])await copyFile(resolve('public',file),resolve(output,file));
  await writeFile(resolve(output,'data/sports.json'),JSON.stringify(data));
  console.log(`Static site built. Official sources: ${successful}/${sources.length}. Fetched: ${data.generatedAt}`);
  return data;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  await buildPages();
}

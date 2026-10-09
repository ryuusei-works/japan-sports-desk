import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css','/data/sports.json':'data/sports.json'};
const types={'html':'text/html; charset=utf-8','js':'text/javascript; charset=utf-8','css':'text/css; charset=utf-8','json':'application/json; charset=utf-8'};
const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
try{await readFile(new URL('./dist/data/sports.json',import.meta.url));}catch{console.error('Run npm run build first to fetch data and prepare the static site.');process.exit(1);}
http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(base&&pathname===base){res.writeHead(302,{Location:base+'/'});res.end();return;}
 const path=base&&pathname.startsWith(base+'/')?pathname.slice(base.length):base?'':pathname;
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'");
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 try{
  if(!files[path]){res.writeHead(404);res.end('Not found');return;}
  res.setHeader('Content-Type',types[files[path].split('.').pop()]);
  res.setHeader('Cache-Control','no-cache');
  const body=await readFile(new URL('./dist/'+files[path],import.meta.url));res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(503);res.end('一時的に利用できません');}
}).listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log(`Local: http://localhost:${Number(process.env.PORT)||3000}${base}/`));

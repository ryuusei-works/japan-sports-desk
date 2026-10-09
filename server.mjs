import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {getData} from './api/sports.mjs';
const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
const types={'html':'text/html; charset=utf-8','js':'text/javascript; charset=utf-8','css':'text/css; charset=utf-8'};
http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'");
 if(req.method!=='GET'){res.writeHead(405);return res.end();}
 try{if(path==='/api/sports'){res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(await getData()));return;}
  if(!files[path]){res.writeHead(404);res.end('Not found');return;}
  res.setHeader('Content-Type',types[files[path].split('.').pop()]);res.end(await readFile(new URL('./public/'+files[path],import.meta.url)));
 }catch{res.writeHead(503);res.end('一時的に利用できません');}
}).listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log(`Local: http://localhost:${Number(process.env.PORT)||3000}`));

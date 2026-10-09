import { collectData } from '../lib/data.mjs';
let saved, pending;
export async function getData(){
 if(saved&&Date.now()-saved.at<saved.ttl)return saved.data;
 if(!pending)pending=collectData().then(data=>{const failed=[data.standings,data.baseballGames,data.footballGames,data.fifa,...Object.values(data.leaders).flatMap(v=>[v.c,v.p])].some(s=>!s.ok);saved={at:Date.now(),data,ttl:failed?60000:3600000};return data;}).finally(()=>{pending=null;});
 return pending;
}
export default async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 try{const data=await getData();res.setHeader('Cache-Control',`public, max-age=60, s-maxage=${saved.ttl/1000}`);return res.status(200).json(data);}catch{res.setHeader('Cache-Control','no-store');return res.status(503).json({error:'データを取得できませんでした。'});}
}

// Names and levels follow the JMA 2026 (r8) warning screen's code table.
const kinds={};
for(const [label,codes] of [['大雨',['10','03','43','33']],['土砂災害',['29','09','49','39']],['高潮',['19','08','48','38']]])codes.forEach((code,i)=>{kinds[code]={name:`レベル${i+2}${label}${['注意報','警報','危険警報','特別警報'][i]}`,level:i+2};});
for(const [names,codes] of [[['強風注意報','暴風警報','暴風特別警報'],['15','05','35']],[['風雪注意報','暴風雪警報','暴風雪特別警報'],['13','02','32']],[['大雪注意報','大雪警報','大雪特別警報'],['12','06','36']],[['波浪注意報','波浪警報','波浪特別警報'],['16','07','37']]])codes.forEach((code,i)=>{kinds[code]={name:names[i],level:[2,3,5][i]};});
for(const [code,name] of Object.entries({'14':'雷','17':'融雪','20':'濃霧','21':'乾燥','22':'なだれ','23':'低温','24':'霜','25':'着氷','26':'着雪'}))kinds[code]={name:name+'注意報',level:2};

export function parseAlerts(payload,areas){
 if(!Array.isArray(payload)||!payload.length)throw Error('Warning structure changed');
 const latest=new Map();
 for(const report of payload){if(!report.dataTypeCode||!Number.isFinite(Date.parse(report.reportDatetime))||!Array.isArray(report.warning?.class10Items))throw Error('Warning report changed');const prior=latest.get(report.dataTypeCode);if(!prior||Date.parse(prior.reportDatetime)<Date.parse(report.reportDatetime))latest.set(report.dataTypeCode,report);}
 const items=new Map();
 for(const report of latest.values()){
  if(report.infoType==='取消')continue;
  for(const area of report.warning.class10Items){if(!Array.isArray(area.kinds))throw Error('Warning kinds changed');for(const kind of area.kinds){if(!kind.code||kind.status==='解除'||kind.status==='発表警報・注意報はなし')continue;const info=kinds[kind.code]||{name:`気象情報（コード${kind.code}）`,level:3};items.set(area.areaCode+'|'+kind.code,{...info,code:kind.code,area:areas.class10s?.[area.areaCode]?.name||area.areaCode,issuedAt:report.reportDatetime});}}
 }
 return {issuedAt:[...latest.values()].map(r=>r.reportDatetime).sort((a,b)=>Date.parse(b)-Date.parse(a))[0],items:[...items.values()].sort((a,b)=>b.level-a.level||a.area.localeCompare(b.area))};
}

export async function collectAlerts(getText,regions){
 const source='https://www.jma.go.jp/bosai/warning/';let areas;
 try{areas=JSON.parse(await getText('https://www.jma.go.jp/bosai/common/const/area.json'));if(!areas.offices||!areas.class10s)throw Error();}catch{return Object.fromEntries(regions.map(r=>[r.id,{ok:false,source,error:'気象警報・注意報を取得できませんでした。'}]));}
 const offices=Object.entries(areas.offices),out={};
 for(let i=0;i<regions.length;i+=4)await Promise.all(regions.slice(i,i+4).map(async region=>{
  const codes=offices.filter(([code])=>code.startsWith(region.id)).map(([code])=>code);
  try{if(!codes.length)throw Error();const reports=await Promise.all(codes.map(async code=>parseAlerts(JSON.parse(await getText(`https://www.jma.go.jp/bosai/warning/data/r8/${code}.json`)),areas)));out[region.id]={ok:true,source,fetchedAt:new Date().toISOString(),data:{issuedAt:reports.map(r=>r.issuedAt).sort((a,b)=>Date.parse(b)-Date.parse(a))[0],items:reports.flatMap(r=>r.items)}};}catch{out[region.id]={ok:false,source,error:'気象警報・注意報を取得できませんでした。'};}
 }));return out;
}

import {NextResponse} from "next/server";
import {competition} from "../../../lib/data";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const r=await fetch(competition.sourceUrl,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36","Accept-Language":"cs-CZ,cs;q=0.9","Accept":"text/html,application/xhtml+xml"} ,cache:"no-store"});
  const html=await r.text();
  const needles=["SK Sokol Brozany","21:14","2026423H1B0103","__NEXT_DATA__","api"];
  const hits=needles.map(n=>{const i=html.indexOf(n);return {needle:n,index:i,snippet:i>=0?html.slice(Math.max(0,i-350),Math.min(html.length,i+700)).replace(/\s+/g," "):null}});
  return NextResponse.json({status:r.status,type:r.headers.get("content-type"),length:html.length,hits});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:String(e)},{status:500})}
}
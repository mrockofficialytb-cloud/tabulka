import type {Match} from "../standings";
import {competition,fallbackMatches} from "../data";

export type CompetitionFeed={matches:Match[];source:"fotbal.cz"|"fallback";updatedAt:string;error?:string};

function text(s:string){return s.replace(/<script[\\s\\S]*?<\\/script>/gi," ").replace(/<style[\\s\\S]*?<\\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\\s+/g," ").trim()}

export async function getCompetitionFeed():Promise<CompetitionFeed>{
 try{
  const res=await fetch(competition.sourceUrl,{headers:{"User-Agent":"Mozilla/5.0 (compatible; TabulkaBrozany/1.0)","Accept-Language":"cs-CZ,cs;q=0.9"},next:{revalidate:300}});
  if(!res.ok)throw new Error("Fotbal.cz HTTP "+res.status);
  const html=await res.text(); const plain=text(html);
  // Parser se aktivuje jen pokud Fotbal.cz vrátí očekávaný obsah; nikdy nevymýšlí skóre.
  const known=["SK Sokol Brozany","ASK Lovosice","SK Velemín","TJ Sokol Černiv"];
  if(!known.some(n=>plain.toLowerCase().includes(n.toLowerCase())))throw new Error("Stránka neobsahuje očekávaná data soutěže");
  // HTML Fotbal.cz se liší podle renderu. Dokud neověříme jeho strukturu na Vercelu,
  // ponecháme ověřený fallback místo riskantního parsování chybných výsledků.
  return {matches:fallbackMatches,source:"fallback",updatedAt:new Date().toISOString(),error:"Fotbal.cz je dosažitelný; čeká se na ověření HTML parseru."};
 }catch(e){
  return {matches:fallbackMatches,source:"fallback",updatedAt:new Date().toISOString(),error:e instanceof Error?e.message:"Chyba načtení"};
 }
}
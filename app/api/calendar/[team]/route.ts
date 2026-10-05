import { getCompetitionFeed } from "../../../../lib/providers/fotbal-cz";
import { teams } from "../../../../lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const slugs: Record<string,string> = {
  "budyne":"TJ Viktoria Budyně nad Ohří",
  "cerniv":"TJ Sokol Černiv",
  "vchynice-sulejovice":"FK Vchynice / TJ Slavoj Sulejovice",
  "brozany":"SK Sokol Brozany",
  "velemin":"SK Velemín",
  "male-zernoseky":"SK Sokol Malé Žernoseky",
  "trebenice":"Městský Sportovní klub Třebenice",
  "podlusky":"Dynamo Podlusky",
  "lovosice":"ASK Lovosice",
};

const esc=(s:string)=>s.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
const pad=(n:number)=>String(n).padStart(2,"0");
const stamp=(d:Date)=>`${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

export async function GET(_:Request,{params}:{params:Promise<{team:string}>}){
  const {team:slug}=await params;
  const team=slugs[slug];
  if(!team || !teams.some(t=>t.name===team)) return new Response("Kalendář týmu nebyl nalezen.",{status:404});
  const feed=await getCompetitionFeed();
  const matches=feed.matches.filter(m=>(m.home===team||m.away===team)&&m.date);
  const updated=new Date(feed.updatedAt||Date.now());
  const events=matches.map((m,i)=>{
    const [y,mo,d]=m.date!.split("-").map(Number);
    const [h,mi]=(m.time||"10:00").split(":").map(Number);
    const start=new Date(Date.UTC(y,mo-1,d,h-2,mi));
    const end=new Date(start.getTime()+90*60*1000);
    const opponent=m.home===team?m.away:m.home;
    const place=m.home===team?"Domácí hřiště":"Hřiště soupeře";
    const result=m.played&&m.homeScore!==null&&m.awayScore!==null?` · Výsledek ${m.homeScore}:${m.awayScore}`:"";
    return ["BEGIN:VEVENT",`UID:goluj-${slug}-${m.date}-${m.round}-${i}@goluj.cz`,`DTSTAMP:${stamp(updated)}`,`LAST-MODIFIED:${stamp(updated)}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${esc(team+" – "+opponent)}`,`DESCRIPTION:${esc(`${m.round}. kolo · ${place}${result} · Góluj.cz`)}`,"STATUS:CONFIRMED","END:VEVENT"].join("\r\n");
  }).join("\r\n");
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Goluj.cz//Muj tym//CS","CALSCALE:GREGORIAN","METHOD:PUBLISH",`X-WR-CALNAME:${esc("Góluj.cz – "+team)}`,"X-WR-TIMEZONE:Europe/Prague","REFRESH-INTERVAL;VALUE=DURATION:PT30M","X-PUBLISHED-TTL:PT30M",events,"END:VCALENDAR"].join("\r\n");
  return new Response(ics,{headers:{"Content-Type":"text/calendar; charset=utf-8","Content-Disposition":`inline; filename="goluj-${slug}.ics"`,"Cache-Control":"no-store, max-age=0","Access-Control-Allow-Origin":"*"}});
}

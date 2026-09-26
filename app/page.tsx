import {calculateStandings} from "../lib/standings";
import {competition,teams} from "../lib/data";
import {getCompetitionFeed} from "../lib/providers/fotbal-cz";

export const revalidate=300;

export default async function Home(){
 const feed=await getCompetitionFeed();
 const rows=calculateStandings(teams,feed.matches);
 return <main>
  <header><div className="eyebrow">MLADŠÍ PŘÍPRAVKA · BROZANY</div><h1>Průběžná tabulka</h1><p>{competition.name}</p></header>
  <section className="card">
   <div className="bar"><strong>Pořadí všech 9 týmů</strong><span>{feed.source==="fotbal.cz"?"Automaticky z Fotbal.cz":"Ověřená data · synchronizace se připravuje"}</span></div>
   <div className="scroll"><table><thead><tr><th>#</th><th className="team">Tým</th><th>Z</th><th>V</th><th>R</th><th>P</th><th>Skóre</th><th>+/-</th><th>B</th></tr></thead>
   <tbody>{rows.map((r,i)=><tr key={r.name} className={r.name.includes("Brozany")?"brozany":""}><td><b className="rank">{i+1}</b></td><td className="team"><div className="club"><span className="crest">{r.name.slice(0,2).toUpperCase()}</span><strong>{r.name}</strong></div></td><td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gf}:{r.ga}</td><td>{r.gd>0?"+":""}{r.gd}</td><td><b>{r.pts}</b></td></tr>)}</tbody></table></div>
  </section>
  <footer>Neoficiální tabulka · <a href={competition.sourceUrl} target="_blank" rel="noreferrer">Oficiální rozpis a výsledky Fotbal.cz</a>{feed.error&&<><br/><span className="sync">Synchronizace: {feed.error}</span></>}</footer>
 </main>
}
"use client";
import{useEffect,useState}from"react";

type T={name:string;short?:string;logo?:string};
const colors:Record<string,string>={
"TJ Slavoj Sulejovice / FK Vchynice":"#f8dc30","Dynamo Podlusky":"#019341","ASK Lovosice":"#31428b","SK Velemín":"#009fe0","TJ Viktoria Budyně nad Ohří":"#180b8e","TJ Sokol Černiv":"#297b40","SK Sokol Malé Žernoseky":"#b92c2b","Městský Sportovní klub Třebenice":"#17854e","SK Sokol Brozany":"#c62223"};
export default function ClubTheme({teams}:{teams:T[]}){
 const[selected,setSelected]=useState<string|null>(null),[open,setOpen]=useState(false),[mine,setMine]=useState(false);
 const mark=(name:string,onlyMine:boolean)=>{
  const c=colors[name]||"#111827",root=document.documentElement;
  root.style.setProperty("--club",c);root.dataset.club=name;
  root.classList.toggle("onlyMine",onlyMine);
  document.querySelectorAll<HTMLElement>(".match[data-home][data-away]").forEach(el=>{
   const isMine=el.dataset.home===name||el.dataset.away===name;
   el.classList.toggle("favoriteMatch",isMine);
  });
  setSelected(name);setMine(onlyMine);
 };
 useEffect(()=>{const s=localStorage.getItem("favoriteTeam"),m=localStorage.getItem("onlyFavoriteMatches")==="1";if(s&&colors[s])mark(s,m);else setOpen(true)},[]);
 const choose=(name:string)=>{localStorage.setItem("favoriteTeam",name);mark(name,mine);setOpen(false)};
 const toggleMine=()=>{if(!selected)return;const n=!mine;localStorage.setItem("onlyFavoriteMatches",n?"1":"0");mark(selected,n)};
 const t=teams.find(x=>x.name===selected);
 return <><div className="clubControls"><button className={"mineToggle "+(mine?"active":"")} onClick={toggleMine} disabled={!selected}>{mine?"Jen můj tým":"Všechny zápasy"}</button><button className="changeClub" onClick={()=>setOpen(true)}>{t?.logo&&<img src={t.logo} alt=""/>}<span>{t?"Změnit tým":"Vybrat tým"}</span></button></div>
 {open&&<div className="clubModalBackdrop"><div className="clubModal"><div className="clubModalHead"><span>MOJE BARVY</span><h2>Vyberte si svůj tým</h2><p>Tabulka i zápasy se přizpůsobí barvám vašeho klubu.</p></div><div className="clubGrid">{teams.map(x=><button key={x.name} onClick={()=>choose(x.name)} style={{"--pick":colors[x.name]} as React.CSSProperties}>{x.logo&&<img src={x.logo} alt=""/>}<strong>{x.short||x.name}</strong></button>)}</div>{selected&&<button className="modalClose" onClick={()=>setOpen(false)}>Zavřít</button>}</div></div>}</>
}
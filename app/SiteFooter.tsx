"use client";
import{useState}from"react";
type Site={name:string;domain:string;preview?:string};
const sites:Site[]=[
{name:"BodyPulse",domain:"bodypulse.cz"},
{name:"BodyPulse rezervace",domain:"bp.bodypulse.cz"},
{name:"Crumbs",domain:"crumbs.cz"},
{name:"OKIM",domain:"okim.cz"},
{name:"OKIM OL",domain:"ol.okim.cz"},
{name:"Šlepr",domain:"slepr.cz"},
{name:"Kontejnery Drobný",domain:"kontejnerydrobny.cz",preview:"https://kontejnery-drobny.vercel.app/"}
];
export default function SiteFooter(){const[open,setOpen]=useState(false);const year=new Date().getFullYear();return <><footer className="siteFooter"><button className="footerBrand" type="button" onClick={()=>setOpen(true)}><img src="/logos/ico.svg" alt=""/><span><strong>Góluj.cz</strong><small>© {year} · Všechna práva vyhrazena</small></span></button></footer>{open&&<div className="aboutBackdrop" onClick={()=>setOpen(false)}><section className="aboutCard portfolioCard portfolioWide" onClick={e=>e.stopPropagation()}><button className="aboutClose" type="button" aria-label="Zavřít" onClick={()=>setOpen(false)}>×</button><div className="portfolioIntro"><img src="/logos/logo.svg" alt="Góluj.cz"/><div><p className="aboutLead">Výsledky, tabulky a zápasy přehledně na jednom místě.</p><p className="portfolioNote">Góluj.cz je jednoduchý přehled pro rodiče, hráče a fanoušky mládežnického fotbalu.</p></div></div><div className="contactStrip"><span>Kontakt</span><strong>Václav Šlepr</strong></div><div className="portfolioHead"><span>DALŠÍ TVORBA</span><strong>Vybrané webové projekty</strong></div><div className="portfolioGrid">{sites.map(site=><article className="portfolioItem" key={site.domain}><div className="sitePreview"><iframe src={site.preview||"https://"+site.domain} title={site.name} loading="lazy" tabIndex={-1}/><div className="previewShield"/></div><div className="portfolioCaption"><strong>{site.name}</strong><span>{site.domain}</span></div></article>)}</div></section></div>}</>}

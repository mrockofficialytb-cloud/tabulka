"use client";
import{useState}from"react";

function MailIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4z"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>}
function PhoneIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 4.5 10 8.2 8.5 9.7c1.2 2.5 3.3 4.6 5.8 5.8l1.5-1.5 3.7 1.8-.7 3.2c-.2.8-.9 1.3-1.7 1.3C9.7 20.3 3.7 14.3 3.7 6.9c0-.8.5-1.5 1.3-1.7z"/></svg>}

export default function SiteFooter(){
 const[open,setOpen]=useState(false);const year=new Date().getFullYear();
 return <>
  <footer className="siteFooter"><button className="footerBrand" type="button" onClick={()=>setOpen(true)}><img src="/logos/ico.svg" alt=""/><span><strong>Góluj.cz</strong><small>© {year} · Všechna práva vyhrazena</small></span></button></footer>
  {open&&<div className="aboutBackdrop" onClick={()=>setOpen(false)}>
   <section className="aboutCard simpleAboutCard" onClick={e=>e.stopPropagation()}>
    <button className="aboutClose" type="button" aria-label="Zavřít" onClick={()=>setOpen(false)}>×</button>
    <div className="aboutBrand"><img src="/logos/logo.svg" alt="Góluj.cz"/><span>MLÁDEŽNICKÝ FOTBAL · PŘEHLEDNĚ</span></div>
    <p className="aboutLead">Jednoduchý přehled výsledků, tabulek a zápasů mládežnického fotbalu.</p>
    <div className="aboutDivider"/>
    <div className="aboutStudio"><small>PROJEKT & REALIZACE</small><strong>Václav Šlepr</strong></div>
    <div className="aboutContactGrid">
     <a href="mailto:info@permaban.cz"><i><MailIcon/></i><span><small>E-MAIL</small><strong>info@permaban.cz</strong></span></a>
     <a href="tel:+420734785184"><i><PhoneIcon/></i><span><small>TELEFON</small><strong>+420 734 785 184</strong></span></a>
    </div>
    <div className="aboutServices"><span>WEBY</span><span>WEBOVÉ SYSTÉMY</span><span>GRAFIKA</span><span>MARKETING</span><span>TISK & MERCH</span><span>IT & HOSTING</span><span>TVORBA APLIKACÍ</span></div>
   </section>
  </div>}
 </>
}

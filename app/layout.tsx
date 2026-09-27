import "./globals.css";
export const metadata={
 metadataBase:new URL("https://www.goluj.cz"),
 title:"Góluj.cz · Výsledky a tabulka",
 description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",
 applicationName:"Góluj.cz",
 appleWebApp:{capable:true,title:"Góluj.cz",statusBarStyle:"default"},
 formatDetection:{telephone:false},
 icons:{
  icon:[{url:"/icon",type:"image/png",sizes:"512x512"},{url:"/logos/ico.svg",type:"image/svg+xml"}],
  apple:[{url:"/apple-icon",type:"image/png",sizes:"180x180"}],
  shortcut:"/icon"
 },
 openGraph:{
  type:"website",locale:"cs_CZ",url:"https://www.goluj.cz",siteName:"Góluj.cz",
  title:"Góluj.cz · Výsledky a tabulka",
  description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",
  images:[{url:"/opengraph-image",width:1200,height:630,alt:"Góluj.cz"}]
 },
 twitter:{card:"summary_large_image",title:"Góluj.cz · Výsledky a tabulka",description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",images:["/opengraph-image"]}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="cs"><body>{children}</body></html>}

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
export const metadata={
 metadataBase:new URL("https://goluj.cz"),
 title:"Góluj.cz · Výsledky a tabulka",
 description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",
 applicationName:"Góluj.cz",
 icons:{icon:[{url:"/logos/ico.svg",type:"image/svg+xml",sizes:"any"}],apple:[{url:"/logos/ico.svg",sizes:"180x180"}],shortcut:"/logos/ico.svg"},
 openGraph:{type:"website",locale:"cs_CZ",url:"https://goluj.cz",siteName:"Góluj.cz",title:"Góluj.cz · Výsledky a tabulka",description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",images:[{url:"/opengraph-image?v=4",width:512,height:512,alt:"Góluj.cz"}]},
 twitter:{card:"summary",title:"Góluj.cz · Výsledky a tabulka",description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",images:["/opengraph-image?v=4"]}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="cs"><body>{children}<Analytics/></body></html>}

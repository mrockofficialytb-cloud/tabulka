import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./calendar-polish.css";
import "./upgrade.css";
export const metadata={
 metadataBase:new URL("https://goluj.cz"),
 title:"Góluj.cz · Výsledky a tabulka",
 description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",
 applicationName:"Góluj.cz",
 manifest:"/manifest.webmanifest",
 appleWebApp:{capable:true,statusBarStyle:"default" as const,title:"Góluj.cz"},
 formatDetection:{telephone:false},
 icons:{icon:[{url:"/logos/ico.svg",type:"image/svg+xml",sizes:"any"}],apple:[{url:"/icon",sizes:"512x512"}],shortcut:"/logos/ico.svg"},
 openGraph:{type:"website",locale:"cs_CZ",url:"https://goluj.cz",siteName:"Góluj.cz",title:"Góluj.cz · Výsledky a tabulka",description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",images:[{url:"/opengraph-image?v=4",width:512,height:512,alt:"Góluj.cz"}]},
 twitter:{card:"summary",title:"Góluj.cz · Výsledky a tabulka",description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",images:["/opengraph-image?v=4"]}
};
export const viewport={themeColor:"#f6f6f7",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="cs"><body>{children}<Analytics/></body></html>}

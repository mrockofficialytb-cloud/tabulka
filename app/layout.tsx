import "./globals.css";
export const metadata={
 metadataBase:new URL("https://goluj.cz"),
 title:"Góluj.cz · Výsledky a tabulka",
 description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",
 applicationName:"Góluj.cz",
 icons:{icon:[{url:"/logos/ico.svg",type:"image/svg+xml"}],apple:[{url:"/logos/ico.svg"}],shortcut:"/logos/ico.svg"},
 openGraph:{type:"website",locale:"cs_CZ",url:"https://goluj.cz",siteName:"Góluj.cz",title:"Góluj.cz · Výsledky a tabulka",description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",images:[{url:"/opengraph-image",width:1200,height:630,alt:"Góluj.cz"}]},
 twitter:{card:"summary_large_image",title:"Góluj.cz · Výsledky a tabulka",description:"Výsledky, tabulky a zápasy mládežnického fotbalu přehledně na jednom místě.",images:["/opengraph-image"]}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="cs"><body>{children}</body></html>}

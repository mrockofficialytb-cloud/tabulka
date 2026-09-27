import type{MetadataRoute}from"next";
export default function manifest():MetadataRoute.Manifest{return{name:"Góluj.cz",short_name:"Góluj.cz",description:"Výsledky, tabulky a zápasy mládežnického fotbalu.",start_url:"/",display:"standalone",background_color:"#ffffff",theme_color:"#ffffff",icons:[{src:"/logos/ico.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}]}}

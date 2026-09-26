import type { Match, Team } from "./standings";

export type Fixture=Match&{round:number;date?:string;time?:string};

export const competition={
 name:'2026 H1B – 2. liga – Mladší přípravka sk. "B"',
 id:"cb23dcde-b42b-4e12-ba8b-5344d9a32bb0",
 sourceUrl:"https://www.fotbal.cz/souteze/turnaje/zapas/cb23dcde-b42b-4e12-ba8b-5344d9a32bb0"
};

export const teams:Team[]=[
 {name:"TJ Viktoria Budyně nad Ohří",short:"Budyně",logo:"/logos/budyne.svg"},
 {name:"TJ Sokol Černiv",short:"Černiv",logo:"/logos/cerniv.svg"},
 {name:"TJ Slavoj Sulejovice / FK Vchynice",short:"Vchynice / Sulejovice",logo:"/logos/sulejovice-vchynice.svg"},
 {name:"SK Sokol Brozany",short:"Brozany",logo:"/logos/brozany.svg"},
 {name:"SK Velemín",short:"Velemín",logo:"/logos/velemin.svg"},
 {name:"SK Sokol Malé Žernoseky",short:"Malé Žernoseky",logo:"/logos/male-zernoseky.svg"},
 {name:"Městský Sportovní klub Třebenice",short:"Třebenice",logo:"/logos/trebenice.svg"},
 {name:"Dynamo Podlusky",short:"Podlusky",logo:"/logos/podlusky.svg"},
 {name:"ASK Lovosice",short:"Lovosice",logo:"/logos/lovosice.svg"},
];

export const fixtures:Fixture[]=[
 {round:1,home:"SK Velemín",away:"TJ Viktoria Budyně nad Ohří",homeScore:6,awayScore:11,played:true},
 {round:1,home:"SK Sokol Brozany",away:"ASK Lovosice",homeScore:21,awayScore:14,played:true},
 {round:1,home:"TJ Slavoj Sulejovice / FK Vchynice",away:"Městský Sportovní klub Třebenice",homeScore:21,awayScore:0,played:true},
 {round:1,date:"2026-09-05",time:"10:00",home:"TJ Sokol Černiv",away:"Dynamo Podlusky",homeScore:null,awayScore:null,played:false},

 {round:2,home:"Městský Sportovní klub Třebenice",away:"TJ Sokol Černiv",homeScore:null,awayScore:null,played:false},
 {round:2,home:"ASK Lovosice",away:"TJ Slavoj Sulejovice / FK Vchynice",homeScore:null,awayScore:null,played:false},
 {round:2,home:"TJ Viktoria Budyně nad Ohří",away:"SK Sokol Brozany",homeScore:null,awayScore:null,played:false},
 {round:2,home:"SK Sokol Malé Žernoseky",away:"SK Velemín",homeScore:null,awayScore:null,played:false},

 {round:3,home:"SK Sokol Brozany",away:"SK Sokol Malé Žernoseky",homeScore:null,awayScore:null,played:false},
 {round:3,home:"TJ Slavoj Sulejovice / FK Vchynice",away:"TJ Viktoria Budyně nad Ohří",homeScore:null,awayScore:null,played:false},
 {round:3,home:"TJ Sokol Černiv",away:"ASK Lovosice",homeScore:null,awayScore:null,played:false},
 {round:3,date:"2026-09-19",time:"10:00",home:"Dynamo Podlusky",away:"Městský Sportovní klub Třebenice",homeScore:null,awayScore:null,played:false},

 {round:12,home:"SK Sokol Malé Žernoseky",away:"SK Sokol Brozany",homeScore:null,awayScore:null,played:false},
 {round:12,home:"TJ Viktoria Budyně nad Ohří",away:"TJ Slavoj Sulejovice / FK Vchynice",homeScore:null,awayScore:null,played:false},
 {round:12,home:"ASK Lovosice",away:"TJ Sokol Černiv",homeScore:null,awayScore:null,played:false},
 {round:12,date:"2026-09-23",time:"17:00",home:"Městský Sportovní klub Třebenice",away:"Dynamo Podlusky",homeScore:null,awayScore:null,played:false},

 {round:4,home:"TJ Viktoria Budyně nad Ohří",away:"TJ Sokol Černiv",homeScore:null,awayScore:null,played:false},
 {round:4,home:"SK Sokol Malé Žernoseky",away:"TJ Slavoj Sulejovice / FK Vchynice",homeScore:null,awayScore:null,played:false},
 {round:4,date:"2026-09-26",time:"12:00",home:"SK Velemín",away:"SK Sokol Brozany",homeScore:null,awayScore:null,played:false},
 {round:4,date:"2026-09-26",time:"10:00",home:"ASK Lovosice",away:"Dynamo Podlusky",homeScore:null,awayScore:null,played:false},

 {round:5,home:"TJ Slavoj Sulejovice / FK Vchynice",away:"SK Velemín",homeScore:null,awayScore:null,played:false},
 {round:5,home:"TJ Sokol Černiv",away:"SK Sokol Malé Žernoseky",homeScore:null,awayScore:null,played:false},
 {round:5,home:"Městský Sportovní klub Třebenice",away:"ASK Lovosice",homeScore:null,awayScore:null,played:false},
 {round:5,date:"2026-10-03",time:"10:00",home:"Dynamo Podlusky",away:"TJ Viktoria Budyně nad Ohří",homeScore:null,awayScore:null,played:false},
];
export const fallbackMatches:Match[]=fixtures;

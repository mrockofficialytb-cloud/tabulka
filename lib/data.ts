import type { Match, Team } from "./standings";

export type Fixture=Match&{round:number;date?:string;time?:string};

export const competition={
 name:'2026 H1B – 2. liga – Mladší přípravka sk. "B"',
 id:"cb23dcde-b42b-4e12-ba8b-5344d9a32bb0",
 sourceUrl:"https://www.fotbal.cz/souteze/turnaje/zapas/cb23dcde-b42b-4e12-ba8b-5344d9a32bb0"
};

export const teams:Team[]=[
 {name:"TJ Viktoria Budyně nad Ohří",short:"Budyně",logo:"/logos/budyne.png"},
 {name:"TJ Sokol Černiv",short:"Černiv",logo:"/logos/cerniv.png"},
 {name:"TJ Slavoj Sulejovice / FK Vchynice",short:"Vchynice / Sulejovice",logo:"/logos/vchynice.png"},
 {name:"SK Sokol Brozany",short:"Brozany",logo:"/logos/brozany.png"},
 {name:"SK Velemín",short:"Velemín",logo:"/logos/velemin.png"},
 {name:"SK Sokol Malé Žernoseky",short:"Malé Žernoseky",logo:"/logos/zernoseky.png"},
 {name:"Městský Sportovní klub Třebenice",short:"Třebenice",logo:"/logos/trebenice.png"},
 {name:"Dynamo Podlusky",short:"Podlusky",logo:"/logos/podlusky.png"},
 {name:"ASK Lovosice",short:"Lovosice",logo:"/logos/lovosice.png"},
];

export const fixtures:Fixture[]=[
 {round:1,home:"SK Velemín",away:"TJ Viktoria Budyně nad Ohří",homeScore:6,awayScore:11,played:true},
 {round:1,home:"SK Sokol Brozany",away:"ASK Lovosice",homeScore:21,awayScore:14,played:true},
 {round:1,home:"TJ Slavoj Sulejovice / FK Vchynice",away:"Městský Sportovní klub Třebenice",homeScore:21,awayScore:0,played:true},
 {round:1,date:"2026-09-15",time:"17:30",home:"TJ Sokol Černiv",away:"Dynamo Podlusky",homeScore:5,awayScore:23,played:true},

 {round:2,home:"Městský Sportovní klub Třebenice",away:"TJ Sokol Černiv",homeScore:null,awayScore:null,played:false},
 {round:2,date:"2026-09-12",time:"10:00",home:"ASK Lovosice",away:"TJ Slavoj Sulejovice / FK Vchynice",homeScore:18,awayScore:4,played:true},
 {round:2,date:"2026-09-12",time:"10:00",home:"TJ Viktoria Budyně nad Ohří",away:"SK Sokol Brozany",homeScore:5,awayScore:8,played:true},
 {round:2,date:"2026-09-12",home:"SK Sokol Malé Žernoseky",away:"SK Velemín",homeScore:9,awayScore:16,played:true},

 {round:3,date:"2026-09-19",time:"10:00",home:"SK Sokol Brozany",away:"SK Sokol Malé Žernoseky",homeScore:18,awayScore:7,played:true},
 {round:3,date:"2026-09-19",time:"10:00",home:"TJ Slavoj Sulejovice / FK Vchynice",away:"TJ Viktoria Budyně nad Ohří",homeScore:13,awayScore:5,played:true},
 {round:3,date:"2026-09-19",home:"TJ Sokol Černiv",away:"ASK Lovosice",homeScore:16,awayScore:20,played:true},
 {round:3,date:"2026-09-19",time:"10:00",home:"Dynamo Podlusky",away:"Městský Sportovní klub Třebenice",homeScore:28,awayScore:1,played:true},

 {round:12,home:"SK Sokol Malé Žernoseky",away:"SK Sokol Brozany",homeScore:null,awayScore:null,played:false},
 {round:12,home:"TJ Viktoria Budyně nad Ohří",away:"TJ Slavoj Sulejovice / FK Vchynice",homeScore:null,awayScore:null,played:false},
 {round:12,home:"ASK Lovosice",away:"TJ Sokol Černiv",homeScore:null,awayScore:null,played:false},
 {round:12,date:"2026-09-23",time:"17:00",home:"Městský Sportovní klub Třebenice",away:"Dynamo Podlusky",homeScore:null,awayScore:null,played:false},

 {round:4,date:"2026-09-26",time:"10:00",home:"TJ Viktoria Budyně nad Ohří",away:"TJ Sokol Černiv",homeScore:1,awayScore:7,played:true},
 {round:4,home:"SK Sokol Malé Žernoseky",away:"TJ Slavoj Sulejovice / FK Vchynice",homeScore:null,awayScore:null,played:false},
 {round:4,date:"2026-09-26",time:"12:00",home:"SK Velemín",away:"SK Sokol Brozany",homeScore:null,awayScore:null,played:false},
 {round:4,date:"2026-09-26",time:"10:00",home:"ASK Lovosice",away:"Dynamo Podlusky",homeScore:null,awayScore:null,played:false},

 {round:5,home:"TJ Slavoj Sulejovice / FK Vchynice",away:"SK Velemín",homeScore:null,awayScore:null,played:false},
 {round:5,home:"TJ Sokol Černiv",away:"SK Sokol Malé Žernoseky",homeScore:null,awayScore:null,played:false},
 {round:5,home:"Městský Sportovní klub Třebenice",away:"ASK Lovosice",homeScore:null,awayScore:null,played:false},
 {round:5,date:"2026-10-03",time:"10:00",home:"Dynamo Podlusky",away:"TJ Viktoria Budyně nad Ohří",homeScore:null,awayScore:null,played:false},
 {round:13,date:"2026-10-07",time:"16:30",home:"Dynamo Podlusky",away:"ASK Lovosice",homeScore:null,awayScore:null,played:false},
 {round:6,date:"2026-10-10",time:"10:00",home:"SK Sokol Malé Žernoseky",away:"Dynamo Podlusky",homeScore:null,awayScore:null,played:false},
 {round:6,date:"2026-10-10",time:"10:00",home:"SK Sokol Brozany",away:"TJ Slavoj Sulejovice / FK Vchynice",homeScore:null,awayScore:null,played:false},
 {round:7,date:"2026-10-17",time:"10:00",home:"Dynamo Podlusky",away:"SK Velemín",homeScore:null,awayScore:null,played:false},
 {round:7,date:"2026-10-18",time:"10:00",home:"TJ Sokol Černiv",away:"SK Sokol Brozany",homeScore:null,awayScore:null,played:false},
 {round:14,date:"2026-10-21",time:"16:00",home:"TJ Viktoria Budyně nad Ohří",away:"Dynamo Podlusky",homeScore:null,awayScore:null,played:false},
 {round:8,date:"2026-10-24",time:"10:00",home:"SK Sokol Brozany",away:"Dynamo Podlusky",homeScore:null,awayScore:null,played:false},
 {round:15,date:"2026-10-28",time:"16:00",home:"Dynamo Podlusky",away:"SK Sokol Malé Žernoseky",homeScore:null,awayScore:null,played:false},
 {round:15,date:"2026-10-28",time:"16:00",home:"TJ Slavoj Sulejovice / FK Vchynice",away:"SK Sokol Brozany",homeScore:null,awayScore:null,played:false},
 {round:9,date:"2026-10-31",time:"10:00",home:"Dynamo Podlusky",away:"TJ Slavoj Sulejovice / FK Vchynice",homeScore:null,awayScore:null,played:false},
 {round:10,date:"2026-11-07",time:"10:00",home:"Dynamo Podlusky",away:"TJ Sokol Černiv",homeScore:null,awayScore:null,played:false},
 {round:10,date:"2026-11-07",time:"10:00",home:"ASK Lovosice",away:"SK Sokol Brozany",homeScore:null,awayScore:null,played:false},
 {round:11,date:"2026-11-14",time:"10:00",home:"SK Sokol Brozany",away:"TJ Viktoria Budyně nad Ohří",homeScore:null,awayScore:null,played:false},
];
export const fallbackMatches:Match[]=fixtures;

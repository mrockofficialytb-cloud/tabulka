export type Match={home:string;away:string;homeScore:number|null;awayScore:number|null;played:boolean};
export type Team={name:string;logo?:string};
export type Scoring={win:number;draw:number;loss:number};
export type Row={name:string;logo?:string;p:number;w:number;d:number;l:number;gf:number;ga:number;gd:number;pts:number};

export const DEFAULT_SCORING:Scoring={win:3,draw:1,loss:0};

export function calculateStandings(teams:Team[],matches:Match[],scoring:Scoring=DEFAULT_SCORING):Row[]{
 const map=new Map<string,Row>();
 teams.forEach(t=>map.set(t.name,{name:t.name,logo:t.logo,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}));
 for(const m of matches){
  if(!m.played||m.homeScore===null||m.awayScore===null)continue;
  for(const n of [m.home,m.away])if(!map.has(n))map.set(n,{name:n,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0});
  const h=map.get(m.home)!;const a=map.get(m.away)!;h.p++;a.p++;h.gf+=m.homeScore;h.ga+=m.awayScore;a.gf+=m.awayScore;a.ga+=m.homeScore;
  if(m.homeScore>m.awayScore){h.w++;a.l++;h.pts+=scoring.win;a.pts+=scoring.loss}
  else if(m.homeScore<m.awayScore){a.w++;h.l++;a.pts+=scoring.win;h.pts+=scoring.loss}
  else{h.d++;a.d++;h.pts+=scoring.draw;a.pts+=scoring.draw}
 }
 for(const r of map.values())r.gd=r.gf-r.ga;
 return [...map.values()].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name,"cs"));
}
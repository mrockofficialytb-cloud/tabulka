import type { Match, Team } from "./standings";

export const sourceUrl =
  "https://www.fotbal.cz/souteze/turnaje/zapas/cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";

export const teams: Team[] = [
  { name: "TJ Viktoria Budyně nad Ohří" },
  { name: "TJ Sokol Černiv" },
  { name: "TJ Slavoj Sulejovice / FK Vchynice" },
  { name: "SK Sokol Brozany" },
  { name: "SK Velemín" },
  { name: "SK Sokol Malé Žernoseky" },
  { name: "Městský Sportovní klub Třebenice" },
  { name: "Dynamo Podlusky" },
  { name: "ASK Lovosice" },
];

// Ověřené zveřejněné výsledky. Automatický synchronizátor doplníme nad tuto datovou vrstvu.
export const matches: Match[] = [
  { home: "SK Velemín", away: "TJ Viktoria Budyně nad Ohří", homeScore: 6, awayScore: 11, played: true },
  { home: "SK Sokol Brozany", away: "ASK Lovosice", homeScore: 21, awayScore: 14, played: true },
  { home: "TJ Slavoj Sulejovice / FK Vchynice", away: "Městský Sportovní klub Třebenice", homeScore: 21, awayScore: 0, played: true },
];

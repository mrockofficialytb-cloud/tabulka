import type { Match } from "../standings";
import { fallbackMatches } from "../data";
import generated from "../../public/data/fotbal.json";

export type CompetitionFeed = {
  matches: Match[];
  source: "fotbal.cz-browser" | "fallback";
  updatedAt: string;
  error?: string;
};

type GeneratedMatch = Match & { detailUrl?: string | null };

export async function getCompetitionFeed(): Promise<CompetitionFeed> {
  const live = (generated.matches ?? []) as GeneratedMatch[];
  const played = live.filter(
    m => m.played && m.homeScore !== null && m.awayScore !== null
  );

  if (played.length >= 8 && generated.updatedAt) {
    return {
      matches: played,
      source: "fotbal.cz-browser",
      updatedAt: generated.updatedAt,
    };
  }

  return {
    matches: fallbackMatches,
    source: "fallback",
    updatedAt: new Date().toISOString(),
    error: "Automatická data ještě nebyla načtena.",
  };
}

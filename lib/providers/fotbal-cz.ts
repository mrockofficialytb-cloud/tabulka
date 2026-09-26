import type { Match } from "../standings";
import { fixtures } from "../data";
import generated from "../../public/data/fotbal.json";

export type CompetitionFeed = {
  matches: Match[];
  source: "fotbal.cz-browser" | "fallback";
  updatedAt: string;
  error?: string;
};

type GeneratedMatch = Match & { detailUrl?: string | null };

function key(home: string, away: string) {
  return home + "|" + away;
}

export async function getCompetitionFeed(): Promise<CompetitionFeed> {
  const live = (generated.matches ?? []) as GeneratedMatch[];
  const liveByFixture = new Map(live.map(m => [key(m.home, m.away), m]));

  const merged: Match[] = fixtures.map(fixture => {
    const found = liveByFixture.get(key(fixture.home, fixture.away));
    if (!found) return fixture;

    if (
      found.played &&
      found.homeScore !== null &&
      found.awayScore !== null
    ) {
      return {
        ...fixture,
        homeScore: found.homeScore,
        awayScore: found.awayScore,
        played: true,
      };
    }

    return fixture;
  });

  return {
    matches: merged,
    source: generated.updatedAt ? "fotbal.cz-browser" : "fallback",
    updatedAt: generated.updatedAt ?? new Date().toISOString(),
    error: generated.updatedAt ? undefined : "Automatická data ještě nebyla načtena.",
  };
}

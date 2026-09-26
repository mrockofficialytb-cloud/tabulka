import type { Match } from "../standings";
import { fixtures } from "../data";
import generated from "../../public/data/fotbal.json";

export type CompetitionFeed = {
  matches: Match[];
  source: "fotbal.cz-browser" | "fallback";
  updatedAt: string;
  error?: string;
};

type GeneratedMatch = Match & {
  id?: string;
  round?: number | null;
  date?: string | null;
  time?: string | null;
  status?: string | null;
};

type RenderFeed = {
  updatedAt?: string;
  matches?: GeneratedMatch[];
};

const LIVE_URL = "https://tabulka.onrender.com";

function key(home: string, away: string) {
  return home + "|" + away;
}

async function loadLiveData(): Promise<RenderFeed | null> {
  try {
    const response = await fetch(LIVE_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Render HTTP ${response.status}`);
    return (await response.json()) as RenderFeed;
  } catch (error) {
    console.error("FAČR live feed unavailable:", error);
    return null;
  }
}

export async function getCompetitionFeed(): Promise<CompetitionFeed> {
  const remote = await loadLiveData();
  const local = generated as unknown as RenderFeed;
  const live = (remote?.matches?.length ? remote.matches : local.matches ?? []) as GeneratedMatch[];
  const liveByFixture = new Map(live.map((m) => [key(m.home, m.away), m]));

  const merged: Match[] = fixtures.map((fixture) => {
    const found = liveByFixture.get(key(fixture.home, fixture.away));
    if (!found) return fixture;

    return {
      ...fixture,
      homeScore: found.homeScore,
      awayScore: found.awayScore,
      played:
        found.played &&
        found.homeScore !== null &&
        found.awayScore !== null,
    };
  });

  // Jakmile máme živý feed, je autoritativní i pro rozpis.
  // Statická fixtures slouží pouze jako fallback; tím se neztratí zápasy,
  // které dříve v ručním seznamu vůbec nebyly.
  const matches: Match[] = live.length
    ? live.map((m) => ({
        ...m,
        played: Boolean(m.played && m.homeScore !== null && m.awayScore !== null),
      }))
    : merged;

  const updatedAt = remote?.updatedAt ?? local.updatedAt ?? new Date().toISOString();

  return {
    matches,
    source: remote?.matches?.length || local.updatedAt ? "fotbal.cz-browser" : "fallback",
    updatedAt,
    error: remote?.matches?.length || local.updatedAt
      ? undefined
      : "Automatická data ještě nebyla načtena.",
  };
}

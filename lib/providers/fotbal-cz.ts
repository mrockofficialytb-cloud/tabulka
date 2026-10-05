import type { Match } from "../standings";
import { fixtures, type Fixture } from "../data";
import generated from "../../public/data/fotbal.json";

export type CompetitionFeed = {
  matches: Fixture[];
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

function canonicalTeam(name: string) {
  return name === "TJ Slavoj Sulejovice / FK Vchynice"
    ? "FK Vchynice / TJ Slavoj Sulejovice"
    : name;
}

function key(home: string, away: string) {
  return canonicalTeam(home) + "|" + canonicalTeam(away);
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

  const matches: Fixture[] = fixtures.map((fixture) => {
    const found = liveByFixture.get(key(fixture.home, fixture.away));

    const next: Fixture = {
      ...fixture,
      ...(found?.round != null ? { round: found.round } : {}),
      ...(found?.date ? { date: found.date } : {}),
      ...(found?.time ? { time: found.time } : {}),
    };

    if (found?.played && found.homeScore !== null && found.awayScore !== null) {
      next.homeScore = found.homeScore;
      next.awayScore = found.awayScore;
      next.played = true;
    }

    return next;
  });

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

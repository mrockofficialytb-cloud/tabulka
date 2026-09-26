import type { Match } from "../standings";
import { competition, fallbackMatches } from "../data";

export type CompetitionFeed = {
  matches: Match[];
  source: "fotbal.cz" | "fallback";
  updatedAt: string;
  error?: string;
};

function htmlToText(html: string) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getCompetitionFeed(): Promise<CompetitionFeed> {
  try {
    const res = await fetch(competition.sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TabulkaBrozany/1.0)",
        "Accept-Language": "cs-CZ,cs;q=0.9",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) throw new Error(`Fotbal.cz HTTP ${res.status}`);

    const html = await res.text();
    const plain = htmlToText(html);
    const known = ["SK Sokol Brozany", "ASK Lovosice", "SK Velemín", "TJ Sokol Černiv"];

    if (!known.some((name) => plain.toLowerCase().includes(name.toLowerCase()))) {
      throw new Error("Stránka neobsahuje očekávaná data soutěže");
    }

    return {
      matches: fallbackMatches,
      source: "fallback",
      updatedAt: new Date().toISOString(),
      error: "Fotbal.cz je dosažitelný; čeká se na ověření HTML parseru.",
    };
  } catch (error) {
    return {
      matches: fallbackMatches,
      source: "fallback",
      updatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Chyba načtení",
    };
  }
}

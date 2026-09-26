import { chromium } from "playwright";
import fs from "node:fs/promises";

const URL = "https://www.fotbal.cz/souteze/turnaje/zapas/cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";

const aliases = [
  ["SK Sokol Brozany", ["SK Sokol Brozany"]],
  ["ASK Lovosice", ["ASK FK Lovosice", "ASK Lovosice"]],
  ["SK Velemín", ["SK Velemín / Milešov", "SK Velemín/Milešov", "SK Velemín"]],
  ["TJ Viktoria Budyně nad Ohří", ["TJ Viktorie Budyně nad Ohří", "TJ Viktoria Budyně nad Ohří"]],
  ["TJ Sokol Černiv", ["TJ Sokol Černiv"]],
  ["TJ Slavoj Sulejovice / FK Vchynice", ["FK Vchynice / Sulejovice", "FK Vchynice/Sulejovice", "TJ Slavoj Sulejovice / FK Vchynice"]],
  ["SK Sokol Malé Žernoseky", ["SK SOKOL Malé Žernoseky", "SK Sokol Malé Žernoseky"]],
  ["Městský Sportovní klub Třebenice", ["MSK Třebenice", "Městský Sportovní klub Třebenice"]],
  ["Dynamo Podlusky", ["TJ Dynamo Podlusky", "Dynamo Podlusky"]],
];

function canonical(text) {
  const normalized = text.replace(/\s+/g, " ").trim().toLocaleLowerCase("cs-CZ");
  for (const [name, variants] of aliases) {
    for (const variant of variants) {
      if (normalized.includes(variant.toLocaleLowerCase("cs-CZ"))) return name;
    }
  }
  return null;
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    locale: "cs-CZ",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  });

  const response = await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  console.log("HTTP:", response?.status(), "URL:", page.url());

  if (!response || response.status() !== 200) {
    throw new Error(`Fotbal.cz v Chromium vrátil HTTP ${response?.status() ?? "bez odpovědi"}`);
  }

  await page.waitForSelector(".MatchRound", { timeout: 30000 });

  const raw = await page.locator(".MatchRound").evaluateAll(nodes =>
    nodes.map(node => ({
      text: (node.innerText || "").replace(/\s+/g, " ").trim(),
      href: node.querySelector('a[href*="/souteze/zapasy/zapas/"]')?.getAttribute("href") || null,
    }))
  );

  const matches = [];
  for (const item of raw) {
    const found = aliases
      .map(([name, variants]) => ({ name, pos: Math.min(...variants.map(v => {
        const p = item.text.toLocaleLowerCase("cs-CZ").indexOf(v.toLocaleLowerCase("cs-CZ"));
        return p < 0 ? Number.POSITIVE_INFINITY : p;
      })) }))
      .filter(x => Number.isFinite(x.pos))
      .sort((a, b) => a.pos - b.pos);

    if (found.length < 2) continue;
    const home = found[0].name;
    const away = found[1].name;

    const score = item.text.match(/(?:^|\s)(\d{1,2})\s*:\s*(\d{1,2})(?=\s|$)/);
    matches.push({
      home,
      away,
      homeScore: score ? Number(score[1]) : null,
      awayScore: score ? Number(score[2]) : null,
      played: Boolean(score),
      detailUrl: item.href ? new URL(item.href, URL).href : null,
    });
  }

  const unique = [...new Map(matches.map(m => [`${m.home}|${m.away}`, m])).values()];
  const played = unique.filter(m => m.played);

  if (unique.length < 1) throw new Error("Parser nenašel žádný zápas – data neukládám");

  const output = {
    source: "fotbal.cz",
    competitionId: "cb23dcde-b42b-4e12-ba8b-5344d9a32bb0",
    updatedAt: new Date().toISOString(),
    matchCount: unique.length,
    playedCount: played.length,
    matches: unique,
  };

  await fs.mkdir("public/data", { recursive: true });
  await fs.writeFile("public/data/fotbal.json", JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`OK: ${unique.length} zápasů, z toho ${played.length} s výsledkem`);
} finally {
  await browser.close();
}

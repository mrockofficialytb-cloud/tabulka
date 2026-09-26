import { chromium } from "playwright";

const COMPETITION_ID = "cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";
const LOGIN_URL = "https://is.fotbal.cz/?discipline=football";
const TARGET = `https://is.fotbal.cz/public/zapasy/prehled-zapasu.aspx?soutez=${COMPETITION_ID}&utm_source=chatgpt.com`;

const CLUBS = {
  "4230071": "TJ Viktoria Budyně nad Ohří",
  "4230121": "TJ Sokol Černiv",
  "4230381": "SK Sokol Malé Žernoseky",
  "4230721": "TJ Slavoj Sulejovice / FK Vchynice",
  "4230701": "SK Velemín",
  "4230061": "SK Sokol Brozany",
  "4230461": "Dynamo Podlusky",
  "4231011": "Městský Sportovní klub Třebenice",
  "4230351": "ASK Lovosice",
};

function parseDate(value) {
  const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2})$/);
  if (!m) return { date: null, time: null };
  return { date: `${m[3]}-${m[2]}-${m[1]}`, time: m[4] };
}

export async function scrapeCompetition() {
  const USERNAME = process.env.FACR_USERNAME;
  const PASSWORD = process.env.FACR_PASSWORD;
  if (!USERNAME || !PASSWORD) throw new Error("Chybí FACR_USERNAME nebo FACR_PASSWORD.");

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const context = await browser.newContext({ locale: "cs-CZ" });
  const page = await context.newPage();

  try {
    console.log("[FAČR] Přihlašuji...");
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });

    const password = page.locator('input[type="password"]').first();
    await password.waitFor({ state: "visible", timeout: 15000 });
    const candidates = ['input[type="email"]','input[name*="email" i]','input[name*="user" i]','input[name*="login" i]','input[type="text"]'];
    let userInput = null;
    for (const selector of candidates) {
      const el = page.locator(selector).first();
      if ((await el.count()) && (await el.isVisible().catch(() => false))) { userInput = el; break; }
    }
    if (!userInput) throw new Error("Nenašel jsem přihlašovací pole.");

    await userInput.fill(USERNAME);
    await password.fill(PASSWORD);
    const submit = page.locator('button[type="submit"],input[type="submit"],button:has-text("Přihlásit"),button:has-text("Přihlášení")').first();
    if (await submit.count()) await submit.click(); else await password.press("Enter");
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForTimeout(1000);

    // 1. vstup vytvoří legacy ASP.NET session
    await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(500);
    // 2. vstup už otevře skutečný přehled
    const response = await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (response?.status() !== 200 || !page.url().includes("/public/zapasy/prehled-zapasu.aspx")) {
      throw new Error(`FAČR přehled není dostupný, HTTP ${response?.status() ?? "?"}, URL ${page.url()}`);
    }

    const rows = await page.locator("tr").evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll("th,td")).map((td) => (td.textContent || "").trim().replace(/\s+/g, " ")))
    );

    const matches = [];
    for (const cells of rows) {
      if (!/^2026423H1B\d{4}$/.test(cells[0] || "") || cells.length < 10) continue;
      const home = CLUBS[cells[5]];
      const away = CLUBS[cells[6]];
      if (!home || !away) {
        console.warn("[FAČR] Neznámý klub:", cells[5], cells[6], cells[0]);
        continue;
      }

      const score = (cells[7] || "").match(/^(\d+)\s*:\s*(\d+)$/);
      const { date, time } = parseDate(cells[1] || "");
      matches.push({
        id: cells[0],
        round: Number(cells[3]) || null,
        date,
        time,
        home,
        away,
        homeScore: score ? Number(score[1]) : null,
        awayScore: score ? Number(score[2]) : null,
        played: Boolean(score),
        status: cells[9] || null,
      });
    }

    if (!matches.length) throw new Error("FAČR stránka neobsahuje žádná rozpoznaná utkání.");

    const data = {
      source: "is.fotbal.cz",
      competitionId: COMPETITION_ID,
      updatedAt: new Date().toISOString(),
      matchCount: matches.length,
      playedCount: matches.filter((m) => m.played).length,
      matches,
    };
    console.log(`[FAČR] OK: ${data.matchCount} utkání, ${data.playedCount} s výsledkem.`);
    return data;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const data = await scrapeCompetition();
  console.log(JSON.stringify(data, null, 2));
}

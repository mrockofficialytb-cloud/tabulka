import { chromium } from "playwright";

const COMPETITION_ID = "cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";
const LOGIN_URL = "https://is.fotbal.cz/?discipline=football";
const TARGET = `https://is.fotbal.cz/public/zapasy/prehled-zapasu.aspx?soutez=${COMPETITION_ID}&utm_source=chatgpt.com`;
const SEASON_FROM = "01.09.2026";
const SEASON_TO = "30.06.2027";

const CLUBS = {
  "4230071": "TJ Viktoria Budyně nad Ohří", "4230121": "TJ Sokol Černiv", "4230381": "SK Sokol Malé Žernoseky",
  "4230721": "FK Vchynice / TJ Slavoj Sulejovice", "4230701": "SK Velemín", "4230061": "SK Sokol Brozany",
  "4230461": "Dynamo Podlusky", "4231011": "Městský Sportovní klub Třebenice", "4230351": "ASK Lovosice",
};

function parseDate(value) {
  const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2})$/);
  return m ? { date: `${m[3]}-${m[2]}-${m[1]}`, time: m[4] } : { date: null, time: null };
}

function isClosedStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  return /uzavřen|ukončen|odehrán|dohráno|skončen|potvrzen/.test(status);
}

async function openCompetition(page) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[FAČR] Otevírám přehled soutěže, pokus ${attempt}/3...`);
      const response = await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(1200);
      if (response?.status() === 200 && page.url().includes("/public/zapasy/prehled-zapasu.aspx")) return;
      lastError = new Error(`HTTP ${response?.status() ?? "?"}, URL ${page.url()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/interrupted by another navigation/i.test(message)) lastError = error;
      await page.waitForTimeout(1000);
    }
  }
  throw new Error(`FAČR přehled není dostupný: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function setFullSeasonRange(page) {
  const from = page.locator("#MainContent_txtDatumOd");
  const to = page.locator("#MainContent_txtDatumDo");
  const search = page.locator("#btnSearch");
  await from.waitFor({ state: "visible", timeout: 10000 });
  await to.waitFor({ state: "visible", timeout: 10000 });
  await search.waitFor({ state: "visible", timeout: 10000 });
  console.log(`[FAČR] Výchozí rozsah: od=${await from.inputValue()}, do=${await to.inputValue() || "(prázdné)"}`);
  await from.fill(SEASON_FROM); await to.fill(SEASON_TO);
  console.log(`[FAČR] Nastavuji rozsah ${SEASON_FROM} – ${SEASON_TO}.`);
  console.log("[FAČR] Spouštím skutečné tlačítko Vyhledat (#btnSearch).");
  await search.click();
  await page.waitForTimeout(1500);
  const appliedFrom = await page.locator("#MainContent_txtDatumOd").inputValue().catch(() => "?");
  const appliedTo = await page.locator("#MainContent_txtDatumDo").inputValue().catch(() => "?");
  console.log(`[FAČR] Rozsah po vyhledání: od=${appliedFrom}, do=${appliedTo || "(prázdné)"}`);
  if (appliedFrom !== SEASON_FROM || appliedTo !== SEASON_TO) throw new Error(`FAČR nepřijal datumový rozsah: od=${appliedFrom}, do=${appliedTo}`);
}

export async function scrapeCompetition() {
  const USERNAME = process.env.FACR_USERNAME, PASSWORD = process.env.FACR_PASSWORD;
  if (!USERNAME || !PASSWORD) throw new Error("Chybí FACR_USERNAME nebo FACR_PASSWORD.");
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const context = await browser.newContext({ locale: "cs-CZ" });
  const page = await context.newPage();
  try {
    console.log("[FAČR] Přihlašuji...");
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    const password = page.locator('input[type="password"]').first();
    await password.waitFor({ state: "visible", timeout: 15000 });
    const selectors = ['input[type="email"]','input[name*="email" i]','input[name*="user" i]','input[name*="login" i]','input[type="text"]'];
    let userInput = null;
    for (const selector of selectors) { const el = page.locator(selector).first(); if ((await el.count()) && (await el.isVisible().catch(() => false))) { userInput = el; break; } }
    if (!userInput) throw new Error("Nenašel jsem přihlašovací pole.");
    await userInput.fill(USERNAME); await password.fill(PASSWORD);
    const submit = page.locator('button[type="submit"],input[type="submit"],button:has-text("Přihlásit"),button:has-text("Přihlášení")').first();
    if (await submit.count()) await submit.click(); else await password.press("Enter");
    await page.waitForLoadState("domcontentloaded").catch(() => {}); await page.waitForTimeout(1500);
    await openCompetition(page); await setFullSeasonRange(page);

    const allRows = [], seen = new Set();
    async function collectRows() {
      const rows = await page.locator("tr").evaluateAll((trs) => trs.map((tr) => Array.from(tr.querySelectorAll("th,td")).map((td) => (td.textContent || "").trim().replace(/\s+/g, " "))));
      for (const cells of rows) if (/^2026423H1B\d{4}$/.test(cells[0] || "") && !seen.has(cells[0])) { seen.add(cells[0]); allRows.push(cells); }
    }
    await collectRows();

    for (let pageNumber = 2; pageNumber <= 10; pageNumber++) {
      const pagerLink = page.locator("a").filter({ hasText: new RegExp(`^\\s*${pageNumber}\\s*$`) }).first();
      if (!(await pagerLink.count()) || !(await pagerLink.isVisible().catch(() => false))) {
        console.log(`[FAČR] Pager: další stránka ${pageNumber} nenalezena; celkem ${allRows.length} utkání.`); break;
      }
      console.log(`[FAČR] Pager: klikám na skutečný odkaz stránky ${pageNumber}...`);
      const before = allRows.length;
      await pagerLink.click();
      await page.waitForTimeout(1200);
      await collectRows();
      if (allRows.length === before) { console.warn(`[FAČR] Pager: stránka ${pageNumber} nepřidala žádná utkání.`); break; }
    }

    const todayCz = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const matches = [];
    for (const cells of allRows) {
      if (!/^2026423H1B\d{4}$/.test(cells[0] || "") || cells.length < 10) continue;
      const home = CLUBS[cells[5]], away = CLUBS[cells[6]]; if (!home || !away) { console.warn("[FAČR] Neznámý klub:", cells[5], cells[6], cells[0]); continue; }
      const score = (cells[7] || "").match(/^(\d+)\s*:\s*(\d+)$/), { date, time } = parseDate(cells[1] || "");
      const status = cells[9] || null;
      if (date === todayCz) console.log(`[FAČR][DIAG] ${cells[0]} ${home} - ${away}: ${JSON.stringify(cells)}`);
      const isZeroZero = Boolean(score) && Number(score[1]) === 0 && Number(score[2]) === 0;
      const hasRealScore = Boolean(score) && (!isZeroZero || isClosedStatus(status));
      if (isZeroZero && !hasRealScore) console.log(`[FAČR] ${cells[0]}: 0:0 ignoruji jako nepotvrzený stav (${status || "bez stavu"}).`);
      matches.push({ id: cells[0], round: Number(cells[3]) || null, date, time, home, away, homeScore: hasRealScore ? Number(score[1]) : null, awayScore: hasRealScore ? Number(score[2]) : null, played: hasRealScore, status });
    }
    if (!matches.length) throw new Error("FAČR stránka neobsahuje žádná rozpoznaná utkání.");
    const data = { source: "is.fotbal.cz", competitionId: COMPETITION_ID, updatedAt: new Date().toISOString(), matchCount: matches.length, playedCount: matches.filter((m) => m.played).length, matches };
    console.log(`[FAČR] OK: ${data.matchCount} utkání, ${data.playedCount} s výsledkem.`); return data;
  } finally { await browser.close(); }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) console.log(JSON.stringify(await scrapeCompetition(), null, 2));

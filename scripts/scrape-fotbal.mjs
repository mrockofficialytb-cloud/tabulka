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
  await from.waitFor({ state: "visible", timeout: 10000 });
  await to.waitFor({ state: "visible", timeout: 10000 });

  const actions = await page.locator("a, input, button").evaluateAll((els) => els.map((el) => ({
    tag: el.tagName.toLowerCase(), id: el.id || "", name: el.getAttribute("name") || "",
    text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120),
    value: (el.getAttribute("value") || "").slice(0, 120), href: (el.getAttribute("href") || "").slice(0, 300),
    onclick: (el.getAttribute("onclick") || "").slice(0, 300),
  })).filter((x) => /postback|vyhled|hledat|zobraz|filtr|datum|search/i.test(`${x.id} ${x.name} ${x.text} ${x.value} ${x.href} ${x.onclick}`)).slice(0, 40));
  console.log("[FAČR-ACTIONS] " + JSON.stringify(actions));

  console.log(`[FAČR] Výchozí rozsah: od=${await from.inputValue()}, do=${await to.inputValue() || "(prázdné)"}`);
  await from.fill(SEASON_FROM);
  await to.fill(SEASON_TO);
  console.log(`[FAČR] Nastavuji rozsah ${SEASON_FROM} – ${SEASON_TO}.`);

  // Zkusíme nejdřív skutečný ovládací prvek filtru, pokud ho DOM prozradí.
  const filterAction = actions.find((x) => /vyhled|hledat|zobraz|filtr|search/i.test(`${x.id} ${x.name} ${x.text} ${x.value}`));
  if (filterAction?.id) {
    console.log(`[FAČR] Spouštím nalezenou akci filtru #${filterAction.id}.`);
    await Promise.all([page.waitForLoadState("domcontentloaded").catch(() => {}), page.locator(`#${filterAction.id}`).click()]);
  } else {
    console.log("[FAČR] Akce filtru zatím nenalezena; diagnosticky odesílám Form1.");
    await Promise.all([page.waitForLoadState("domcontentloaded").catch(() => {}), page.locator("#Form1").evaluate((form) => HTMLFormElement.prototype.submit.call(form))]);
  }
  await page.waitForTimeout(1200);

  const appliedFrom = await page.locator("#MainContent_txtDatumOd").inputValue().catch(() => "?");
  const appliedTo = await page.locator("#MainContent_txtDatumDo").inputValue().catch(() => "?");
  console.log(`[FAČR] Rozsah po akci: od=${appliedFrom}, do=${appliedTo || "(prázdné)"}`);
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
      const pager = await page.locator("a").evaluateAll((links, wanted) => {
        const marker = `Page$${wanted}`;
        for (const a of links) { const href = a.getAttribute("href") || "", onclick = a.getAttribute("onclick") || "", text = (a.textContent || "").trim(), source = `${href} ${onclick}`; if (source.includes(marker) || text === String(wanted)) { const m = source.match(/__doPostBack\(['"]([^'"]+)['"],['"]Page\$\d+['"]\)/); return { text, target: m ? m[1] : null }; } }
        return null;
      }, pageNumber);
      if (!pager) { console.log(`[FAČR] Pager: další stránka ${pageNumber} nenalezena; celkem ${allRows.length} utkání.`); break; }
      console.log(`[FAČR] Pager: otevírám stránku ${pageNumber}...`); const before = allRows.length;
      if (pager.target) await page.evaluate(({ target, pageNumber }) => window.__doPostBack(target, `Page$${pageNumber}`), { target: pager.target, pageNumber });
      else await page.locator("a").filter({ hasText: new RegExp(`^\\s*${pageNumber}\\s*$`) }).first().click();
      await page.waitForLoadState("domcontentloaded").catch(() => {}); await page.waitForTimeout(700); await collectRows();
      if (allRows.length === before) { console.warn(`[FAČR] Pager: stránka ${pageNumber} nepřidala žádná utkání.`); break; }
    }

    const matches = [];
    for (const cells of allRows) {
      if (!/^2026423H1B\d{4}$/.test(cells[0] || "") || cells.length < 10) continue;
      const home = CLUBS[cells[5]], away = CLUBS[cells[6]]; if (!home || !away) continue;
      const score = (cells[7] || "").match(/^(\d+)\s*:\s*(\d+)$/), { date, time } = parseDate(cells[1] || "");
      matches.push({ id: cells[0], round: Number(cells[3]) || null, date, time, home, away, homeScore: score ? Number(score[1]) : null, awayScore: score ? Number(score[2]) : null, played: Boolean(score), status: cells[9] || null });
    }
    if (!matches.length) throw new Error("FAČR stránka neobsahuje žádná rozpoznaná utkání.");
    const data = { source: "is.fotbal.cz", competitionId: COMPETITION_ID, updatedAt: new Date().toISOString(), matchCount: matches.length, playedCount: matches.filter((m) => m.played).length, matches };
    console.log(`[FAČR] OK: ${data.matchCount} utkání, ${data.playedCount} s výsledkem.`); return data;
  } finally { await browser.close(); }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) console.log(JSON.stringify(await scrapeCompetition(), null, 2));

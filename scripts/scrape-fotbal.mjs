import { chromium } from "playwright";

const COMPETITION_ID = "cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";
const LOGIN_URL = "https://is.fotbal.cz/?discipline=football";
const TARGET = `https://is.fotbal.cz/public/zapasy/prehled-zapasu.aspx?soutez=${COMPETITION_ID}&utm_source=chatgpt.com`;
const SEASON_FROM = "01.09.2026";
const SEASON_TO = "30.06.2027";

const CLUBS = {
  "4230071": "TJ Viktoria Budyně nad Ohří",
  "4230121": "TJ Sokol Černiv",
  "4230381": "SK Sokol Malé Žernoseky",
  "4230721": "FK Vchynice / TJ Slavoj Sulejovice",
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

async function logFilterDiagnostics(page) {
  const diagnostic = await page.evaluate(() => {
    const safeValue = (el) => {
      const type = (el.getAttribute("type") || "").toLowerCase();
      if (type === "password" || /pass|heslo|token|secret/i.test(el.getAttribute("name") || "")) return "[redacted]";
      return (el.value || "").slice(0, 120);
    };
    const inputs = Array.from(document.querySelectorAll("input, select, button"))
      .filter((el) => {
        const haystack = `${el.id || ""} ${el.getAttribute("name") || ""} ${el.getAttribute("type") || ""} ${el.getAttribute("value") || ""} ${el.textContent || ""}`;
        return /datum|date|od|do|vyhled|hledat|zobraz|filtr|submit/i.test(haystack);
      })
      .slice(0, 30)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type") || "",
        id: el.id || "",
        name: el.getAttribute("name") || "",
        value: safeValue(el),
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        onclick: (el.getAttribute("onclick") || "").slice(0, 160),
      }));
    const forms = Array.from(document.forms).slice(0, 10).map((form) => ({
      id: form.id || "",
      name: form.getAttribute("name") || "",
      method: form.method || "",
      action: form.action || "",
    }));
    return { url: location.href, inputs, forms };
  });
  console.log("[FAČR-DIAG] " + JSON.stringify(diagnostic));
}

async function setFullSeasonRange(page) {
  if (!page.url().includes("/public/zapasy/prehled-zapasu.aspx")) throw new Error(`Datumový filtr odmítnut mimo přehled zápasů: ${page.url()}`);

  await logFilterDiagnostics(page);

  const dateInputs = page.locator('input[type="text"], input:not([type])');
  const candidates = [];
  for (let i = 0; i < await dateInputs.count(); i++) {
    const input = dateInputs.nth(i);
    if (!(await input.isVisible().catch(() => false))) continue;
    const value = await input.inputValue().catch(() => "");
    const name = await input.getAttribute("name") || "";
    const id = await input.getAttribute("id") || "";
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(value) || /datum|date/i.test(`${name} ${id}`)) candidates.push(input);
  }

  if (candidates.length < 2) {
    console.warn(`[FAČR] Nalezeno pouze ${candidates.length} datumových polí; nechávám výchozí filtr.`);
    return;
  }

  await candidates[0].fill(SEASON_FROM);
  await candidates[1].fill(SEASON_TO);
  console.log(`[FAČR] Nastavuji rozsah ${SEASON_FROM} – ${SEASON_TO}.`);

  const buttons = page.locator('input[type="submit"], button[type="submit"], button');
  let clicked = false;
  for (let i = 0; i < await buttons.count(); i++) {
    const button = buttons.nth(i);
    if (!(await button.isVisible().catch(() => false))) continue;
    const label = `${await button.getAttribute("value") || ""} ${await button.textContent().catch(() => "") || ""}`.trim();
    if (/vyhled|hledat|zobraz|filtr|načíst/i.test(label)) {
      console.log(`[FAČR] Odesílám filtr tlačítkem: ${label.slice(0, 100)}`);
      await Promise.all([page.waitForLoadState("domcontentloaded").catch(() => {}), button.click()]);
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    console.log("[FAČR] Tlačítko filtru nenalezeno, odesílám Enterem.");
    await Promise.all([page.waitForLoadState("domcontentloaded").catch(() => {}), candidates[1].press("Enter")]);
  }
  await page.waitForTimeout(1000);
  console.log(`[FAČR] Po filtru URL: ${page.url()}`);
  if (!page.url().includes("/public/zapasy/prehled-zapasu.aspx")) throw new Error(`FAČR filtr přesměroval mimo přehled zápasů: ${page.url()}`);
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
    const selectors = ['input[type="email"]','input[name*="email" i]','input[name*="user" i]','input[name*="login" i]','input[type="text"]'];
    let userInput = null;
    for (const selector of selectors) {
      const el = page.locator(selector).first();
      if ((await el.count()) && (await el.isVisible().catch(() => false))) { userInput = el; break; }
    }
    if (!userInput) throw new Error("Nenašel jsem přihlašovací pole.");
    await userInput.fill(USERNAME);
    await password.fill(PASSWORD);
    const submit = page.locator('button[type="submit"],input[type="submit"],button:has-text("Přihlásit"),button:has-text("Přihlášení")').first();
    if (await submit.count()) await submit.click(); else await password.press("Enter");
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForTimeout(1500);

    await openCompetition(page);
    await setFullSeasonRange(page);

    const allRows = [];
    const seen = new Set();
    async function collectRows() {
      const rows = await page.locator("tr").evaluateAll((trs) => trs.map((tr) => Array.from(tr.querySelectorAll("th,td")).map((td) => (td.textContent || "").trim().replace(/\s+/g, " "))));
      for (const cells of rows) if (/^2026423H1B\d{4}$/.test(cells[0] || "") && !seen.has(cells[0])) { seen.add(cells[0]); allRows.push(cells); }
    }
    await collectRows();

    for (let pageNumber = 2; pageNumber <= 10; pageNumber++) {
      const pager = await page.locator("a").evaluateAll((links, wanted) => {
        const marker = `Page$${wanted}`;
        for (const a of links) {
          const href = a.getAttribute("href") || "";
          const onclick = a.getAttribute("onclick") || "";
          const text = (a.textContent || "").trim();
          const source = `${href} ${onclick}`;
          if (source.includes(marker) || text === String(wanted)) {
            const m = source.match(/__doPostBack\(['"]([^'"]+)['"],['"]Page\$\d+['"]\)/);
            return { text, target: m ? m[1] : null };
          }
        }
        return null;
      }, pageNumber);
      if (!pager) { console.log(`[FAČR] Pager: další stránka ${pageNumber} nenalezena; celkem ${allRows.length} utkání.`); break; }
      console.log(`[FAČR] Pager: otevírám stránku ${pageNumber}...`);
      const before = allRows.length;
      if (pager.target) {
        await page.evaluate(({ target, pageNumber }) => {
          if (typeof window.__doPostBack !== "function") throw new Error("__doPostBack není dostupný.");
          window.__doPostBack(target, `Page$${pageNumber}`);
        }, { target: pager.target, pageNumber });
      } else {
        await page.locator("a").filter({ hasText: new RegExp(`^\\s*${pageNumber}\\s*$`) }).first().click();
      }
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await page.waitForTimeout(700);
      await collectRows();
      if (allRows.length === before) { console.warn(`[FAČR] Pager: stránka ${pageNumber} nepřidala žádná utkání.`); break; }
    }

    const matches = [];
    for (const cells of allRows) {
      if (!/^2026423H1B\d{4}$/.test(cells[0] || "") || cells.length < 10) continue;
      const home = CLUBS[cells[5]];
      const away = CLUBS[cells[6]];
      if (!home || !away) { console.warn("[FAČR] Neznámý klub:", cells[5], cells[6], cells[0]); continue; }
      const score = (cells[7] || "").match(/^(\d+)\s*:\s*(\d+)$/);
      const { date, time } = parseDate(cells[1] || "");
      matches.push({ id: cells[0], round: Number(cells[3]) || null, date, time, home, away, homeScore: score ? Number(score[1]) : null, awayScore: score ? Number(score[2]) : null, played: Boolean(score), status: cells[9] || null });
    }
    if (!matches.length) throw new Error("FAČR stránka neobsahuje žádná rozpoznaná utkání.");
    const data = { source: "is.fotbal.cz", competitionId: COMPETITION_ID, updatedAt: new Date().toISOString(), matchCount: matches.length, playedCount: matches.filter((m) => m.played).length, matches };
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

import { chromium } from "playwright";

const USERNAME = process.env.FACR_USERNAME;
const PASSWORD = process.env.FACR_PASSWORD;
const COMPETITION_ID = "cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";
const TARGET = `https://is.fotbal.cz/public/zapasy/prehled-zapasu.aspx?soutez=${COMPETITION_ID}`;

if (!USERNAME || !PASSWORD) {
  throw new Error("Chybí FACR_USERNAME nebo FACR_PASSWORD v GitHub Secrets.");
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  locale: "cs-CZ",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
});
const page = await context.newPage();

try {
  console.log("1/4 Otevírám IS FAČR...");
  await page.goto("https://is.fotbal.cz/?discipline=football?discipline=football", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  console.log("URL po otevření:", page.url());

  const password = page.locator('input[type="password"]').first();
  await password.waitFor({ state: "visible", timeout: 15000 });

  const userCandidates = [
    'input[type="email"]',
    'input[name*="email" i]',
    'input[name*="user" i]',
    'input[name*="login" i]',
    'input[type="text"]',
  ];

  let userInput = null;
  for (const selector of userCandidates) {
    const candidate = page.locator(selector).first();
    if (await candidate.count()) {
      if (await candidate.isVisible().catch(() => false)) {
        userInput = candidate;
        break;
      }
    }
  }
  if (!userInput) throw new Error("Nenašel jsem pole pro uživatelské jméno.");

  console.log("2/4 Vyplňuji přihlášení...");
  await userInput.fill(USERNAME);
  await password.fill(PASSWORD);

  const submit = page.locator(
    'button[type="submit"], input[type="submit"], button:has-text("Přihlásit"), button:has-text("Přihlášení")'
  ).first();

  if (await submit.count()) {
    await Promise.all([
      page.waitForLoadState("domcontentloaded").catch(() => {}),
      submit.click(),
    ]);
  } else {
    await password.press("Enter");
    await page.waitForLoadState("domcontentloaded").catch(() => {});
  }

  await page.waitForTimeout(1500);
  console.log("URL po loginu:", page.url());

  const cookies = await context.cookies("https://is.fotbal.cz");
  console.log(
    "Session cookies:",
    cookies.map((c) => c.name).filter((n) => /access|refresh|session/i.test(n)).join(", ") || "(žádné rozpoznané)"
  );

  console.log("3/4 Otevírám přehled zápasů přes odkaz...");
  const response = await page.goto(TARGET + "&utm_source=chatgpt.com", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(1000);

  const html = await page.content();
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const lower = bodyText.toLocaleLowerCase("cs-CZ");

  console.log("HTTP:", response?.status());
  console.log("Finální URL:", page.url());
  console.log("HTML length:", html.length);
  console.log("Brozany:", lower.includes("brozany"));
  console.log("Velemín:", lower.includes("velemín") || lower.includes("velemin"));
  console.log("Číslo 2026423H1B0404:", bodyText.includes("2026423H1B0404"));
  console.log("Výsledek 6:20:", /6\s*:\s*20/.test(bodyText));

  if (response?.status() !== 200) {
    throw new Error(`Přehled zápasů vrátil HTTP ${response?.status() ?? "?"}`);
  }

  if (!lower.includes("brozany")) {
    throw new Error("Přehled se načetl, ale neobsahuje očekávaná data soutěže.");
  }

  console.log("4/4 TEST OK: automatický prohlížeč se dostal k datům zápasů.");
} finally {
  await browser.close();
}

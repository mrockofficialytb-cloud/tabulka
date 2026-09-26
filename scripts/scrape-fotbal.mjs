import { chromium } from "playwright";

const USERNAME = process.env.FACR_USERNAME;
const PASSWORD = process.env.FACR_PASSWORD;
const COMPETITION_ID = "cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";
const LOGIN_URL = "https://is.fotbal.cz/?discipline=football";
const TARGET = `https://is.fotbal.cz/public/zapasy/prehled-zapasu.aspx?soutez=${COMPETITION_ID}&utm_source=chatgpt.com`;

if (!USERNAME || !PASSWORD) {
  throw new Error("Chybí FACR_USERNAME nebo FACR_PASSWORD v Environment Variables.");
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  locale: "cs-CZ",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
});
const page = await context.newPage();

function safeUrl(raw) {
  try {
    const u = new URL(raw);
    for (const key of [...u.searchParams.keys()]) {
      if (/token|code|auth|ticket|session/i.test(key)) u.searchParams.set(key, "[REDACTED]");
    }
    return u.toString();
  } catch {
    return raw;
  }
}

page.on("response", (response) => {
  const url = response.url();
  if (!url.startsWith("https://is.fotbal.cz/")) return;
  const status = response.status();
  if (status >= 300 && status < 400) {
    console.log("REDIRECT", status, safeUrl(url), "->", safeUrl(response.headers()["location"] || ""));
  }
});

try {
  console.log("1/5 Otevírám IS FAČR...");
  const loginResponse = await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log("Login HTTP:", loginResponse?.status());
  console.log("URL po otevření:", safeUrl(page.url()));

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
    if ((await candidate.count()) && (await candidate.isVisible().catch(() => false))) {
      userInput = candidate;
      break;
    }
  }
  if (!userInput) throw new Error("Nenašel jsem pole pro uživatelské jméno.");

  console.log("2/5 Přihlašuji...");
  await userInput.fill(USERNAME);
  await password.fill(PASSWORD);

  const submit = page.locator(
    'button[type="submit"], input[type="submit"], button:has-text("Přihlásit"), button:has-text("Přihlášení")'
  ).first();

  if (await submit.count()) await submit.click();
  else await password.press("Enter");

  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(1500);
  console.log("URL po loginu:", safeUrl(page.url()));

  const cookiesBefore = await context.cookies("https://is.fotbal.cz");
  console.log("Cookies před starým IS:", cookiesBefore.map(c => c.name).sort().join(", "));

  console.log("3/5 Otevírám PŘESNĚ uživatelův odkaz...");
  const response = await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1000);

  console.log("První response HTTP:", response?.status());
  console.log("Finální URL:", safeUrl(page.url()));

  const chain = [];
  let req = response?.request();
  while (req) {
    chain.unshift(safeUrl(req.url()));
    req = req.redirectedFrom();
  }
  console.log("Navigation chain:");
  chain.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));

  const cookiesAfter = await context.cookies("https://is.fotbal.cz");
  console.log("Cookies po starém IS:", cookiesAfter.map(c => c.name).sort().join(", "));

  // První vstup do /public vytvoří legacy ASP.NET session (.ASPXAUTH + ASP.NET_SessionId)
  // a vrátí nás do nového IS. Teď, když legacy session existuje, otevřeme cílovou stránku podruhé.
  console.log("3b/5 Legacy session vytvořena, otevírám přehled zápasů PODRUHÉ...");
  const secondResponse = await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1000);
  console.log("Druhý pokus HTTP:", secondResponse?.status());
  console.log("Druhý pokus finální URL:", safeUrl(page.url()));

  console.log("4/5 Hledám odkazy/přechody do starého IS na profilu...");
  const links = await page.locator('a[href]').evaluateAll((els) =>
    els.map((a) => ({ text: (a.textContent || "").trim().replace(/\s+/g, " "), href: a.href }))
      .filter((x) => /fromis|public\/|zapasy|soutez/i.test(x.href) || /zápas|soutěž|is fačr/i.test(x.text))
      .slice(0, 30)
  );
  console.log("Relevantní odkazy:", JSON.stringify(links.map(x => ({ text: x.text, href: safeUrl(x.href) })), null, 2));

  const bodyText = await page.locator("body").innerText().catch(() => "");
  const lower = bodyText.toLocaleLowerCase("cs-CZ");
  console.log("Brozany:", lower.includes("brozany"));
  console.log("Velemín:", lower.includes("velemín") || lower.includes("velemin"));
  console.log("Číslo 2026423H1B0404:", bodyText.includes("2026423H1B0404"));
  console.log("Výsledek 6:20:", /6\s*:\s*20/.test(bodyText));

  console.log("5/5 DIAGNOSTIKA HOTOVÁ.");
} finally {
  await browser.close();
}

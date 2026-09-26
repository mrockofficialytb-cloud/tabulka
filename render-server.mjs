import http from "node:http";
import { scrapeCompetition } from "./scripts/scrape-fotbal.mjs";

const PORT = Number(process.env.PORT || 10000);
const INTERVAL = 30 * 60 * 1000;

let data = null;
let lastError = null;
let running = false;

async function refresh() {
  if (running) return;
  running = true;
  try {
    const next = await scrapeCompetition();
    const previousComparable = data ? JSON.stringify(data.matches) : null;
    const nextComparable = JSON.stringify(next.matches);
    const changed = previousComparable !== nextComparable;
    data = next;
    lastError = null;
    console.log(`[SYNC] ${changed ? "Data změněna" : "Beze změny"}; další kontrola za 30 minut.`);
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    console.error("[SYNC] Chyba:", lastError);
  } finally {
    running = false;
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ ok: true, running, hasData: Boolean(data), lastError }));
  }
  if (req.url === "/refresh") {
    await refresh();
  }
  res.writeHead(data ? 200 : 503, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data || { ok: false, error: lastError || "Data se načítají." }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[SERVER] Poslouchám na portu ${PORT}`);
  refresh();
  setInterval(refresh, INTERVAL);
});

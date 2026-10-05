import { getCompetitionFeed } from "../../../../lib/providers/fotbal-cz";
import { teams } from "../../../../lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const slugs: Record<string, string> = {
  budyne: "TJ Viktoria Budyně nad Ohří",
  cerniv: "TJ Sokol Černiv",
  "vchynice-sulejovice": "FK Vchynice / TJ Slavoj Sulejovice",
  brozany: "SK Sokol Brozany",
  velemin: "SK Velemín",
  "male-zernoseky": "SK Sokol Malé Žernoseky",
  trebenice: "Městský Sportovní klub Třebenice",
  podlusky: "Dynamo Podlusky",
  lovosice: "ASK Lovosice",
};

const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
const pad = (n: number) => String(n).padStart(2, "0");
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const localStamp = (date: string, time: string) => {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(min)}00`;
};
const addMinutes = (date: string, time: string, minutes: number) => {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const value = new Date(Date.UTC(y, m - 1, d, h, min + minutes));
  return `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(value.getUTCDate())}T${pad(value.getUTCHours())}${pad(value.getUTCMinutes())}00`;
};
const uidPart = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function GET(_: Request, { params }: { params: Promise<{ team: string }> }) {
  const { team: slug } = await params;
  const team = slugs[slug];
  if (!team || !teams.some((t) => t.name === team)) {
    return new Response("Kalendář týmu nebyl nalezen.", { status: 404 });
  }

  const feed = await getCompetitionFeed();
  const matches = feed.matches.filter((m) => (m.home === team || m.away === team) && m.date);
  const updated = new Date(feed.updatedAt || Date.now());

  const events = matches.map((m) => {
    const time = m.time || "10:00";
    const opponent = m.home === team ? m.away : m.home;
    const place = m.home === team ? "Domácí hřiště" : "Hřiště soupeře";
    const result = m.played && m.homeScore !== null && m.awayScore !== null
      ? ` · Výsledek ${m.homeScore}:${m.awayScore}`
      : "";
    const uid = `goluj-${m.round}-${uidPart(m.home)}-${uidPart(m.away)}@goluj.cz`;

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${utcStamp(updated)}`,
      `LAST-MODIFIED:${utcStamp(updated)}`,
      `DTSTART;TZID=Europe/Prague:${localStamp(m.date!, time)}`,
      `DTEND;TZID=Europe/Prague:${addMinutes(m.date!, time, 90)}`,
      `SUMMARY:${esc(team + " – " + opponent)}`,
      `DESCRIPTION:${esc(`${m.round}. kolo · ${place}${result} · Góluj.cz`)}`,
      "URL:https://goluj.cz",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n");
  }).join("\r\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Goluj.cz//Muj tym//CS",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc("Góluj.cz – " + team)}`,
    "X-WR-TIMEZONE:Europe/Prague",
    "REFRESH-INTERVAL;VALUE=DURATION:PT30M",
    "X-PUBLISHED-TTL:PT30M",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="goluj-${slug}.ics"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

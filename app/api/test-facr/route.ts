import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const COMPETITION_ID = "cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";
const IS_URL =
  "https://is.fotbal.cz/public/zapasy/prehled-zapasu.aspx?soutez=" +
  COMPETITION_ID;

export async function GET() {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(IS_URL, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8",
      },
    });

    const html = await response.text();
    const lower = html.toLocaleLowerCase("cs-CZ");

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      elapsedMs: Date.now() - started,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      length: html.length,
      competitionIdFound: html.includes(COMPETITION_ID),
      brozanyFound: lower.includes("brozany"),
      velemínFound: lower.includes("velemín") || lower.includes("velemin"),
      preview: html.replace(/\s+/g, " ").slice(0, 500),
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    return NextResponse.json(
      {
        ok: false,
        elapsedMs: Date.now() - started,
        error: err.name,
        message: err.message,
        cause:
          err.cause && typeof err.cause === "object"
            ? String((err.cause as { code?: unknown }).code ?? "")
            : null,
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

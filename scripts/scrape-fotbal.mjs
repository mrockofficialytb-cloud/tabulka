import fs from "node:fs/promises";

const COMPETITION_ID = "cb23dcde-b42b-4e12-ba8b-5344d9a32bb0";
const URL = "https://is.fotbal.cz/public/zapasy/prehled-zapasu.aspx?soutez=" + COMPETITION_ID;

const response = await fetch(URL, {
  redirect: "follow",
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; Tabulka/1.0)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8"
  }
});

const html = await response.text();
const lower = html.toLowerCase();

const titleStart = lower.indexOf("<title");
const titleOpenEnd = titleStart >= 0 ? lower.indexOf(">", titleStart) : -1;
const titleEnd = titleOpenEnd >= 0 ? lower.indexOf("</title>", titleOpenEnd) : -1;
const title = titleOpenEnd >= 0 && titleEnd >= 0
  ? html.slice(titleOpenEnd + 1, titleEnd).replaceAll("\n", " ").replaceAll("\r", " ").trim()
  : "(bez title)";

console.log("HTTP:", response.status, "URL:", response.url);
console.log("Content-Type:", response.headers.get("content-type"));
console.log("Length:", html.length);
console.log("Title:", title);
console.log("Competition UUID in body:", html.includes(COMPETITION_ID));
console.log("Brozany in body:", lower.includes("brozany"));

if (!response.ok) {
  throw new Error("IS FAČR vrátil HTTP " + response.status);
}

if (html.length < 1000) {
  throw new Error("IS FAČR vrátil podezřele krátkou odpověď");
}

console.log("TEST OK: veřejný IS FAČR je z GitHub Actions dostupný.");

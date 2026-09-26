const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 10000;
const TARGET = "https://is.fotbal.cz/?discipline=football";

function testFacr() {
  return new Promise((resolve) => {
    const started = Date.now();

    const req = https.get(
      TARGET,
      {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 Render connectivity test",
          Accept: "text/html,application/xhtml+xml",
        },
      },
      (res) => {
        let bytes = 0;
        res.on("data", (chunk) => {
          bytes += chunk.length;
        });
        res.on("end", () => {
          resolve({
            ok: true,
            status: res.statusCode,
            location: res.headers.location || null,
            bytes,
            elapsedMs: Date.now() - started,
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Connection timed out after 15 seconds"));
    });

    req.on("error", (error) => {
      resolve({
        ok: false,
        error: error.message,
        code: error.code || null,
        elapsedMs: Date.now() - started,
      });
    });
  });
}

const server = http.createServer(async (_req, res) => {
  const result = await testFacr();

  res.writeHead(result.ok ? 200 : 502, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });

  res.end(
    JSON.stringify(
      {
        target: TARGET,
        testedAt: new Date().toISOString(),
        ...result,
      },
      null,
      2
    )
  );
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Render test server listening on port ${PORT}`);
  console.log(`Testing connectivity to ${TARGET}`);
});

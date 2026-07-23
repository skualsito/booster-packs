import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the HitShelf marketplace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>HitShelf \| TCG Boosters<\/title>/i);
  assert.match(html, /Marketplace de boosters TCG/);
  assert.match(html, /Grand Line Chase/);
  assert.match(html, /Kanto Vault/);
  assert.match(html, /Planeswalker Relics/);
  assert.match(html, /Cross-TCG Jackpot/);
  assert.match(html, /Odds publicados/);
  assert.match(html, /Precio sugerido/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /\/og\.png/);
  assert.doesNotMatch(
    html,
    /Codex|codex-preview|react-loading-skeleton|_sites-preview/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
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

test("server-renders the Pullario marketplace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Cajas TCG con probabilidades visibles \| Pullario<\/title>/i,
  );
  assert.match(html, /Abrir cajas TCG/);
  assert.match(html, /Romance Dawn Chase/);
  assert.match(html, /Kanto Vault/);
  assert.match(html, /Cross-TCG Jackpot/);
  assert.match(html, /Cajas disponibles/);
  assert.match(html, /Registrarse/);
  assert.match(html, /Un unico vendedor/);
  assert.doesNotMatch(html, /Crear shop|Nombre del shop|Ver shop/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /\/og\.png/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /manifest\.webmanifest/);
  assert.doesNotMatch(
    html,
    /Codex|codex-preview|react-loading-skeleton|_sites-preview/,
  );
});

test("server-renders dedicated pages", async () => {
  const pack = await render("/packs/demo-kanto");
  assert.equal(pack.status, 200);
  assert.match(await pack.text(), /Contenidos de la caja/);

  const cards = await render("/cards");
  assert.equal(cards.status, 200);
  assert.match(await cards.text(), /Buscador de cartas/);

  const admin = await render("/admin");
  assert.equal(admin.status, 200);
  assert.match(await admin.text(), /Administrador local/);

  const stock = await render("/admin/stock");
  assert.equal(stock.status, 200);
  const stockHtml = await stock.text();
  assert.match(stockHtml, /Carga cartas y productos sellados al stock/);

  const profile = await render("/profile");
  assert.equal(profile.status, 200);
  assert.match(await profile.text(), /Cuenta local/);

});

test("serves SEO metadata routes", async () => {
  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: http:\/\/localhost:3000\/sitemap\.xml/);

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /<loc>http:\/\/localhost:3000\/<\/loc>/);
  assert.match(sitemapXml, /<loc>http:\/\/localhost:3000\/cards<\/loc>/);

  const manifest = await render("/manifest.webmanifest");
  assert.equal(manifest.status, 200);
  assert.match(await manifest.text(), /"name":\s*"Pullario"/);
});

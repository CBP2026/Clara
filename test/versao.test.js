const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

test("versão mostrada na app (index.html) é igual à do cache do service worker (sw.js)", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const sw = fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8");
  const a = html.match(/const APP_VERSAO = "(v\d+)"/)[1];
  const b = sw.match(/const CACHE = "clara-(v\d+)"/)[1];
  assert.equal(a, b, "mude APP_VERSAO e CACHE juntos");
});

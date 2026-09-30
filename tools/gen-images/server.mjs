// Local image generator: serves the UI, proxies to OpenAI, saves PNGs to ../../assets/
// Run: node server.mjs   (Node 18+, no dependencies). Key stays on this machine.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "../../assets");
const PORT = process.env.PORT || 5174;
const MODEL = process.env.IMAGE_MODEL || "gpt-image-1";

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "Content-Type": type });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = (req) =>
  new Promise((ok) => {
    let s = "";
    req.on("data", (c) => (s += c));
    req.on("end", () => ok(JSON.parse(s || "{}")));
  });

http
  .createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/") {
        return send(res, 200, await fs.readFile(path.join(here, "index.html")), "text/html; charset=utf-8");
      }
      if (req.method === "GET" && req.url.startsWith("/assets/")) {
        const file = path.join(OUT, path.basename(req.url.split("?")[0]));
        return send(res, 200, await fs.readFile(file), "image/png");
      }
      if (req.method === "POST" && req.url === "/generate") {
        const { key, slot, prompt, size, quality, background } = await readBody(req);
        const apiKey = key || process.env.OPENAI_API_KEY;
        if (!apiKey) return send(res, 400, { error: "Thiếu OpenAI API key" });
        const r = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: MODEL, prompt, size, quality, background, output_format: "png", n: 1 }),
        });
        const j = await r.json();
        if (!r.ok) return send(res, r.status, { error: j.error?.message || "OpenAI error" });
        await fs.mkdir(OUT, { recursive: true });
        const name = `${slot.replace(/[^a-z0-9-]/gi, "-")}-${Date.now()}.png`;
        await fs.writeFile(path.join(OUT, name), Buffer.from(j.data[0].b64_json, "base64"));
        return send(res, 200, { file: name, url: `/assets/${name}` });
      }
      send(res, 404, { error: "not found" });
    } catch (e) {
      send(res, 500, { error: String(e.message || e) });
    }
  })
  .listen(PORT, "127.0.0.1", () => console.log(`Mở http://localhost:${PORT}  (ảnh lưu vào ${OUT})`));

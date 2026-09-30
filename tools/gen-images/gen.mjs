// CLI for Claude: node tools/gen-images/gen.mjs "<prompt>" <name> [size] [quality] [background]
// Reads OPENAI_API_KEY from the environment. Saves assets/<name>.png
import fs from "node:fs/promises";
import path from "node:path";
const [prompt, name, size = "1024x1024", quality = "medium", background = "auto"] = process.argv.slice(2);
if (!prompt || !name) { console.error('usage: gen.mjs "<prompt>" <name> [size] [quality] [background]'); process.exit(1); }
if (!process.env.OPENAI_API_KEY) { console.error("OPENAI_API_KEY not set"); process.exit(1); }
const r = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  body: JSON.stringify({ model: process.env.IMAGE_MODEL || "gpt-image-1", prompt, size, quality, background, output_format: "png", n: 1 }),
});
const j = await r.json();
if (!r.ok) { console.error(j.error?.message || r.status); process.exit(1); }
const dir = path.resolve(import.meta.dirname, "../../assets");
await fs.mkdir(dir, { recursive: true });
const file = path.join(dir, `${name}.png`);
await fs.writeFile(file, Buffer.from(j.data[0].b64_json, "base64"));
console.log(file);

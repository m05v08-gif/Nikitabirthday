import { writeFile } from "node:fs/promises";
import { makeManifest } from "./queries.js";

const outPath = new URL("../../data/stylist/manifest.json", import.meta.url);

await writeFile(outPath, JSON.stringify(makeManifest(), null, 2), "utf8");
console.log(`Wrote ${outPath.pathname}`);


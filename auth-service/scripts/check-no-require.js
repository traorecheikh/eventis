import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

function walk(dir) {
    const offenders = [];

    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);

        if (statSync(full).isDirectory()) {
            offenders.push(...walk(full));
        } else if (entry.endsWith(".js") && /\brequire\(/.test(readFileSync(full, "utf8"))) {
            offenders.push(full);
        }
    }

    return offenders;
}

const offenders = walk("src");

if (offenders.length > 0) {
    console.error("require() interdit, utiliser import (voir AGENTS.md) :");
    offenders.forEach((file) => console.error(` - ${file}`));
    process.exit(1);
}

console.log("OK : aucun require() dans src/.");

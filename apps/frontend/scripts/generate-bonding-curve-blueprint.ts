import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

try {
  // Check if .env file already exists
  if (!existsSync("src/lib/bonding-curve.lua")) {
    console.error("🚨 File src/lib/bonding-curve.lua not found");
    process.exit(-1);
  }

  const file = await readFile("src/lib/bonding-curve.lua", "utf-8");

  const fileEscaped = file.replace(/"/g, "\"");

  const blueprint = `export const BONDING_CURVE_BLUEPRINT = \`\n${fileEscaped}\`\n`;
  
  await writeFile("src/components/app/bonding-curve/bonding-curve-blueprint.ts", blueprint);
} catch (error) {
  console.error("Error:", error);
}

import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dryrun } from "@permaweb/aoconnect";

// CONSTANTS
const environments: Record<"staging" | "production", string> = {
  staging: "ju7evX0oEl4X1W7-3gxsq4uMdjUOHXYMUp_VvWgw90k",
  production: "iZuNCnURIQHazG9cIui2B5FdQzWRE8TMa28i6nHr5ic",
};

const VITE_ENV = process.env.VITE_ENV as "staging" | "production" | undefined;

// Validate the VITE_ENV environment variable
const REGISTRY_PROCESS =
  !VITE_ENV || !["staging", "production"].includes(VITE_ENV)
    ? environments.staging
    : environments[VITE_ENV];

if (!VITE_ENV) {
  console.warn(
    "VITE_ENV environment variable not found.\nUsing staging as the default environment."
  );
}

console.warn(`Registry process: ${REGISTRY_PROCESS}`);

try {
  // Check if .env file already exists
  if (existsSync(".env")) {
    console.error("⚠️ .env file already exists. Please remove it first.");
    process.exit(-1);
  }

  // Fetch the environment variables from the process registry
  console.log("🚀 Fetching environment variables from the process registry...");

  const response = await dryrun({
    process: REGISTRY_PROCESS,
    tags: [{ name: "Action", value: "Info" }],
  });

  const envVariables: {
    key: string;
    value: string;
  }[] = [
    {
      key: "VITE_ENV",
      value: VITE_ENV || "staging",
    },
    {
      key: "VITE_REGISTRY_PROCESS",
      value: REGISTRY_PROCESS,
    },
    {
      key: "VITE_HB_NODE_URL",
      value: "https://hb.zoao.dev"
    }
  ];

  // Check if jsonAswer has an array Messages and that the first message contains a Data field
  // then parse the Data field, transform the keys to SCREAMING_SNAKE_CASE and save them to .env
  if (response.Messages?.[0]?.Data) {
    const data = JSON.parse(response.Messages[0].Data) as Record<
      string,
      string
    >;

    for (const [key, value] of Object.entries(data)) {
      // transform key from camelCase to SCREAMING_SNAKE_CASE
      const transformedKey = key
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .toUpperCase();

      // Skip ACTION key
      if (transformedKey === "ACTION") {
        continue;
      }

      envVariables.push({ key: `VITE_${transformedKey}`, value });
    }

    const envFile = envVariables
      .map(({ key, value }) => `${key}=${value}`)
      .join("\n");

    await writeFile(".env", envFile);

    console.log("🚀 Environment variables saved to .env");
  } else {
    console.error("No data found");
  }
} catch (error) {
  console.error("Error:", error);
}

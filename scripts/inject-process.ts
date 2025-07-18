import { readFile, writeFile } from "node:fs/promises";
import { parse } from "yaml";

// read processes file
const configFile = process.env.CONFIG_FILE;
const processFile = await readFile(`./${configFile}`, "utf-8");
const parsedProcessFile = parse(processFile);

// get ProcessName from parsedProcessFile
const processName = parsedProcessFile[0].name;

// read state file
const stateFile = await readFile(`./state-${configFile}`, "utf-8");
const parsedStateFile = parse(stateFile);

// get processId
const registryProcessId = parsedStateFile[processName].processId;

// write process id to process.ts
const formatted = `export const REGISTRY_PROCESS = "${registryProcessId}";`;

await writeFile("./apps/frontend/src/config/registry_process.ts", formatted);

import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import validateEnv from "./src/validate-env";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  validateEnv(env);

  return {
    plugins: [
      react(),
      nodePolyfills({
        include: ["crypto", "stream"],
      }) as PluginOption,
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      global: "globalThis",
    },
  };
});

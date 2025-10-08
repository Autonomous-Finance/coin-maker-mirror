import { type ErrorMessageOptions, generateErrorMessage } from "zod-error";
import { z } from "zod";

// Define the schema as an object with all of the env
// variables and their types
export const envSchema = z.object({
  VITE_APP_VER: z.string(),
  VITE_GIT_HASH: z.string(),
  VITE_ENV: z
    .union([z.literal("staging"), z.literal("production")])
    .default("staging"),
  VITE_TOKEN_FACTORY_PROCESS: z.string(),
  VITE_AMM_FACTORY_PROCESS: z.string(),
  VITE_TOKEN_LOCKER_PROCESS: z.string(),
  VITE_PAYMENT_TOKEN_PROCESS: z.string(),
  VITE_DEXI_PROCESS: z.string(),
  VITE_WRAPPED_AR_PROCESS: z.string(),
  VITE_QAR_PROCESS: z.string(),
  VITE_HB_NODE_URL: z.string().url().default("https://hb.zoao.dev"),
});

const options: ErrorMessageOptions = {
  delimiter: {
    error: "",
  },
  transform: ({ errorMessage, index }) =>
    `🔥 Error #${index + 1}: ${errorMessage} \n`,
};

export default function validateEnv(env: Record<string, string>) {
  try {
    const result = envSchema.safeParse(env);

    if (!result.success) {
      const errorMessage = generateErrorMessage(result.error.issues, options);
      throw new Error(errorMessage);
    }

    console.log("🚀 Environment variables are valid!");
    console.log("🔥 VITE_ENV:", result.data.VITE_ENV);
    console.log("\nVITE_APP_VER:", JSON.stringify(result.data.VITE_APP_VER));
    console.log("VITE_GIT_HASH:", result.data.VITE_GIT_HASH);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    console.info(
      "Maybe you forgot to set the environment variables? 🤔 npm run generate-env"
    );
    process.exit(0);
  }
}

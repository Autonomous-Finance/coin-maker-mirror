import { envSchema } from "@/validate-env";

const ENV = envSchema.parse(import.meta.env);

export default ENV;

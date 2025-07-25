import Fastify from "fastify";
import cors from "@fastify/cors";
import env from "@fastify/env";
import rateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify";

// Environment schema
const envSchema = {
  type: "object",
  required: ["PORT"],
  properties: {
    PORT: { type: "string", default: "3000" },
    NODE_ENV: { type: "string", default: "development" },
    TEMPO_API_TOKEN: { type: "string" },
    JIRA_BASE_URL: { type: "string" },
    JIRA_EMAIL: { type: "string" },
    JIRA_API_TOKEN: { type: "string" },
    GEMINI_API_KEY: { type: "string" },
    AI_PROVIDER: { type: "string" },
    AWS_REGION: { type: "string" },
    AWS_ACCESS_KEY_ID: { type: "string" },
    AWS_SECRET_ACCESS_KEY: { type: "string" },
    BEDROCK_MODEL_ID: { type: "string" },
  },
};

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: true,
  });

  // Register plugins
  await fastify.register(env, {
    schema: envSchema,
    dotenv: true,
  });

  await fastify.register(cors, {
    origin: ["http://localhost:4200"], // Angular dev server
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Register routes
  await fastify.register(require("./routes/insights"));
  await fastify.register(require("./routes/health"));

  return fastify;
}

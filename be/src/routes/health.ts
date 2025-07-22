import { FastifyInstance } from "fastify";
import { tempoService } from "../services/tempo.service";
import { jiraService } from "../services/jira.service";
import { AIServiceFactory } from "../services/aiServiceFactory";

interface HealthCheck {
  status: string;
  message: string;
  provider?: string;
}

interface HealthChecks {
  backend: HealthCheck;
  tempo: HealthCheck;
  jira: HealthCheck;
  ai: HealthCheck;
}

async function checkTempoHealth(): Promise<HealthCheck> {
  try {
    await tempoService.getTeamData();
    return { status: "healthy", message: "Tempo API is accessible" };
  } catch {
    return {
      status: "error",
      message:
        "Tempo API connection failed. Check TEMPO_API_TOKEN in .env file",
    };
  }
}

async function checkJiraHealth(): Promise<HealthCheck> {
  try {
    await jiraService.getUserData();
    return { status: "healthy", message: "JIRA API is accessible" };
  } catch {
    return {
      status: "error",
      message:
        "JIRA API connection failed. Check JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env file",
    };
  }
}

async function checkAIHealth(): Promise<HealthCheck> {
  try {
    const aiService = AIServiceFactory.create();
    await aiService.generateInsights("test", {});
    return buildHealthyResponse();
  } catch {
    return buildErrorResponse();
  }
}

function buildHealthyResponse(): HealthCheck {
  const provider = process.env.AI_PROVIDER || "gemini";
  return { 
    status: "healthy", 
    message: `${provider.toUpperCase()} AI service is accessible`,
    provider: provider.toUpperCase()
  };
}

function buildErrorResponse(): HealthCheck {
  const provider = process.env.AI_PROVIDER || "gemini";
  const envVars = getRequiredEnvVars(provider);
  return {
    status: "error",
    message: `${provider.toUpperCase()} AI connection failed. Check ${envVars} in .env file`,
    provider: provider.toUpperCase()
  };
}

function getRequiredEnvVars(provider: string): string {
  return provider === "bedrock" 
    ? "AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY"
    : "GEMINI_API_KEY";
}

function determineOverallStatus(checks: HealthChecks): string {
  const isHealthy = Object.values(checks).every(
    (check) => check.status === "healthy",
  );
  return isHealthy ? "healthy" : "degraded";
}

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    const checks: HealthChecks = {
      backend: { status: "healthy", message: "Backend is running" },
      tempo: await checkTempoHealth(),
      jira: await checkJiraHealth(),
      ai: await checkAIHealth(),
    };

    return {
      status: determineOverallStatus(checks),
      timestamp: new Date().toISOString(),
      checks,
    };
  });
}

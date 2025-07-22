import { buildServer } from "../server";
import { FastifyInstance } from "fastify";
import { tempoService } from "../services/tempo.service";
import { jiraService } from "../services/jira.service";
import { AIServiceFactory } from "../services/aiServiceFactory";

jest.mock("../services/tempo.service");
jest.mock("../services/jira.service");
jest.mock("../services/aiServiceFactory");

describe("Health Routes", () => {
  let server: FastifyInstance;
  const mockTempoService = tempoService as jest.Mocked<typeof tempoService>;
  const mockJiraService = jiraService as jest.Mocked<typeof jiraService>;
  const mockAIServiceFactory = AIServiceFactory as jest.Mocked<typeof AIServiceFactory>;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return healthy status when all APIs are accessible", async () => {
    mockTempoService.getTeamData.mockResolvedValue({ teams: [] });
    mockJiraService.getUserData.mockResolvedValue({ displayName: "Test User" });
    mockAIServiceFactory.create.mockReturnValue({
      generateInsights: jest.fn().mockResolvedValue("Test response"),
    } as any);

    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    const result = JSON.parse(response.body);
    expect(result.status).toBe("healthy");
    expect(result.checks.backend.status).toBe("healthy");
    expect(result.checks.tempo.status).toBe("healthy");
    expect(result.checks.jira.status).toBe("healthy");
    expect(result.checks.ai.status).toBe("healthy");
  });

  it("should return degraded status when Tempo API fails", async () => {
    mockTempoService.getTeamData.mockRejectedValue(new Error("API Error"));
    mockJiraService.getUserData.mockResolvedValue({ displayName: "Test User" });
    mockAIServiceFactory.create.mockReturnValue({
      generateInsights: jest.fn().mockResolvedValue("Test response"),
    } as any);

    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    const result = JSON.parse(response.body);
    expect(result.status).toBe("degraded");
    expect(result.checks.tempo.status).toBe("error");
    expect(result.checks.tempo.message).toBe(
      "Tempo API connection failed. Check TEMPO_API_TOKEN in .env file",
    );
  });

  it("should return degraded status when JIRA API fails", async () => {
    mockTempoService.getTeamData.mockResolvedValue({ teams: [] });
    mockJiraService.getUserData.mockRejectedValue(new Error("API Error"));
    mockAIServiceFactory.create.mockReturnValue({
      generateInsights: jest.fn().mockResolvedValue("Test response"),
    } as any);

    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    const result = JSON.parse(response.body);
    expect(result.status).toBe("degraded");
    expect(result.checks.jira.status).toBe("error");
    expect(result.checks.jira.message).toBe(
      "JIRA API connection failed. Check JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env file",
    );
  });

  it("should return degraded status when AI service fails", async () => {
    mockTempoService.getTeamData.mockResolvedValue({ teams: [] });
    mockJiraService.getUserData.mockResolvedValue({ displayName: "Test User" });
    mockAIServiceFactory.create.mockReturnValue({
      generateInsights: jest.fn().mockRejectedValue(new Error("AI Error")),
    } as any);

    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    const result = JSON.parse(response.body);
    expect(result.status).toBe("degraded");
    expect(result.checks.ai.status).toBe("error");
    expect(result.checks.ai.message).toContain("AI connection failed");
  });

  it("should return bedrock-specific error message when bedrock provider fails", async () => {
    process.env.AI_PROVIDER = "bedrock";
    
    mockTempoService.getTeamData.mockResolvedValue({ teams: [] });
    mockJiraService.getUserData.mockResolvedValue({ displayName: "Test User" });
    mockAIServiceFactory.create.mockReturnValue({
      generateInsights: jest.fn().mockRejectedValue(new Error("Bedrock Error")),
    } as any);

    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    const result = JSON.parse(response.body);
    expect(result.status).toBe("degraded");
    expect(result.checks.ai.status).toBe("error");
    expect(result.checks.ai.message).toContain("BEDROCK AI connection failed");
    expect(result.checks.ai.message).toContain("AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY");
  });
});

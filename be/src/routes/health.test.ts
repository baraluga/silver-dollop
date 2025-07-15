import { buildServer } from '../server';
import { FastifyInstance } from 'fastify';
import { tempoService } from '../services/tempo.service';
import { jiraService } from '../services/jira.service';
import { GeminiService } from '../services/gemini.service';

jest.mock('../services/tempo.service');
jest.mock('../services/jira.service');
jest.mock('../services/gemini.service');

describe('Health Routes', () => {
  let server: FastifyInstance;
  const mockTempoService = tempoService as jest.Mocked<typeof tempoService>;
  const mockJiraService = jiraService as jest.Mocked<typeof jiraService>;
  const mockGeminiService = GeminiService as jest.MockedClass<typeof GeminiService>;

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

  it('should return healthy status when all APIs are accessible', async () => {
    mockTempoService.getTeamData.mockResolvedValue({ teams: [] });
    mockJiraService.getUserData.mockResolvedValue({ displayName: 'Test User' });
    mockGeminiService.mockImplementation(() => ({
      generateInsights: jest.fn().mockResolvedValue('Test response')
    } as any));

    const response = await server.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.body);
    expect(result.status).toBe('healthy');
    expect(result.checks.backend.status).toBe('healthy');
    expect(result.checks.tempo.status).toBe('healthy');
    expect(result.checks.jira.status).toBe('healthy');
    expect(result.checks.gemini.status).toBe('healthy');
  });

  it('should return degraded status when Tempo API fails', async () => {
    mockTempoService.getTeamData.mockRejectedValue(new Error('API Error'));
    mockJiraService.getUserData.mockResolvedValue({ displayName: 'Test User' });

    const response = await server.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.body);
    expect(result.status).toBe('degraded');
    expect(result.checks.tempo.status).toBe('error');
    expect(result.checks.tempo.message).toBe('Tempo API connection failed. Check TEMPO_API_TOKEN in .env file');
  });

  it('should return degraded status when JIRA API fails', async () => {
    mockTempoService.getTeamData.mockResolvedValue({ teams: [] });
    mockJiraService.getUserData.mockRejectedValue(new Error('API Error'));

    const response = await server.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.body);
    expect(result.status).toBe('degraded');
    expect(result.checks.jira.status).toBe('error');
    expect(result.checks.jira.message).toBe('JIRA API connection failed. Check JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env file');
  });

  it('should return degraded status when Gemini API fails', async () => {
    mockTempoService.getTeamData.mockResolvedValue({ teams: [] });
    mockJiraService.getUserData.mockResolvedValue({ displayName: 'Test User' });
    mockGeminiService.mockImplementation(() => {
      throw new Error('GEMINI_API_KEY is required');
    });

    const response = await server.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.body);
    expect(result.status).toBe('degraded');
    expect(result.checks.gemini.status).toBe('error');
    expect(result.checks.gemini.message).toBe('Gemini AI connection failed. Check GEMINI_API_KEY in .env file');
  });
});
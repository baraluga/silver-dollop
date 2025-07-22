import { AIServiceFactory } from '../../services/aiServiceFactory';
import { GeminiService } from '../../services/gemini.service';
import { BedrockService } from '../../services/bedrock.service';
import { processQueryWithAI } from '../../services/aiInsightStrategy';

// Mock the services first
jest.mock('../../services/gemini.service');
jest.mock('../../services/bedrock.service');
jest.mock('@google/generative-ai');
jest.mock('@aws-sdk/client-bedrock-runtime');

// Mock the dependencies that aiInsightStrategy needs
jest.mock('../../services/team-data.service', () => ({
  teamDataService: {
    getTeamInsights: jest.fn().mockResolvedValue({
      availability: { userAvailabilities: [] },
      billability: { userBillabilities: [] },
      worklogs: [],
      period: { from: '2023-01-01', to: '2023-01-07' },
      trend: {}
    })
  }
}));

jest.mock('../../services/jira.service', () => ({
  jiraService: {
    getUsersByAccountIds: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('../../services/project-insights.service', () => ({
  ProjectInsightsService: jest.fn().mockImplementation(() => ({
    generateProjectInsights: jest.fn().mockReturnValue({})
  }))
}));

const mockGeminiService = GeminiService as jest.MockedClass<typeof GeminiService>;
const mockBedrockService = BedrockService as jest.MockedClass<typeof BedrockService>;

describe('AI Provider Switching Integration', () => {
  const originalEnv = process.env;
  
  const mockInsightResponse = JSON.stringify({
    title: 'Test Insight',
    summary: 'This is a test insight',
    insights: ['Insight 1', 'Insight 2', 'Insight 3'],
    thoughtProcess: 'This is how I arrived at the insight'
  });

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { 
      ...originalEnv,
      GEMINI_API_KEY: 'test-gemini-key',
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'test-aws-key',
      AWS_SECRET_ACCESS_KEY: 'test-aws-secret'
    };

    mockGeminiService.prototype.generateInsights = jest.fn()
      .mockResolvedValue(mockInsightResponse);
    
    mockBedrockService.prototype.generateInsights = jest.fn()
      .mockResolvedValue(mockInsightResponse);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Service Factory Provider Selection', () => {
    it('should create GeminiService when AI_PROVIDER is gemini', () => {
      process.env.AI_PROVIDER = 'gemini';
      const service = AIServiceFactory.create();
      expect(service).toBeInstanceOf(GeminiService);
    });

    it('should create BedrockService when AI_PROVIDER is bedrock', () => {
      process.env.AI_PROVIDER = 'bedrock';
      const service = AIServiceFactory.create();
      expect(service).toBeInstanceOf(BedrockService);
    });

    it('should default to GeminiService when AI_PROVIDER is not set', () => {
      delete process.env.AI_PROVIDER;
      const service = AIServiceFactory.create();
      expect(service).toBeInstanceOf(GeminiService);
    });
  });

  describe('End-to-End Provider Switching', () => {
    it('should use GeminiService for insights when provider is gemini', async () => {
      process.env.AI_PROVIDER = 'gemini';
      
      const result = await processQueryWithAI('test query');
      
      expect(mockGeminiService.prototype.generateInsights).toHaveBeenCalledWith(
        'test query',
        expect.any(Object)
      );
      expect(mockBedrockService.prototype.generateInsights).not.toHaveBeenCalled();
      
      expect(result.title).toBe('Test Insight');
      expect(result.summary).toBe('This is a test insight');
      expect(result.insights).toHaveLength(3);
    });

    it('should use BedrockService for insights when provider is bedrock', async () => {
      process.env.AI_PROVIDER = 'bedrock';
      
      const result = await processQueryWithAI('test query');
      
      expect(mockBedrockService.prototype.generateInsights).toHaveBeenCalledWith(
        'test query',
        expect.any(Object)
      );
      expect(mockGeminiService.prototype.generateInsights).not.toHaveBeenCalled();
      
      expect(result.title).toBe('Test Insight');
      expect(result.summary).toBe('This is a test insight');
      expect(result.insights).toHaveLength(3);
    });
  });

  describe('Provider Interface Consistency', () => {
    const testCases = [
      { provider: 'gemini', service: mockGeminiService },
      { provider: 'bedrock', service: mockBedrockService }
    ];

    testCases.forEach(({ provider, service }) => {
      describe(`${provider} provider`, () => {
        beforeEach(() => {
          process.env.AI_PROVIDER = provider;
        });

        it('should call generateInsights with correct parameters', async () => {
          await processQueryWithAI('test query with context');

          expect(service.prototype.generateInsights).toHaveBeenCalledWith(
            'test query with context',
            expect.objectContaining({
              availabilityData: expect.any(Object),
              billabilityData: expect.any(Object),
              userDirectory: expect.any(Object)
            })
          );
        });

        it('should return consistent response format', async () => {
          const result = await processQueryWithAI('test query');

          expect(result).toMatchObject({
            title: expect.any(String),
            summary: expect.any(String),
            insights: expect.any(Array),
            timestamp: expect.any(String)
          });
          
          if (result.thoughtProcess) {
            expect(result.thoughtProcess).toEqual(expect.any(String));
          }
        });

        it('should handle errors gracefully', async () => {
          service.prototype.generateInsights.mockRejectedValueOnce(
            new Error('API Error')
          );

          const result = await processQueryWithAI('test query');

          expect(result.title).toBe('Analysis Error');
          expect(result.summary).toContain('Unable to process');
          expect(result.insights[0]).toContain('The AI service encountered an error');
        });
      });
    });
  });

  describe('Environment Variable Handling', () => {
    it('should switch providers dynamically based on environment', async () => {
      process.env.AI_PROVIDER = 'gemini';
      await processQueryWithAI('test query');
      expect(mockGeminiService.prototype.generateInsights).toHaveBeenCalled();
      
      jest.clearAllMocks();
      
      process.env.AI_PROVIDER = 'bedrock';
      await processQueryWithAI('test query');
      expect(mockBedrockService.prototype.generateInsights).toHaveBeenCalled();
    });
  });

  describe('Health Check Provider Switching', () => {
    it('should test the correct provider in health check', () => {
      process.env.AI_PROVIDER = 'gemini';
      let service = AIServiceFactory.create();
      expect(service).toBeInstanceOf(GeminiService);

      process.env.AI_PROVIDER = 'bedrock';
      service = AIServiceFactory.create();
      expect(service).toBeInstanceOf(BedrockService);
    });
  });
});
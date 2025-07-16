import { FastifyInstance } from 'fastify';
import { buildServer } from '../server';
import { processQueryWithAI } from '../services/aiInsightStrategy';

jest.mock('../services/aiInsightStrategy');
const mockProcessQueryWithAI = processQueryWithAI as jest.MockedFunction<typeof processQueryWithAI>;

describe('AI-powered insights route', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should process query with AI strategy', async () => {
    const mockResponse = {
      title: 'AI Team Analysis',
      summary: 'AI-generated insights',
      insights: ['AI insight 1', 'AI insight 2'],
      timestamp: '2024-01-01T00:00:00.000Z'
    };
    
    mockProcessQueryWithAI.mockResolvedValue(mockResponse);

    const response = await app.inject({
      method: 'POST',
      url: '/api/insights',
      payload: { query: 'What is team availability?' }
    });

    expect(response.statusCode).toBe(200);
    expect(mockProcessQueryWithAI).toHaveBeenCalledWith('What is team availability?');
    
    const result = response.json();
    expect(result.title).toBe('AI Team Analysis');
    expect(result.insights).toContain('AI insight 1');
  });

  it('should handle AI errors gracefully', async () => {
    mockProcessQueryWithAI.mockRejectedValue(new Error('AI processing failed'));

    const response = await app.inject({
      method: 'POST',
      url: '/api/insights',
      payload: { query: 'test query' }
    });

    expect(response.statusCode).toBe(500);
  });
});
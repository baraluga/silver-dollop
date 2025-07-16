import Fastify from 'fastify'
import { FastifyInstance } from 'fastify'
import insightsRoutes from './insights'
import { processQueryWithAI } from '../services/aiInsightStrategy'

// Mock AI strategy
jest.mock('../services/aiInsightStrategy', () => ({
  processQueryWithAI: jest.fn()
}))

const mockProcessQueryWithAI = processQueryWithAI as jest.MockedFunction<typeof processQueryWithAI>

describe('Insights API', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify({ logger: false })
    await app.register(insightsRoutes)
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/insights', () => {
    it('should call AI strategy and return insights', async () => {
      const mockResponse = {
        title: 'AI Team Analysis',
        summary: 'AI-generated insights based on query',
        insights: ['AI insight 1', 'AI insight 2', 'AI insight 3'],
        timestamp: '2024-01-01T00:00:00.000Z'
      }
      
      mockProcessQueryWithAI.mockResolvedValue(mockResponse)

      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: 'What is our team\'s current availability?'
        }
      })

      expect(response.statusCode).toBe(200)
      expect(mockProcessQueryWithAI).toHaveBeenCalledWith('What is our team\'s current availability?')
      
      const body = JSON.parse(response.body)
      expect(body.title).toBe('AI Team Analysis')
      expect(body.summary).toBe('AI-generated insights based on query')
      expect(body.insights).toHaveLength(3)
      expect(body.timestamp).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should handle AI strategy errors', async () => {
      mockProcessQueryWithAI.mockRejectedValue(new Error('AI processing failed'))

      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: 'test query'
        }
      })

      expect(response.statusCode).toBe(500)
    })

    it('should validate required query field', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {}
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.message).toContain('query')
    })

    it('should validate query length', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: ''
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.message).toContain('query')
    })

    it('should reject queries that are too long', async () => {
      const longQuery = 'a'.repeat(501)
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: longQuery
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.message).toContain('query')
    })
  })
})
import Fastify from 'fastify'
import { FastifyInstance } from 'fastify'
import insightsRoutes from './insights'

describe('Insights API', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify({ logger: false })
    await app.register(insightsRoutes)
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/insights', () => {
    it('should return availability insights for availability query', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: 'What is our team\'s current availability for the next sprint?'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      
      expect(body.title).toBe('Team Availability Analysis')
      expect(body.summary).toContain('Tempo Planner data')
      expect(body.insights).toHaveLength(5)
      expect(body.insights[0]).toContain('High Availability')
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })

    it('should return billability insights for billability query', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: 'Which team members have the highest billability this month?'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      
      expect(body.title).toBe('Billability Analysis')
      expect(body.summary).toContain('billability performance')
      expect(body.insights).toHaveLength(6)
      expect(body.insights[0]).toContain('Top Performers')
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })

    it('should return custom query response for other queries', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: 'How is the team performing overall?'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      
      expect(body.title).toBe('Custom Query Analysis')
      expect(body.summary).toContain('based on your query')
      expect(body.insights).toHaveLength(5)
      expect(body.insights[0]).toContain('Query processed')
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })

    it('should handle case insensitive queries', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: 'AVAILABILITY for next sprint'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.title).toBe('Team Availability Analysis')
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

    it('should handle sprint keyword in queries', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: 'Show me sprint planning data'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.title).toBe('Team Availability Analysis')
    })

    it('should handle billable keyword in queries', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: {
          query: 'Show billable hours'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.title).toBe('Billability Analysis')
    })
  })
})
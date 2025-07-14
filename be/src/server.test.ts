import { buildServer } from './server'
import { FastifyInstance } from 'fastify'

describe('Server', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildServer()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('buildServer', () => {
    it('should create a Fastify instance', () => {
      expect(app).toBeDefined()
      expect(typeof app.listen).toBe('function')
    })

    it('should register all required plugins', async () => {
      // Test that plugins are registered by checking their functionality
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })
      
      expect(response.statusCode).toBe(200)
      expect(response.headers['x-ratelimit-limit']).toBe('100')
    })

    it('should handle CORS properly', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/health',
        headers: {
          'origin': 'http://localhost:4200',
          'access-control-request-method': 'GET'
        }
      })
      
      expect(response.statusCode).toBe(204)
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:4200')
    })

    it('should have insights route registered', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/insights',
        payload: { query: 'test' }
      })
      
      expect(response.statusCode).toBe(200)
    })
  })
})
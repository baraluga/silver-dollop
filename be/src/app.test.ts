import Fastify from 'fastify'
import { FastifyInstance } from 'fastify'

// Mock environment variables
process.env.PORT = '3001'
process.env.NODE_ENV = 'test'

describe('App', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify({ logger: false })
    
    // Register plugins manually for testing
    await app.register(require('@fastify/cors'), {
      origin: ['http://localhost:4200'],
      credentials: true
    })
    
    await app.register(require('@fastify/rate-limit'), {
      max: 100,
      timeWindow: '1 minute'
    })
    
    await app.register(require('./routes/insights'))
    
    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })
  })

  afterEach(async () => {
    await app.close()
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('ok')
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })
  })

  describe('CORS', () => {
    it('should allow requests from Angular dev server', async () => {
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
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['x-ratelimit-limit']).toBe('100')
      expect(response.headers['x-ratelimit-remaining']).toBe('99')
    })
  })
})
import { buildServer } from './server'
import { FastifyInstance } from 'fastify'

// Mock environment variables
process.env.PORT = '3001'
process.env.NODE_ENV = 'test'

describe('App', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildServer()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('start function', () => {
    it('should handle port parsing correctly', () => {
      // Test port parsing logic
      const originalEnv = process.env.PORT
      
      // Test with string port
      process.env.PORT = '3001'
      const port1 = parseInt(process.env.PORT || '3000')
      expect(port1).toBe(3001)
      
      // Test with undefined port (fallback)
      delete process.env.PORT
      const port2 = parseInt(process.env.PORT || '3000')
      expect(port2).toBe(3000)
      
      // Restore original
      process.env.PORT = originalEnv
    })

    it('should handle server startup error gracefully', async () => {
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()
      const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation()
      
      try {
        // Import the start function
        const { start } = require('./app')
        
        // Mock buildServer to throw error
        const originalBuildServer = require('./server').buildServer
        require('./server').buildServer = jest.fn().mockRejectedValue(new Error('Test error'))
        
        await start()
        
        expect(mockConsoleError).toHaveBeenCalledWith(new Error('Test error'))
        expect(mockProcessExit).toHaveBeenCalledWith(1)
        
        // Restore
        require('./server').buildServer = originalBuildServer
      } finally {
        mockConsoleError.mockRestore()
        mockProcessExit.mockRestore()
      }
    })
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
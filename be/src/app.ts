import Fastify from 'fastify'
import cors from '@fastify/cors'
import env from '@fastify/env'
import rateLimit from '@fastify/rate-limit'

const fastify = Fastify({
  logger: true
})

// Environment schema
const envSchema = {
  type: 'object',
  required: ['PORT'],
  properties: {
    PORT: { type: 'string', default: '3000' },
    NODE_ENV: { type: 'string', default: 'development' },
    TEMPO_API_TOKEN: { type: 'string' },
    JIRA_BASE_URL: { type: 'string' },
    JIRA_EMAIL: { type: 'string' },
    JIRA_API_TOKEN: { type: 'string' }
  }
}

const start = async () => {
  try {
    // Register plugins
    await fastify.register(env, {
      schema: envSchema,
      dotenv: true
    })
    
    await fastify.register(cors, {
      origin: ['http://localhost:4200'], // Angular dev server
      credentials: true
    })
    
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute'
    })
    
    // Register routes
    await fastify.register(require('./routes/insights'))
    
    // Health check route
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })
    
    // Start server
    const port = parseInt(process.env.PORT || '3000')
    await fastify.listen({ port, host: '0.0.0.0' })
    
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
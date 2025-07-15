import { FastifyInstance } from 'fastify'
import { processQuery } from '../services/insightStrategy'

// Request/Response schemas
const insightRequestSchema = {
  type: 'object',
  required: ['query'],
  properties: {
    query: { type: 'string', minLength: 1, maxLength: 500 }
  }
}

const insightResponseSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    insights: { type: 'array', items: { type: 'string' } },
    timestamp: { type: 'string' }
  }
}



export default async function insightsRoutes(fastify: FastifyInstance) {
  // POST /api/insights - Generate insights based on query
  fastify.post('/api/insights', {
    schema: {
      body: insightRequestSchema,
      response: {
        200: insightResponseSchema
      }
    }
  }, async (request) => {
    const { query } = request.body as { query: string }
    return processQuery(query)
  })
}
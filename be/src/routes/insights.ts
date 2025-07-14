import { FastifyInstance } from 'fastify'

// Mock insights data
const mockInsights = {
  availability: {
    title: "Team Availability Analysis",
    summary: "Based on current Tempo Planner data, here's your team's availability for the next sprint:",
    insights: [
      "🟢 **High Availability**: Sarah Johnson (32h), Michael Chen (30h), and David Rodriguez (28h) have the most capacity",
      "🟡 **Medium Availability**: Emily Watson (20h) and James Wilson (18h) have moderate capacity due to ongoing projects",
      "🔴 **Limited Availability**: Lisa Brown (8h) is mostly allocated to Project Alpha, and Robert Davis (12h) has planned PTO",
      "📊 **Total Team Capacity**: 148 hours available out of 280 total hours (53% utilization)",
      "⚠️ **Recommendations**: Consider redistributing workload from Lisa and Robert to Sarah and Michael for optimal sprint planning"
    ],
    timestamp: new Date().toISOString()
  },
  billability: {
    title: "Billability Analysis",
    summary: "Here's your team's billability performance for this month based on Tempo time logs:",
    insights: [
      "🏆 **Top Performers**: Michael Chen (92% billable), Sarah Johnson (89% billable), and David Rodriguez (85% billable)",
      "📈 **Above Average**: Emily Watson (78% billable) and James Wilson (76% billable) are performing well",
      "📉 **Below Target**: Lisa Brown (65% billable) and Robert Davis (62% billable) need attention",
      "💰 **Team Average**: 78% billability rate (Target: 75%)",
      "🔍 **Analysis**: Non-billable time is mostly spent on internal meetings (15%) and training (10%)",
      "💡 **Recommendations**: Focus on reducing meeting overhead and streamlining admin tasks for Lisa and Robert"
    ],
    timestamp: new Date().toISOString()
  }
}

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
  }, async (request, reply) => {
    const { query } = request.body as { query: string }
    
    // Simple mock logic based on query content
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('availability') || lowerQuery.includes('sprint')) {
      return mockInsights.availability
    } else if (lowerQuery.includes('billability') || lowerQuery.includes('billable')) {
      return mockInsights.billability
    } else {
      // Default fallback for custom queries
      return {
        title: "Custom Query Analysis",
        summary: "Here's what I found based on your query:",
        insights: [
          "🔍 **Query processed**: Your request has been analyzed against team resource data",
          "📊 **Current Status**: The team is operating at 78% billability with mixed availability",
          "💡 **Key Finding**: Resource allocation could be optimized for better performance",
          "🎯 **Recommendation**: Consider reviewing individual team member workloads and adjusting assignments accordingly",
          "📈 **Next Steps**: Monitor these metrics weekly and adjust resource planning as needed"
        ],
        timestamp: new Date().toISOString()
      }
    }
  })
}
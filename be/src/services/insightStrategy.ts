type InsightResponse = {
  title: string
  summary: string
  insights: string[]
  timestamp: string
}

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

interface InsightStrategy {
  matches(query: string): boolean
  generateResponse(): InsightResponse
}

class AvailabilityStrategy implements InsightStrategy {
  matches(query: string): boolean {
    return query.includes('availability') || query.includes('sprint')
  }
  
  generateResponse(): InsightResponse {
    return mockInsights.availability
  }
}

class BillabilityStrategy implements InsightStrategy {
  matches(query: string): boolean {
    return query.includes('billability') || query.includes('billable')
  }
  
  generateResponse(): InsightResponse {
    return mockInsights.billability
  }
}

class CustomStrategy implements InsightStrategy {
  matches(): boolean {
    return true
  }
  
  generateResponse(): InsightResponse {
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
}

function findMatchingStrategy(query: string): InsightStrategy {
  const strategies = [new AvailabilityStrategy(), new BillabilityStrategy()]
  const lowerQuery = query.toLowerCase()
  
  const matchedStrategy = strategies.find(strategy => strategy.matches(lowerQuery))
  return matchedStrategy || new CustomStrategy()
}

export function processQuery(query: string): InsightResponse {
  const strategy = findMatchingStrategy(query)
  return strategy.generateResponse()
}
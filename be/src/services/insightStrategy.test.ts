import { processQuery } from './insightStrategy'

describe('InsightStrategy', () => {
  describe('processQuery', () => {
    it('should return availability insights for availability query', () => {
      const result = processQuery('What is our team availability?')
      
      expect(result.title).toBe('Team Availability Analysis')
      expect(result.summary).toContain('Tempo Planner data')
      expect(result.insights).toHaveLength(5)
      expect(result.insights[0]).toContain('High Availability')
    })

    it('should return availability insights for sprint query', () => {
      const result = processQuery('Show sprint planning data')
      
      expect(result.title).toBe('Team Availability Analysis')
    })

    it('should return billability insights for billability query', () => {
      const result = processQuery('Show billability metrics')
      
      expect(result.title).toBe('Billability Analysis')
      expect(result.summary).toContain('billability performance')
      expect(result.insights).toHaveLength(6)
      expect(result.insights[0]).toContain('Top Performers')
    })

    it('should return billability insights for billable query', () => {
      const result = processQuery('Who is most billable?')
      
      expect(result.title).toBe('Billability Analysis')
    })

    it('should handle case insensitive queries', () => {
      const result = processQuery('AVAILABILITY for team')
      
      expect(result.title).toBe('Team Availability Analysis')
    })

    it('should include ideal billability ratio in billability insights', () => {
      const result = processQuery('Show billability metrics')
      
      expect(result.insights.some(insight => insight.includes('75%'))).toBe(true)
      expect(result.insights.some(insight => insight.includes('ideal target'))).toBe(true)
    })

    it('should return custom response for unmatched queries', () => {
      const result = processQuery('How is performance overall?')
      
      expect(result.title).toBe('Custom Query Analysis')
      expect(result.summary).toContain('based on your query')
      expect(result.insights).toHaveLength(5)
      expect(result.insights[0]).toContain('Query processed')
    })

    it('should return custom response for empty queries', () => {
      const result = processQuery('')
      
      expect(result.title).toBe('Custom Query Analysis')
    })

    it('should always match with custom strategy fallback', () => {
      const result = processQuery('completely unrelated query about weather')
      
      expect(result.title).toBe('Custom Query Analysis')
      expect(result.summary).toContain('based on your query')
      expect(result.insights).toHaveLength(5)
    })
  })
})
import { classifyQuery } from './queryClassifier'

describe('QueryClassifier', () => {
  describe('classifyQuery', () => {
    it('should classify availability queries', () => {
      const result = classifyQuery('What is our team availability?')
      expect(result).toBe('availability')
    })

    it('should classify sprint queries as availability', () => {
      const result = classifyQuery('Show sprint planning data')
      expect(result).toBe('availability')
    })

    it('should classify billability queries', () => {
      const result = classifyQuery('Show billability metrics')
      expect(result).toBe('billability')
    })

    it('should classify billable queries as billability', () => {
      const result = classifyQuery('Who is most billable?')
      expect(result).toBe('billability')
    })

    it('should handle case insensitive queries', () => {
      const result = classifyQuery('AVAILABILITY for team')
      expect(result).toBe('availability')
    })

    it('should return custom for unmatched queries', () => {
      const result = classifyQuery('How is performance overall?')
      expect(result).toBe('custom')
    })

    it('should handle empty queries', () => {
      const result = classifyQuery('')
      expect(result).toBe('custom')
    })
  })
})
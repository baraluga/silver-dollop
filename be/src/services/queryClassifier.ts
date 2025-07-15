interface QueryClassifier {
  matches(query: string): boolean
  getType(): string
}

class AvailabilityClassifier implements QueryClassifier {
  matches(query: string): boolean {
    return query.includes('availability') || query.includes('sprint')
  }
  
  getType(): string {
    return 'availability'
  }
}

class BillabilityClassifier implements QueryClassifier {
  matches(query: string): boolean {
    return query.includes('billability') || query.includes('billable')
  }
  
  getType(): string {
    return 'billability'
  }
}

export function classifyQuery(query: string): string {
  const classifiers = [new AvailabilityClassifier(), new BillabilityClassifier()]
  const lowerQuery = query.toLowerCase()
  
  for (const classifier of classifiers) {
    if (classifier.matches(lowerQuery)) {
      return classifier.getType()
    }
  }
  return 'custom'
}
export interface QueryContext {
  availabilityData?: unknown;
  billabilityData?: unknown;
  userDirectory?: Record<string, string>;
  [key: string]: unknown;
}

export interface AIService {
  generateInsights(query: string, context: QueryContext): Promise<string>;
}
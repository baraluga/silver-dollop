import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface QueryContext {
  availabilityData?: unknown;
  billabilityData?: unknown;
  [key: string]: unknown;
}

export class GeminiService {
  private genAI!: GoogleGenerativeAI;
  private model!: GenerativeModel;

  constructor(apiKey?: string) {
    const key = this.validateApiKey(apiKey);
    this.initializeClient(key);
  }

  private validateApiKey(apiKey?: string): string {
    if (apiKey) return apiKey;
    return this.getEnvKey();
  }

  private getEnvKey(): string {
    const envKey = process.env.GEMINI_API_KEY;
    if (!envKey) throw new Error('GEMINI_API_KEY is required');
    return envKey;
  }

  private initializeClient(key: string): void {
    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateInsights(query: string, context: QueryContext): Promise<string> {
    try {
      const prompt = this.buildPrompt(query, context);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini API error: ${error}`);
    }
  }

  private buildPrompt(query: string, context: QueryContext): string {
    return `
You are a team resource management assistant. Based on the following query and context, provide insights about team availability and billability.

Query: ${query}

Context: ${JSON.stringify(context, null, 2)}

Please provide a clear, actionable response with specific recommendations for team resource management.
    `.trim();
  }
}
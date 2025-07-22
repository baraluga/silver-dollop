import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { AIService, QueryContext } from "../interfaces/aiService.interface";

export class GeminiService implements AIService {
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
    if (!envKey) throw new Error("GEMINI_API_KEY is required");
    return envKey;
  }

  private initializeClient(key: string): void {
    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateInsights(
    query: string,
    context: QueryContext
  ): Promise<string> {
    const prompt = this.buildPrompt(query, context);
    const result = await this.model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  private buildPrompt(query: string, context: QueryContext): string {
    const contextString = JSON.stringify(context, null, 2);
    const userDirectoryInfo = this.buildUserDirectoryPrompt(
      context.userDirectory
    );
    const instructions = this.buildInstructions();
    const responseFormat = this.buildResponseFormat();

    return `
You are a team resource management assistant. Based on the following query and context, provide insights about team availability and billability.

Query: ${query}

Context: ${contextString}

${userDirectoryInfo}

${instructions}

${responseFormat}

Do not include any text outside the JSON response. Only return valid JSON.
    `.trim();
  }

  private buildInstructions(): string {
    return `IMPORTANT INSTRUCTIONS:
1. ALWAYS use user names (from userDirectory) instead of user IDs when referring to people
2. When you see a userId like "5ba1f087c0b54c2f85969f34", look it up in the userDirectory and use the corresponding name.
If no name is found, use "Unknown User".
3. Make your insights human-readable by using actual names like "John Doe" instead of user IDs
4. When projectInsights data is available, include project-level insights about resource allocation
5. Highlight which projects are consuming the most team time and resources
6. Focus on actionable insights for team management`;
  }

  private buildResponseFormat(): string {
    return `You must respond with valid JSON in exactly this format:
{
  "title": "Brief title for the insight",
  "summary": "1-2 sentence summary of the key finding",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "thoughtProcess": "Explain (in layman's terms) how you arrived at the key finding, including any assumptions or calculations made.",
}`;
  }

  private buildUserDirectoryPrompt(
    userDirectory?: Record<string, string>
  ): string {
    if (!userDirectory || Object.keys(userDirectory).length === 0) {
      return "";
    }

    const userMappings = Object.entries(userDirectory)
      .map(([userId, userName]) => `  ${userId} → ${userName}`)
      .join("\n");

    return `
USER DIRECTORY (Use names, not IDs):
${userMappings}`;
  }
}

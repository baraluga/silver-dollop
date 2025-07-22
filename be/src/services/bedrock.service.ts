import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { AIService, QueryContext } from "../interfaces/aiService.interface";

interface BedrockConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  modelId?: string;
}

interface CredentialsType {
  accessKeyId: string;
  secretAccessKey: string;
}

interface BedrockResponse {
  body: Uint8Array;
}

export class BedrockService implements AIService {
  private client!: BedrockRuntimeClient;
  private modelId: string;

  constructor(config?: BedrockConfig) {
    this.modelId = this.validateModelId(config?.modelId);
    this.initializeClient(config);
  }

  private validateModelId(modelId?: string): string {
    if (modelId) return modelId;
    return this.getEnvModelId();
  }

  private getEnvModelId(): string {
    const envModelId = process.env.BEDROCK_MODEL_ID;
    return envModelId || "anthropic.claude-3-5-sonnet-20241022-v2:0";
  }

  private initializeClient(config?: BedrockConfig): void {
    const clientRegion = this.getClientRegion(config);
    const credentials = this.getCredentials(config);
    
    this.client = new BedrockRuntimeClient({
      region: clientRegion,
      credentials,
    });
  }

  private getClientRegion(config?: BedrockConfig): string {
    if (config?.region) return config.region;
    if (process.env.AWS_REGION) return process.env.AWS_REGION;
    return "us-east-1";
  }

  private getCredentials(config?: BedrockConfig): CredentialsType {
    const keyId = this.getAccessKeyId(config);
    const secretKey = this.getSecretAccessKey(config);

    this.validateCredentials(keyId, secretKey);
    
    return {
      accessKeyId: keyId!,
      secretAccessKey: secretKey!,
    };
  }

  private getAccessKeyId(config?: BedrockConfig): string | undefined {
    return config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
  }

  private getSecretAccessKey(config?: BedrockConfig): string | undefined {
    return config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
  }

  private validateCredentials(keyId?: string, secretKey?: string): void {
    if (!keyId || !secretKey) {
      throw new Error("AWS credentials are required");
    }
  }

  async generateInsights(
    query: string,
    context: QueryContext
  ): Promise<string> {
    const prompt = this.buildPrompt(query, context);
    const payload = this.buildPayload(prompt);
    
    const command = new InvokeModelCommand({
      modelId: this.modelId,
      body: JSON.stringify(payload),
      contentType: "application/json",
      accept: "application/json",
    });

    const response = await this.client.send(command);
    return this.parseResponse(response);
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

  private buildPayload(prompt: string): object {
    return {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    };
  }

  private parseResponse(response: BedrockResponse): string {
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    this.validateResponseBody(responseBody);
    return responseBody.content[0].text;
  }
  
  private validateResponseBody(responseBody: unknown): void {
    const body = responseBody as Record<string, unknown>;
    const content = body.content as unknown[];
    
    if (!this.hasValidContent(content)) {
      throw new Error("Invalid response format from Bedrock");
    }
  }

  private hasValidContent(content: unknown[]): boolean {
    return content?.[0] && !!(content[0] as Record<string, unknown>).text;
  }
}
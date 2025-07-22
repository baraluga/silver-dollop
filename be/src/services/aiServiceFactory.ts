import { AIService } from "../interfaces/aiService.interface";
import { GeminiService } from "./gemini.service";
import { BedrockService } from "./bedrock.service";

export type AIProvider = "gemini" | "bedrock";

export class AIServiceFactory {
  static create(provider?: AIProvider): AIService {
    const selectedProvider = provider || this.getProviderFromEnv();
    return this.createService(selectedProvider);
  }

  private static createService(provider: AIProvider): AIService {
    switch (provider) {
      case "gemini":
        return new GeminiService();
      case "bedrock":
        return new BedrockService();
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private static getProviderFromEnv(): AIProvider {
    const envProvider = process.env.AI_PROVIDER;
    
    if (envProvider === "gemini" || envProvider === "bedrock") {
      return envProvider;
    }
    
    return "gemini";
  }

  static getSupportedProviders(): AIProvider[] {
    return ["gemini", "bedrock"];
  }
}
import { AIServiceFactory } from './aiServiceFactory';
import { GeminiService } from './gemini.service';
import { BedrockService } from './bedrock.service';

jest.mock('./gemini.service');
jest.mock('./bedrock.service');

describe('AIServiceFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('create', () => {
    it('should create GeminiService when provider is gemini', () => {
      const service = AIServiceFactory.create('gemini');
      expect(service).toBeInstanceOf(GeminiService);
    });

    it('should create BedrockService when provider is bedrock', () => {
      const service = AIServiceFactory.create('bedrock');
      expect(service).toBeInstanceOf(BedrockService);
    });

    it('should default to gemini when no provider specified and no env var', () => {
      delete process.env.AI_PROVIDER;
      const service = AIServiceFactory.create();
      expect(service).toBeInstanceOf(GeminiService);
    });

    it('should use env var when no provider specified', () => {
      process.env.AI_PROVIDER = 'bedrock';
      const service = AIServiceFactory.create();
      expect(service).toBeInstanceOf(BedrockService);
    });

    it('should override env var when provider explicitly specified', () => {
      process.env.AI_PROVIDER = 'bedrock';
      const service = AIServiceFactory.create('gemini');
      expect(service).toBeInstanceOf(GeminiService);
    });

    it('should throw error for unsupported provider', () => {
      expect(() => {
        AIServiceFactory.create('unsupported' as any);
      }).toThrow('Unsupported AI provider: unsupported');
    });
  });

  describe('getSupportedProviders', () => {
    it('should return all supported providers', () => {
      const providers = AIServiceFactory.getSupportedProviders();
      expect(providers).toEqual(['gemini', 'bedrock']);
    });
  });
});
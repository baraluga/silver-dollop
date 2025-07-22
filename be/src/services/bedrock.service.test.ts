import { BedrockService } from './bedrock.service';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn(),
  InvokeModelCommand: jest.fn()
}));

const mockedBedrockClient = BedrockRuntimeClient as jest.MockedClass<typeof BedrockRuntimeClient>;
const mockedInvokeModelCommand = InvokeModelCommand as jest.MockedClass<typeof InvokeModelCommand>;

describe('BedrockService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { 
      ...originalEnv,
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'test-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret',
      BEDROCK_MODEL_ID: 'test-model'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      const service = new BedrockService();
      expect(mockedBedrockClient).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret'
        }
      });
    });

    it('should use provided parameters over environment variables', () => {
      new BedrockService({
        region: 'us-west-2',
        accessKeyId: 'custom-key',
        secretAccessKey: 'custom-secret',
        modelId: 'custom-model'
      });
      expect(mockedBedrockClient).toHaveBeenCalledWith({
        region: 'us-west-2',
        credentials: {
          accessKeyId: 'custom-key',
          secretAccessKey: 'custom-secret'
        }
      });
    });

    it('should throw error when AWS credentials are missing', () => {
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      
      expect(() => new BedrockService()).toThrow('AWS credentials are required');
    });

    it('should use default model ID when not provided', () => {
      delete process.env.BEDROCK_MODEL_ID;
      const service = new BedrockService();
      expect(service).toBeInstanceOf(BedrockService);
    });

    it('should use default region when AWS_REGION is not set', () => {
      delete process.env.AWS_REGION;
      new BedrockService();
      expect(mockedBedrockClient).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret'
        }
      });
    });
  });

  describe('generateInsights', () => {
    let service: BedrockService;
    let mockSend: jest.Mock;

    beforeEach(() => {
      mockSend = jest.fn();
      mockedBedrockClient.prototype.send = mockSend;
      
      // Mock the InvokeModelCommand constructor to capture inputs
      mockedInvokeModelCommand.mockImplementation((input) => ({
        input,
        middlewareStack: {
          add: jest.fn(),
          clone: jest.fn()
        }
      } as any));
      
      service = new BedrockService();
    });

    const mockResponse = {
      body: new TextEncoder().encode(JSON.stringify({
        content: [
          {
            text: JSON.stringify({
              title: 'Test Insight',
              summary: 'Test summary',
              insights: ['insight 1', 'insight 2'],
              thoughtProcess: 'Test process'
            })
          }
        ]
      }))
    };

    it('should generate insights successfully', async () => {
      mockSend.mockResolvedValue(mockResponse);

      const result = await service.generateInsights('test query', {
        availabilityData: { test: 'data' },
        userDirectory: { 'user1': 'John Doe' }
      });

      expect(result).toContain('Test Insight');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should build correct payload for Bedrock', async () => {
      mockSend.mockResolvedValue(mockResponse);
      
      await service.generateInsights('test query', {});
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      
      const callArguments = mockSend.mock.calls[0];
      expect(callArguments).toHaveLength(1);
      
      const command = callArguments[0];
      
      // Check the command was constructed with correct parameters  
      expect(command.input).toBeDefined();
      expect(command.input.modelId).toBe('test-model');
      expect(command.input.contentType).toBe('application/json');
      expect(command.input.accept).toBe('application/json');
      expect(command.input.body).toEqual(expect.any(String));
      
      const payload = JSON.parse(command.input.body);
      expect(payload).toHaveProperty('anthropic_version', 'bedrock-2023-05-31');
      expect(payload).toHaveProperty('max_tokens', 4096);
      expect(payload).toHaveProperty('temperature', 0.1);
      expect(payload.messages).toHaveLength(1);
      expect(payload.messages[0].role).toBe('user');
    });

    it('should include user directory in prompt when provided', async () => {
      mockSend.mockResolvedValue(mockResponse);
      
      await service.generateInsights('test query', {
        userDirectory: { 'user1': 'John Doe', 'user2': 'Jane Smith' }
      });
      
      const command = mockSend.mock.calls[0][0];
      const payload = JSON.parse(command.input.body);
      const prompt = payload.messages[0].content;
      
      expect(prompt).toContain('USER DIRECTORY');
      expect(prompt).toContain('user1 → John Doe');
      expect(prompt).toContain('user2 → Jane Smith');
    });

    it('should throw error for invalid response format', async () => {
      const invalidResponse = {
        body: new TextEncoder().encode(JSON.stringify({
          invalidFormat: true
        }))
      };
      
      mockSend.mockResolvedValue(invalidResponse);
      
      await expect(service.generateInsights('test query', {}))
        .rejects.toThrow('Invalid response format from Bedrock');
    });

    it('should handle network errors', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));
      
      await expect(service.generateInsights('test query', {}))
        .rejects.toThrow('Network error');
    });
  });
});
import { GeminiService } from "./gemini.service";

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest
            .fn()
            .mockResolvedValue("Mocked AI response about team availability"),
        },
      }),
    }),
  })),
}));

describe("GeminiService", () => {
  let service: GeminiService;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-api-key";
    service = new GeminiService();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should throw error without API key", () => {
    delete process.env.GEMINI_API_KEY;

    expect(() => new GeminiService()).toThrow("GEMINI_API_KEY is required");
  });

  it("should accept API key as constructor parameter", () => {
    const customService = new GeminiService("custom-key");
    expect(customService).toBeTruthy();
  });

  it("should generate insights from query", async () => {
    const query = "What is our team availability?";
    const context = {
      availabilityData: { totalHours: 160, availableHours: 120 },
      billabilityData: { averageRate: 78, idealTarget: 75 },
    };

    const result = await service.generateInsights(query, context);

    expect(result).toBe("Mocked AI response about team availability");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(10);
  });

  it("should handle API errors gracefully", async () => {
    const mockError = new Error("API Error");
    const mockModel = {
      generateContent: jest.fn().mockRejectedValue(mockError),
    };

    const mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    (service as any).genAI = mockGenAI;
    (service as any).model = mockModel;

    await expect(service.generateInsights("test query", {})).rejects.toThrow(
      "API Error",
    );
  });
});

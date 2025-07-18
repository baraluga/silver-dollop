import { processQueryWithAI } from "./aiInsightStrategy";
import { GeminiService } from "./gemini.service";
import { teamDataService } from "./team-data.service";
import { jiraService } from "./jira.service";
import { DateParsingService } from "./date-parsing.service";

// Mock dependencies
jest.mock("./gemini.service");
jest.mock("./team-data.service");
jest.mock("./jira.service");
jest.mock("./date-parsing.service");

const mockGeminiService = GeminiService as jest.MockedClass<
  typeof GeminiService
>;
const mockTeamDataService = teamDataService as jest.Mocked<
  typeof teamDataService
>;
const mockJiraService = jiraService as jest.Mocked<typeof jiraService>;
const mockDateParsingService = DateParsingService as jest.MockedClass<
  typeof DateParsingService
>;

describe("AI Insight Strategy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default JIRA mock - can be overridden in individual tests
    mockJiraService.getUsersByAccountIds.mockResolvedValue([]);
    // Default DateParsingService mock - returns null (uses current week)
    mockDateParsingService.prototype.parseQueryDate.mockReturnValue(null);
  });

  it("should process availability query with real team data", async () => {
    // Arrange
    const query = "What is team availability next sprint?";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 200,
        totalActualHours: 170,
        teamAvailabilityPercentage: 85,
        userAvailabilities: [
          {
            userId: "1",
            userName: "John Doe",
            plannedHours: 40,
            actualHours: 35,
            availabilityPercentage: 87,
          },
        ],
      },
      billability: {
        totalHours: 192,
        billableHours: 150,
        nonBillableHours: 42,
        teamBillabilityPercentage: 78,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 78,
        idealBillabilityPercentage: 75,
        isOnTarget: true,
        variance: 3,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };
    const mockParsedInsights = {
      title: "Team Availability Analysis",
      summary: "Based on current data, here is your team availability",
      insights: ["Team has 85% availability", "Total available hours: 170"],
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockJiraService.getUsersByAccountIds.mockResolvedValue([
      {
        accountId: "1",
        displayName: "John Doe",
        emailAddress: "john.doe@example.com",
        avatarUrls: { "48x48": "avatar.png" },
        active: true,
      },
    ]);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights),
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(mockTeamDataService.getTeamInsights).toHaveBeenCalled();
    expect(mockGeminiService.prototype.generateInsights).toHaveBeenCalledWith(
      query,
      {
        availabilityData: mockTeamInsights.availability,
        billabilityData: mockTeamInsights.billability,
        trend: mockTeamInsights.trend,
        projectInsights: expect.objectContaining({
          totalProjects: 0,
          projectBreakdown: [],
          topProjects: [],
        }),
        period: mockTeamInsights.period,
        userDirectory: { "1": "John Doe" },
      },
    );
    expect(result.title).toBe("Team Availability Analysis");
    expect(result.insights).toContain("Team has 85% availability");
  });

  it("should process billability query with real team data", async () => {
    // Arrange
    const query = "Show me billability rates for the team";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 200,
        totalActualHours: 170,
        teamAvailabilityPercentage: 85,
        userAvailabilities: [],
      },
      billability: {
        totalHours: 200,
        billableHours: 184,
        nonBillableHours: 16,
        teamBillabilityPercentage: 92,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 92,
        idealBillabilityPercentage: 88,
        isOnTarget: true,
        variance: 4,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };
    const mockParsedInsights = {
      title: "Billability Analysis",
      summary: "Team billability performance overview",
      insights: ["Team has 92% billability rate", "Billable hours: 184"],
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights),
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(mockGeminiService.prototype.generateInsights).toHaveBeenCalledWith(
      query,
      {
        availabilityData: mockTeamInsights.availability,
        billabilityData: mockTeamInsights.billability,
        trend: mockTeamInsights.trend,
        projectInsights: expect.objectContaining({
          totalProjects: 0,
          projectBreakdown: [],
          topProjects: [],
        }),
        period: mockTeamInsights.period,
        userDirectory: {},
      },
    );
    expect(result.title).toBe("Billability Analysis");
    expect(result.insights).toContain("Team has 92% billability rate");
  });

  it("should handle errors gracefully", async () => {
    // Arrange
    const query = "test query";
    mockTeamDataService.getTeamInsights.mockRejectedValue(
      new Error("API Error"),
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe("Analysis Error");
    expect(result.summary).toBe(
      "Unable to process your query at this time. Please try again.",
    );
    expect(result.insights).toContain(
      "The AI service encountered an error while processing your request",
    );
    expect(result.timestamp).toBeDefined();
  });

  it("should handle JSON wrapped in markdown code blocks", async () => {
    // Arrange
    const query = "test query";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: [],
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };
    const mockParsedInsights = {
      title: "Markdown Test",
      summary: "Testing markdown wrapped JSON",
      insights: ["Markdown parsing works"],
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      "```json\n" + JSON.stringify(mockParsedInsights) + "\n```",
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe("Markdown Test");
    expect(result.insights).toContain("Markdown parsing works");
  });

  it("should handle generic code blocks", async () => {
    // Arrange
    const query = "test query";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: [],
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };
    const mockParsedInsights = {
      title: "Generic Code Block",
      summary: "Testing generic code blocks",
      insights: ["Generic parsing works"],
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      "```\n" + JSON.stringify(mockParsedInsights) + "\n```",
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe("Generic Code Block");
    expect(result.insights).toContain("Generic parsing works");
  });

  it("should handle invalid JSON response", async () => {
    // Arrange
    const query = "test query";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: [],
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      "invalid json response",
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe("Analysis Error");
    expect(result.summary).toBe(
      "Unable to process your query at this time. Please try again.",
    );
  });

  it("should handle missing required fields in response", async () => {
    // Arrange
    const query = "test query";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: [],
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify({ title: "Missing Fields" }), // Missing summary and insights
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe("Analysis Error");
    expect(result.summary).toBe(
      "Unable to process your query at this time. Please try again.",
    );
  });

  it("should filter non-string insights", async () => {
    // Arrange
    const query = "test query";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: [],
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };
    const mockParsedInsights = {
      title: "Filter Test",
      summary: "Testing insight filtering",
      insights: ["Valid insight", 123, null, "Another valid insight"],
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights),
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe("Filter Test");
    expect(result.insights).toEqual(["Valid insight", "Another valid insight"]);
  });

  it("should detect empty context data and handle accordingly", async () => {
    // Arrange
    const query = "What is team availability?";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: [],
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };
    const mockParsedInsights = {
      title: "Empty Data Analysis",
      summary: "No data available for analysis",
      insights: ["No availability data found", "No billability data found"],
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights),
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(mockGeminiService.prototype.generateInsights).toHaveBeenCalledWith(
      query,
      {
        availabilityData: mockTeamInsights.availability,
        billabilityData: mockTeamInsights.billability,
        trend: mockTeamInsights.trend,
        projectInsights: expect.objectContaining({
          totalProjects: 0,
          projectBreakdown: [],
          topProjects: [],
        }),
        period: mockTeamInsights.period,
        userDirectory: {},
      },
    );
    expect(result.title).toBe("Empty Data Analysis");
    expect(result.insights).toContain("No availability data found");
  });

  it("should build user directory from billability data", async () => {
    // Arrange
    const query = "Show me team billability by user";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 200,
        totalActualHours: 170,
        teamAvailabilityPercentage: 85,
        userAvailabilities: [
          {
            userId: "user1",
            userName: "John Doe",
            plannedHours: 40,
            actualHours: 35,
            availabilityPercentage: 87,
          },
        ],
      },
      billability: {
        totalHours: 200,
        billableHours: 184,
        nonBillableHours: 16,
        teamBillabilityPercentage: 92,
        userBillabilities: [
          {
            userId: "user2",
            userName: "Jane Smith",
            totalHours: 40,
            billableHours: 36,
            nonBillableHours: 4,
            billabilityPercentage: 90,
          },
        ],
      },
      trend: {
        actualBillabilityPercentage: 92,
        idealBillabilityPercentage: 88,
        isOnTarget: true,
        variance: 4,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };
    const mockParsedInsights = {
      title: "User Billability Analysis",
      summary: "Individual user billability breakdown",
      insights: ["John Doe has 87% availability", "Jane Smith has 90% billability"],
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockJiraService.getUsersByAccountIds.mockResolvedValue([
      {
        accountId: "user1",
        displayName: "John Doe",
        emailAddress: "john.doe@example.com",
        avatarUrls: { "48x48": "avatar1.png" },
        active: true,
      },
      {
        accountId: "user2",
        displayName: "Jane Smith",
        emailAddress: "jane.smith@example.com",
        avatarUrls: { "48x48": "avatar2.png" },
        active: true,
      },
    ]);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights),
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(mockGeminiService.prototype.generateInsights).toHaveBeenCalledWith(
      query,
      {
        availabilityData: mockTeamInsights.availability,
        billabilityData: mockTeamInsights.billability,
        trend: mockTeamInsights.trend,
        projectInsights: expect.objectContaining({
          totalProjects: 0,
          projectBreakdown: [],
          topProjects: [],
        }),
        period: mockTeamInsights.period,
        userDirectory: {
          "user1": "John Doe",
          "user2": "Jane Smith",
        },
      },
    );
    expect(result.title).toBe("User Billability Analysis");
    expect(result.insights).toContain("John Doe has 87% availability");
  });

  it("should handle users with 'Unknown User' names by excluding them from userDirectory", async () => {
    // Arrange
    const query = "Show me team availability";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 200,
        totalActualHours: 170,
        teamAvailabilityPercentage: 85,
        userAvailabilities: [
          {
            userId: "user1",
            userName: "John Doe",
            plannedHours: 40,
            actualHours: 35,
            availabilityPercentage: 87,
          },
          {
            userId: "user2",
            userName: "Unknown User",
            plannedHours: 40,
            actualHours: 30,
            availabilityPercentage: 75,
          },
        ],
      },
      billability: {
        totalHours: 200,
        billableHours: 150,
        nonBillableHours: 50,
        teamBillabilityPercentage: 75,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 75,
        idealBillabilityPercentage: 75,
        isOnTarget: true,
        variance: 0,
      },
      worklogs: [],
      period: { from: "2024-01-01", to: "2024-01-07" },
    };
    const mockParsedInsights = {
      title: "Team Availability Analysis",
      summary: "Team availability with some unknown users",
      insights: ["John Doe has 87% availability", "One user has unknown identity"],
    };

    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockJiraService.getUsersByAccountIds.mockResolvedValue([
      {
        accountId: "user1",
        displayName: "John Doe",
        emailAddress: "john.doe@example.com",
        avatarUrls: { "48x48": "avatar1.png" },
        active: true,
      },
      {
        accountId: "user2", 
        displayName: "Jane Smith", // JIRA has the real name, not "Unknown User"
        emailAddress: "jane.smith@example.com",
        avatarUrls: { "48x48": "avatar2.png" },
        active: true,
      },
    ]);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights),
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert - userDirectory should only contain known users, not "Unknown User"
    expect(mockGeminiService.prototype.generateInsights).toHaveBeenCalledWith(
      query,
      {
        availabilityData: mockTeamInsights.availability,
        billabilityData: mockTeamInsights.billability,
        trend: mockTeamInsights.trend,
        projectInsights: expect.objectContaining({
          totalProjects: 0,
          projectBreakdown: [],
          topProjects: [],
        }),
        period: mockTeamInsights.period,
        userDirectory: { "user1": "John Doe", "user2": "Jane Smith" }, // Now includes real JIRA names
      },
    );
    expect(result.title).toBe("Team Availability Analysis");
  });

  it("should use parsed date from query when available", async () => {
    // Arrange
    const query = "who logged the most yesterday?";
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: [],
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: [],
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75,
      },
      worklogs: [],
      period: { from: "2025-07-17", to: "2025-07-17" },
    };
    const mockParsedInsights = {
      title: "Yesterday Analysis",
      summary: "Data from yesterday",
      insights: ["Analysis for yesterday's data"],
    };

    mockDateParsingService.prototype.parseQueryDate.mockReturnValue({
      startDate: "2025-07-17",
      endDate: "2025-07-17",
    });
    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights),
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(mockDateParsingService.prototype.parseQueryDate).toHaveBeenCalledWith(query);
    expect(mockTeamDataService.getTeamInsights).toHaveBeenCalledWith({
      from: "2025-07-17",
      to: "2025-07-17",
    });
    expect(result.title).toBe("Yesterday Analysis");
  });
});

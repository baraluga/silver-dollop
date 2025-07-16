import { processQueryWithAI } from './aiInsightStrategy';
import { GeminiService } from './gemini.service';
import { teamDataService } from './team-data.service';

// Mock dependencies
jest.mock('./gemini.service');
jest.mock('./team-data.service');

const mockGeminiService = GeminiService as jest.MockedClass<typeof GeminiService>;
const mockTeamDataService = teamDataService as jest.Mocked<typeof teamDataService>;

describe('AI Insight Strategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process availability query with real team data', async () => {
    // Arrange
    const query = 'What is team availability next sprint?';
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 200,
        totalActualHours: 170,
        teamAvailabilityPercentage: 85,
        userAvailabilities: [
          { userId: '1', userName: 'John Doe', plannedHours: 40, actualHours: 35, availabilityPercentage: 87 }
        ]
      },
      billability: {
        totalHours: 192,
        billableHours: 150,
        nonBillableHours: 42,
        teamBillabilityPercentage: 78,
        userBillabilities: []
      },
      trend: {
        actualBillabilityPercentage: 78,
        idealBillabilityPercentage: 75,
        isOnTarget: true,
        variance: 3
      },
      period: { from: '2024-01-01', to: '2024-01-07' }
    };
    const mockParsedInsights = {
      title: 'Team Availability Analysis',
      summary: 'Based on current data, here is your team availability',
      insights: ['Team has 85% availability', 'Total available hours: 170']
    };
    
    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights)
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
        period: mockTeamInsights.period
      }
    );
    expect(result.title).toBe('Team Availability Analysis');
    expect(result.insights).toContain('Team has 85% availability');
  });

  it('should process billability query with real team data', async () => {
    // Arrange
    const query = 'Show me billability rates for the team';
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 200,
        totalActualHours: 170,
        teamAvailabilityPercentage: 85,
        userAvailabilities: []
      },
      billability: {
        totalHours: 200,
        billableHours: 184,
        nonBillableHours: 16,
        teamBillabilityPercentage: 92,
        userBillabilities: []
      },
      trend: {
        actualBillabilityPercentage: 92,
        idealBillabilityPercentage: 88,
        isOnTarget: true,
        variance: 4
      },
      period: { from: '2024-01-01', to: '2024-01-07' }
    };
    const mockParsedInsights = {
      title: 'Billability Analysis',
      summary: 'Team billability performance overview',
      insights: ['Team has 92% billability rate', 'Billable hours: 184']
    };
    
    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights)
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe('Billability Analysis');
    expect(result.insights).toContain('Team has 92% billability rate');
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const query = 'test query';
    mockTeamDataService.getTeamInsights.mockRejectedValue(
      new Error('API Error')
    );

    // Act & Assert
    await expect(processQueryWithAI(query)).rejects.toThrow('API Error');
  });
});
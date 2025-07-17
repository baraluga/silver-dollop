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

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe('Analysis Error');
    expect(result.summary).toBe('Unable to process your query at this time. Please try again.');
    expect(result.insights).toContain('The AI service encountered an error while processing your request');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle JSON wrapped in markdown code blocks', async () => {
    // Arrange
    const query = 'test query';
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: []
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: []
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75
      },
      period: { from: '2024-01-01', to: '2024-01-07' }
    };
    const mockParsedInsights = {
      title: 'Markdown Test',
      summary: 'Testing markdown wrapped JSON',
      insights: ['Markdown parsing works']
    };
    
    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      '```json\n' + JSON.stringify(mockParsedInsights) + '\n```'
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe('Markdown Test');
    expect(result.insights).toContain('Markdown parsing works');
  });

  it('should handle generic code blocks', async () => {
    // Arrange
    const query = 'test query';
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: []
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: []
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75
      },
      period: { from: '2024-01-01', to: '2024-01-07' }
    };
    const mockParsedInsights = {
      title: 'Generic Code Block',
      summary: 'Testing generic code blocks',
      insights: ['Generic parsing works']
    };
    
    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      '```\n' + JSON.stringify(mockParsedInsights) + '\n```'
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe('Generic Code Block');
    expect(result.insights).toContain('Generic parsing works');
  });

  it('should handle invalid JSON response', async () => {
    // Arrange
    const query = 'test query';
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: []
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: []
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75
      },
      period: { from: '2024-01-01', to: '2024-01-07' }
    };
    
    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      'invalid json response'
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe('Analysis Error');
    expect(result.summary).toBe('Unable to process your query at this time. Please try again.');
  });

  it('should handle missing required fields in response', async () => {
    // Arrange
    const query = 'test query';
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: []
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: []
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75
      },
      period: { from: '2024-01-01', to: '2024-01-07' }
    };
    
    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify({ title: 'Missing Fields' }) // Missing summary and insights
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe('Analysis Error');
    expect(result.summary).toBe('Unable to process your query at this time. Please try again.');
  });

  it('should filter non-string insights', async () => {
    // Arrange
    const query = 'test query';
    const mockTeamInsights = {
      availability: {
        totalPlannedHours: 0,
        totalActualHours: 0,
        teamAvailabilityPercentage: 0,
        userAvailabilities: []
      },
      billability: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        teamBillabilityPercentage: 0,
        userBillabilities: []
      },
      trend: {
        actualBillabilityPercentage: 0,
        idealBillabilityPercentage: 75,
        isOnTarget: false,
        variance: -75
      },
      period: { from: '2024-01-01', to: '2024-01-07' }
    };
    const mockParsedInsights = {
      title: 'Filter Test',
      summary: 'Testing insight filtering',
      insights: ['Valid insight', 123, null, 'Another valid insight']
    };
    
    mockTeamDataService.getTeamInsights.mockResolvedValue(mockTeamInsights);
    mockGeminiService.prototype.generateInsights.mockResolvedValue(
      JSON.stringify(mockParsedInsights)
    );

    // Act
    const result = await processQueryWithAI(query);

    // Assert
    expect(result.title).toBe('Filter Test');
    expect(result.insights).toEqual(['Valid insight', 'Another valid insight']);
  });
});
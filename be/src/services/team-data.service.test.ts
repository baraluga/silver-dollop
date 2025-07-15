import { TeamDataService } from './team-data.service';
import { TempoService } from './tempo.service';
import { AvailabilityService } from './availability.service';
import { BillabilityService } from './billability.service';

jest.mock('./tempo.service');
jest.mock('./availability.service');
jest.mock('./billability.service');

describe('TeamDataService', () => {
  let teamDataService: TeamDataService;
  let mockTempoService: jest.Mocked<TempoService>;
  let mockAvailabilityService: jest.Mocked<AvailabilityService>;
  let mockBillabilityService: jest.Mocked<BillabilityService>;

  beforeEach(() => {
    mockTempoService = {
      getPlans: jest.fn(),
      getWorklogs: jest.fn(),
      getTeamData: jest.fn()
    } as any;

    mockAvailabilityService = {
      calculateTeamAvailability: jest.fn(),
      calculateUserAvailability: jest.fn()
    } as any;

    mockBillabilityService = {
      calculateTeamBillability: jest.fn(),
      analyzeBillabilityTrend: jest.fn(),
      calculateUserBillability: jest.fn()
    } as any;

    teamDataService = new TeamDataService(
      mockTempoService,
      {
        availability: mockAvailabilityService,
        billability: mockBillabilityService
      }
    );
  });

  describe('getTeamInsights', () => {
    it('should aggregate team data successfully', async () => {
      const mockPlans = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          plannedSeconds: 28800,
          startDate: '2024-01-01',
          endDate: '2024-01-01'
        }
      ];

      const mockWorklogs = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 21600,
          billableSeconds: 16200,
          startDate: '2024-01-01',
          description: 'Work done'
        }
      ];

      const mockAvailability = {
        totalPlannedHours: 8,
        totalActualHours: 6,
        teamAvailabilityPercentage: 75,
        userAvailabilities: []
      };

      const mockBillability = {
        totalHours: 6,
        billableHours: 4.5,
        nonBillableHours: 1.5,
        teamBillabilityPercentage: 75,
        userBillabilities: []
      };

      const mockTrend = {
        actualBillabilityPercentage: 75,
        idealBillabilityPercentage: 75,
        isOnTarget: true,
        variance: 0
      };

      mockTempoService.getPlans.mockResolvedValue(mockPlans);
      mockTempoService.getWorklogs.mockResolvedValue(mockWorklogs);
      mockAvailabilityService.calculateTeamAvailability.mockReturnValue(mockAvailability);
      mockBillabilityService.calculateTeamBillability.mockReturnValue(mockBillability);
      mockBillabilityService.analyzeBillabilityTrend.mockReturnValue(mockTrend);

      const result = await teamDataService.getTeamInsights({ from: '2024-01-01', to: '2024-01-01' });

      expect(result.availability).toEqual(mockAvailability);
      expect(result.billability).toEqual(mockBillability);
      expect(result.trend).toEqual(mockTrend);
      expect(result.period.from).toBe('2024-01-01');
      expect(result.period.to).toBe('2024-01-01');
    });

    it('should handle tempo service errors', async () => {
      const error = new Error('Tempo API error');
      mockTempoService.getPlans.mockRejectedValue(error);

      await expect(teamDataService.getTeamInsights({ from: '2024-01-01', to: '2024-01-01' }))
        .rejects.toThrow('Failed to fetch tempo data: Tempo API error');
    });
  });

  describe('getUserInsights', () => {
    it('should get individual user insights', async () => {
      const mockPlans = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          plannedSeconds: 28800,
          startDate: '2024-01-01',
          endDate: '2024-01-01'
        }
      ];

      const mockWorklogs = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 21600,
          billableSeconds: 16200,
          startDate: '2024-01-01',
          description: 'Work done'
        }
      ];

      const mockAvailability = {
        userId: 'user1',
        userName: 'John Doe',
        plannedHours: 8,
        actualHours: 6,
        availabilityPercentage: 75
      };

      const mockBillability = {
        userId: 'user1',
        userName: 'John Doe',
        totalHours: 6,
        billableHours: 4.5,
        nonBillableHours: 1.5,
        billabilityPercentage: 75
      };

      mockTempoService.getPlans.mockResolvedValue(mockPlans);
      mockTempoService.getWorklogs.mockResolvedValue(mockWorklogs);
      mockAvailabilityService.calculateUserAvailability.mockReturnValue(mockAvailability);
      mockBillabilityService.calculateUserBillability.mockReturnValue(mockBillability);

      const result = await teamDataService.getUserInsights('user1', { from: '2024-01-01', to: '2024-01-01' });

      expect(result.availability).toEqual(mockAvailability);
      expect(result.billability).toEqual(mockBillability);
      expect(result.period.from).toBe('2024-01-01');
      expect(result.period.to).toBe('2024-01-01');
    });

    it('should handle user insights errors', async () => {
      const error = new Error('User data error');
      mockTempoService.getPlans.mockRejectedValue(error);

      await expect(teamDataService.getUserInsights('user1', { from: '2024-01-01', to: '2024-01-01' }))
        .rejects.toThrow('Failed to fetch tempo data: User data error');
    });
  });
});
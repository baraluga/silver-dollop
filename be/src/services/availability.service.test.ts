import { AvailabilityService } from './availability.service';
import { TempoPlan, TempoWorklog } from '../types/tempo.interfaces';

describe('AvailabilityService', () => {
  let availabilityService: AvailabilityService;

  beforeEach(() => {
    availabilityService = new AvailabilityService();
  });

  describe('calculateUserAvailability', () => {
    it('should calculate availability percentage for a user', () => {
      const plans: TempoPlan[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          plannedSeconds: 28800, // 8 hours
          startDate: '2024-01-01',
          endDate: '2024-01-01'
        }
      ];

      const worklogs: TempoWorklog[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 21600, // 6 hours
          billableSeconds: 21600,
          startDate: '2024-01-01',
          description: 'Work done'
        }
      ];

      const result = availabilityService.calculateUserAvailability('user1', { plans, worklogs });

      expect(result.plannedHours).toBe(8);
      expect(result.actualHours).toBe(6);
      expect(result.availabilityPercentage).toBe(75);
    });

    it('should return zero availability when no plans exist', () => {
      const plans: TempoPlan[] = [];
      const worklogs: TempoWorklog[] = [];

      const result = availabilityService.calculateUserAvailability('user1', { plans, worklogs });

      expect(result.plannedHours).toBe(0);
      expect(result.actualHours).toBe(0);
      expect(result.availabilityPercentage).toBe(0);
    });

    it('should handle user with no worklogs', () => {
      const plans: TempoPlan[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          plannedSeconds: 28800, // 8 hours
          startDate: '2024-01-01',
          endDate: '2024-01-01'
        }
      ];

      const worklogs: TempoWorklog[] = [];

      const result = availabilityService.calculateUserAvailability('user1', { plans, worklogs });

      expect(result.plannedHours).toBe(8);
      expect(result.actualHours).toBe(0);
      expect(result.availabilityPercentage).toBe(0);
    });

    it('should return Unknown User when user not found in plans or worklogs', () => {
      const plans: TempoPlan[] = [];
      const worklogs: TempoWorklog[] = [];

      const result = availabilityService.calculateUserAvailability('unknown-user', { plans, worklogs });

      expect(result.userName).toBe('Unknown User');
    });
  });

  describe('calculateTeamAvailability', () => {
    it('should calculate team availability summary', () => {
      const plans: TempoPlan[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          plannedSeconds: 28800, // 8 hours
          startDate: '2024-01-01',
          endDate: '2024-01-01'
        },
        {
          id: '2',
          user: { accountId: 'user2', displayName: 'Jane Smith' },
          plannedSeconds: 28800, // 8 hours
          startDate: '2024-01-01',
          endDate: '2024-01-01'
        }
      ];

      const worklogs: TempoWorklog[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 21600, // 6 hours
          billableSeconds: 21600,
          startDate: '2024-01-01',
          description: 'Work done'
        },
        {
          id: '2',
          user: { accountId: 'user2', displayName: 'Jane Smith' },
          timeSpentSeconds: 28800, // 8 hours
          billableSeconds: 28800,
          startDate: '2024-01-01',
          description: 'Work done'
        }
      ];

      const result = availabilityService.calculateTeamAvailability({ plans, worklogs });

      expect(result.totalPlannedHours).toBe(16);
      expect(result.totalActualHours).toBe(14);
      expect(result.teamAvailabilityPercentage).toBe(87.5);
      expect(result.userAvailabilities).toHaveLength(2);
    });

    it('should handle empty plans and worklogs', () => {
      const plans: TempoPlan[] = [];
      const worklogs: TempoWorklog[] = [];

      const result = availabilityService.calculateTeamAvailability({ plans, worklogs });

      expect(result.totalPlannedHours).toBe(0);
      expect(result.totalActualHours).toBe(0);
      expect(result.teamAvailabilityPercentage).toBe(0);
      expect(result.userAvailabilities).toHaveLength(0);
    });
  });
});
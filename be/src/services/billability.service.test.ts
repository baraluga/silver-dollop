import { BillabilityService } from './billability.service';
import { TempoWorklog } from '../types/tempo.interfaces';

describe('BillabilityService', () => {
  let billabilityService: BillabilityService;

  beforeEach(() => {
    billabilityService = new BillabilityService();
  });

  describe('calculateUserBillability', () => {
    it('should calculate billability percentage for a user', () => {
      const worklogs: TempoWorklog[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 28800, // 8 hours
          billableSeconds: 21600, // 6 hours
          startDate: '2024-01-01',
          description: 'Billable work'
        }
      ];

      const result = billabilityService.calculateUserBillability('user1', worklogs);

      expect(result.totalHours).toBe(8);
      expect(result.billableHours).toBe(6);
      expect(result.nonBillableHours).toBe(2);
      expect(result.billabilityPercentage).toBe(75);
    });

    it('should return zero billability when no worklogs exist', () => {
      const worklogs: TempoWorklog[] = [];

      const result = billabilityService.calculateUserBillability('user1', worklogs);

      expect(result.totalHours).toBe(0);
      expect(result.billableHours).toBe(0);
      expect(result.nonBillableHours).toBe(0);
      expect(result.billabilityPercentage).toBe(0);
    });

    it('should handle user with no billable hours', () => {
      const worklogs: TempoWorklog[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 28800, // 8 hours
          billableSeconds: 0, // 0 hours
          startDate: '2024-01-01',
          description: 'Non-billable work'
        }
      ];

      const result = billabilityService.calculateUserBillability('user1', worklogs);

      expect(result.totalHours).toBe(8);
      expect(result.billableHours).toBe(0);
      expect(result.nonBillableHours).toBe(8);
      expect(result.billabilityPercentage).toBe(0);
    });
  });

  describe('calculateTeamBillability', () => {
    it('should calculate team billability summary', () => {
      const worklogs: TempoWorklog[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 28800, // 8 hours
          billableSeconds: 21600, // 6 hours
          startDate: '2024-01-01',
          description: 'Billable work'
        },
        {
          id: '2',
          user: { accountId: 'user2', displayName: 'Jane Smith' },
          timeSpentSeconds: 28800, // 8 hours
          billableSeconds: 28800, // 8 hours
          startDate: '2024-01-01',
          description: 'Billable work'
        }
      ];

      const result = billabilityService.calculateTeamBillability(worklogs);

      expect(result.totalHours).toBe(16);
      expect(result.billableHours).toBe(14);
      expect(result.nonBillableHours).toBe(2);
      expect(result.teamBillabilityPercentage).toBe(87.5);
      expect(result.userBillabilities).toHaveLength(2);
    });

    it('should handle empty worklogs', () => {
      const worklogs: TempoWorklog[] = [];

      const result = billabilityService.calculateTeamBillability(worklogs);

      expect(result.totalHours).toBe(0);
      expect(result.billableHours).toBe(0);
      expect(result.nonBillableHours).toBe(0);
      expect(result.teamBillabilityPercentage).toBe(0);
      expect(result.userBillabilities).toHaveLength(0);
    });
  });

  describe('analyzeBillabilityTrend', () => {
    it('should analyze billability against ideal ratio', () => {
      const worklogs: TempoWorklog[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 28800, // 8 hours
          billableSeconds: 21600, // 6 hours (75%)
          startDate: '2024-01-01',
          description: 'Work'
        }
      ];

      const result = billabilityService.analyzeBillabilityTrend(worklogs);

      expect(result.actualBillabilityPercentage).toBe(75);
      expect(result.idealBillabilityPercentage).toBe(75);
      expect(result.isOnTarget).toBe(true);
      expect(result.variance).toBe(0);
    });

    it('should identify below target billability', () => {
      const worklogs: TempoWorklog[] = [
        {
          id: '1',
          user: { accountId: 'user1', displayName: 'John Doe' },
          timeSpentSeconds: 28800, // 8 hours
          billableSeconds: 14400, // 4 hours (50%)
          startDate: '2024-01-01',
          description: 'Work'
        }
      ];

      const result = billabilityService.analyzeBillabilityTrend(worklogs);

      expect(result.actualBillabilityPercentage).toBe(50);
      expect(result.idealBillabilityPercentage).toBe(75);
      expect(result.isOnTarget).toBe(false);
      expect(result.variance).toBe(-25);
    });
  });
});
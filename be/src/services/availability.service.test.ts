import { AvailabilityService } from './availability.service';
import { TempoPlan, TempoWorklog } from '../types/tempo.interfaces';
import { TestDataFactory } from '../util/test-data-factory';

describe('AvailabilityService', () => {
  let availabilityService: AvailabilityService;

  beforeEach(() => {
    availabilityService = new AvailabilityService();
  });

  describe('calculateUserAvailability', () => {
    it('should calculate availability percentage for a user', () => {
      const plans: TempoPlan[] = [TestDataFactory.createTempoPlan()];
      const worklogs: TempoWorklog[] = [TestDataFactory.createTempoWorklog()];

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
      const plans: TempoPlan[] = [TestDataFactory.createTempoPlan()];
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
        TestDataFactory.createTempoPlan(),
        TestDataFactory.createTempoPlan({
          id: '2',
          assignee: TestDataFactory.createTempoUser({
            accountId: 'user2',
            displayName: 'Jane Smith'
          })
        })
      ];

      const worklogs: TempoWorklog[] = [
        TestDataFactory.createTempoWorklog(),
        TestDataFactory.createTempoWorklog({
          id: '2',
          author: TestDataFactory.createTempoUser({
            accountId: 'user2',
            displayName: 'Jane Smith'
          }),
          timeSpentSeconds: 28800, // 8 hours
          billableSeconds: 28800
        })
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

  describe('calculateUserAvailability', () => {
    it('should handle case where user has no plans or worklogs', () => {
      const plans: TempoPlan[] = [];
      const worklogs: TempoWorklog[] = [];

      const result = availabilityService.calculateUserAvailability('user1', { plans, worklogs });

      expect(result.plannedHours).toBe(0);
      expect(result.actualHours).toBe(0);
      expect(result.availabilityPercentage).toBe(0);
      expect(result.userId).toBe('user1');
      expect(result.userName).toBe('Unknown User');
    });

    it('should handle case where user not found in worklogs', () => {
      const plans: TempoPlan[] = [];
      const worklogs: TempoWorklog[] = [
        TestDataFactory.createTempoWorklog({
          author: TestDataFactory.createTempoUser({
            accountId: 'user2',
            displayName: 'Jane Smith'
          })
        })
      ];

      const result = availabilityService.calculateUserAvailability('user1', { plans, worklogs });

      expect(result.plannedHours).toBe(0);
      expect(result.actualHours).toBe(0);
      expect(result.availabilityPercentage).toBe(0);
      expect(result.userId).toBe('user1');
      expect(result.userName).toBe('Unknown User');
    });

    it('should handle case where user has plans but no worklogs', () => {
      const plans: TempoPlan[] = [TestDataFactory.createTempoPlan()];
      const worklogs: TempoWorklog[] = [];

      const result = availabilityService.calculateUserAvailability('user1', { plans, worklogs });

      expect(result.plannedHours).toBe(8);
      expect(result.actualHours).toBe(0);
      expect(result.availabilityPercentage).toBe(0);
      expect(result.userId).toBe('user1');
      expect(result.userName).toBe('John Doe');
    });

    it('should handle case where user has worklogs but no plans', () => {
      const plans: TempoPlan[] = [];
      const worklogs: TempoWorklog[] = [TestDataFactory.createTempoWorklog()];

      const result = availabilityService.calculateUserAvailability('user1', { plans, worklogs });

      expect(result.plannedHours).toBe(0);
      expect(result.actualHours).toBe(6);
      expect(result.availabilityPercentage).toBe(0);
      expect(result.userId).toBe('user1');
      expect(result.userName).toBe('John Doe');
    });
  });
});